import type {
  FlashcardApiResponse,
  FlashcardSet,
  FlashcardSetApiResponse,
  FlashcardStats,
} from "@/types/flashcard";

class FlashcardService {
  private baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  async getAllFlashcards(accessToken?: string): Promise<FlashcardApiResponse> {
    try {
      console.log("🚀 FlashcardService: getAllFlashcards called");
      console.log("🔗 FlashcardService: baseUrl:", this.baseUrl);
      console.log(
        "🔑 FlashcardService: accessToken:",
        accessToken ? "✅ Provided" : "❌ Not provided",
      );

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${this.baseUrl}/api/v1/student/flashcards`,
        {
          method: "GET",
          headers,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FlashcardApiResponse = await response.json();

      return data;
    } catch (error) {
      console.error("❌ FlashcardService: Error fetching flashcards:", error);
      throw error;
    }
  }

  async getFlashcardById(
    id: number,
    accessToken?: string,
  ): Promise<FlashcardSet> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${this.baseUrl}/api/v1/student/flashcards/${id}`,
        {
          method: "GET",
          headers,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: FlashcardSetApiResponse = await response.json();

      // Extract data from the wrapper object
      const data: FlashcardSet = apiResponse.data;
      console.log(
        "🔍 FlashcardService.getFlashcardById: Extracted data:",
        data,
      );
      console.log(
        "🔍 FlashcardService.getFlashcardById: data.flashcards:",
        data.flashcards,
      );
      return data;
    } catch (error) {
      console.error("Error fetching flashcard:", error);
      throw error;
    }
  }

  async updateFlashcardSet(
    id: number,
    flashcardSet: Partial<FlashcardSet>,
    accessToken?: string,
  ): Promise<FlashcardSet> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(flashcardSet),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: FlashcardSetApiResponse = await response.json();
      console.log(
        "🔄 FlashcardService.updateFlashcardSet: API response:",
        apiResponse,
      );

      return apiResponse.data;
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error updating flashcard set:",
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
