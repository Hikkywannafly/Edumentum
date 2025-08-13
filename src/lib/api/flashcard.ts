import type {
  FlashcardApiResponse,
  FlashcardSet,
  FlashcardSetApiResponse,
  FlashcardStats,
} from "@/types/flashcard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateFlashcardSetRequest {
  title: string;
  description: string;
  isPublic: boolean;
  flashcards: Array<{
    question: string;
    choices: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

export interface UpdateFlashcardSetRequest {
  title?: string;
  description?: string;
  isPublic?: boolean;
  flashcards?: Array<{
    id?: number;
    question: string;
    choices: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

class FlashcardService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const accessToken = localStorage.getItem("accessToken");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getAllFlashcards(): Promise<FlashcardApiResponse> {
    try {
      const response = await this.request<FlashcardApiResponse>(
        "/student/flashcards",
      );
      return response;
    } catch (error) {
      console.error("❌ FlashcardService: Error fetching flashcards:", error);
      throw error;
    }
  }

  async getFlashcardById(id: number): Promise<FlashcardSet> {
    try {
      const response = await this.request<FlashcardSetApiResponse>(
        `/student/flashcards/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("❌ FlashcardService: Error fetching flashcard:", error);
      throw error;
    }
  }

  async createFlashcardSet(
    flashcardSetData: CreateFlashcardSetRequest,
  ): Promise<FlashcardSet> {
    try {
      const response = await this.request<FlashcardSetApiResponse>(
        "/student/flashcards",
        {
          method: "POST",
          body: JSON.stringify(flashcardSetData),
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error creating flashcard set:",
        error,
      );
      throw error;
    }
  }

  async updateFlashcardSet(
    id: number,
    flashcardSetData: UpdateFlashcardSetRequest,
  ): Promise<FlashcardSet> {
    try {
      // Use Next.js API route for CORS handling (proxy pattern)
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flashcardSetData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const apiResponse: FlashcardSetApiResponse = await response.json();
      return apiResponse.data;
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error updating flashcard set:",
        error,
      );
      throw error;
    }
  }

  async deleteFlashcardSet(id: number): Promise<void> {
    try {
      await this.request(`/student/flashcards/${id}`, {
        method: "DELETE",
      });
      console.log("✅ Flashcard set deleted successfully");
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error deleting flashcard set:",
        error,
      );
      throw error;
    }
  }

  calculateStats(flashcards: FlashcardSet[]): FlashcardStats {
    const totalDecks = flashcards.length;
    const totalFlashcards = flashcards.reduce(
      (sum, deck) => sum + deck.flashcards.length,
      0,
    );

    // For now, returning default values since we don't have score/study time data
    return {
      totalFlashcards,
      totalDecks,
      averageScore: 0, // This would need to come from user progress data
      studyTime: "0h", // This would need to come from user activity data
    };
  }
}

export const flashcardService = new FlashcardService();
