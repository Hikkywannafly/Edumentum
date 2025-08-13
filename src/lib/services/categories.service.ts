// Categories service for managing quiz categories
export interface CategoryData {
  categories: string[];
  count: number;
  lastUpdated: string;
}

const CATEGORIES_CACHE_KEY = "edumentum_categories";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class CategoriesService {
  private static instance: CategoriesService;
  private categories: string[] = [];
  private lastFetched = 0;

  private constructor() {}

  static getInstance(): CategoriesService {
    if (!CategoriesService.instance) {
      CategoriesService.instance = new CategoriesService();
    }
    return CategoriesService.instance;
  }

  /**
   * Get categories from cache or fetch from API
   */
  async getCategories(forceRefresh = false): Promise<string[]> {
    const now = Date.now();
    const shouldRefresh =
      forceRefresh ||
      now - this.lastFetched > CACHE_DURATION ||
      this.categories.length === 0;

    if (shouldRefresh) {
      try {
        await this.fetchAndCacheCategories();
      } catch (error) {
        console.warn(
          "Failed to fetch categories from API, using cached data:",
          error,
        );
        // Try to load from localStorage as fallback
        this.loadFromLocalStorage();
      }
    }

    return this.categories;
  }

  /**
   * Fetch categories from API and cache them
   */
  private async fetchAndCacheCategories(): Promise<void> {
    try {
      console.log("🔄 Fetching categories from API...");

      const response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CategoryData & { success: boolean } = await response.json();

      if (data.success && data.categories) {
        this.categories = data.categories;
        this.lastFetched = Date.now();

        // Cache in localStorage
        this.saveToLocalStorage({
          categories: data.categories,
          count: data.count,
          lastUpdated: data.lastUpdated,
        });

        console.log(
          `✅ Successfully fetched ${data.categories.length} categories`,
        );
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      throw error;
    }
  }

  /**
   * Save categories to localStorage
   */
  private saveToLocalStorage(data: CategoryData): void {
    try {
      const cacheData = {
        ...data,
        cachedAt: Date.now(),
      };
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(cacheData));
      console.log("💾 Categories cached to localStorage");
    } catch (error) {
      console.warn("Failed to save categories to localStorage:", error);
    }
  }

  /**
   * Load categories from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        const age = Date.now() - (data.cachedAt || 0);

        if (age < CACHE_DURATION) {
          this.categories = data.categories || [];
          this.lastFetched = data.cachedAt || 0;
          console.log(
            `📦 Loaded ${this.categories.length} categories from localStorage cache`,
          );
        } else {
          console.log("🗑️ localStorage cache expired, will fetch fresh data");
        }
      }
    } catch (error) {
      console.warn("Failed to load categories from localStorage:", error);
    }
  }

  /**
   * Get categories formatted for AI prompt (with fallback)
   */
  async getCategoriesForAI(): Promise<string> {
    try {
      const categories = await this.getCategories();

      if (categories.length === 0) {
        return this.getFallbackCategories();
      }

      // Group categories for better AI understanding
      const categoriesText = categories
        .slice(0, 50) // Limit to first 50 to avoid token limits
        .map((cat, index) => `${index + 1}. ${cat}`)
        .join("\n");

      return `Available categories to choose from (select the most appropriate one):
${categoriesText}

Instructions for category selection:
- Choose EXACTLY ONE category that best matches the quiz content
- Use the exact category name from the list above
- If no category perfectly matches, choose the closest one
- Do not create new categories`;
    } catch (error) {
      console.warn("Categories service failed, using fallback:", error);
      return this.getFallbackCategories();
    }
  }

  /**
   * Fallback categories when service is unavailable
   */
  private getFallbackCategories(): string {
    return `Available categories to choose from (select the most appropriate one):
1. General Knowledge
2. Science
3. Mathematics
4. Technology
5. Business
6. Arts
7. History
8. Literature
9. Language Learning
10. Health

Instructions for category selection:
- Choose EXACTLY ONE category that best matches the quiz content
- Use the exact category name from the list above
- If no category perfectly matches, choose the closest one`;
  }

  /**
   * Find the best matching category for given content
   */
  async findBestCategory(
    content: string,
    existingTags: string[] = [],
  ): Promise<string | null> {
    const categories = await this.getCategories();

    if (categories.length === 0) {
      return null;
    }

    // Simple keyword matching - in a real app you might use more sophisticated matching
    const contentLower = content.toLowerCase();
    const tagsLower = existingTags.map((tag) => tag.toLowerCase());

    // Look for direct matches first
    for (const category of categories) {
      const categoryLower = category.toLowerCase();
      if (
        contentLower.includes(categoryLower) ||
        tagsLower.some((tag) => tag.includes(categoryLower))
      ) {
        return category;
      }
    }

    // Look for partial matches
    const keywords = contentLower.split(/\s+/);
    for (const category of categories) {
      const categoryWords = category.toLowerCase().split(/\s+/);
      for (const word of categoryWords) {
        if (keywords.includes(word) && word.length > 3) {
          return category;
        }
      }
    }

    return null;
  }

  /**
   * Clear cache and force refresh
   */
  clearCache(): void {
    this.categories = [];
    this.lastFetched = 0;
    try {
      localStorage.removeItem(CATEGORIES_CACHE_KEY);
      console.log("🗑️ Categories cache cleared");
    } catch (error) {
      console.warn("Failed to clear categories cache:", error);
    }
  }

  /**
   * Add a new category (admin function)
   */
  async addCategory(category: string): Promise<boolean> {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: category.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh categories after adding
        await this.fetchAndCacheCategories();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to add category:", error);
      return false;
    }
  }
}

// Export singleton instance
export const categoriesService = CategoriesService.getInstance();
