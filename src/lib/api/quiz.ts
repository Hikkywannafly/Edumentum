import type {
  CreateQuizRequest,
  QuizResponse as QuizResponseType,
} from "@/types/quiz";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Legacy interface for backward compatibility
export interface LegacyQuizData {
  title: string;
  description: string;
  visibility: boolean;
  total: number;
  topic: string;
  quizCreationType: "FILE_UPLOAD" | "AI_GENERATED" | "MANUAL";
  questions: any[];
}

export interface QuizResponse {
  id: string;
  title: string;
  description: string;
  message: string;
  success: boolean;
}

class QuizAPI {
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

  async createQuiz(quizData: LegacyQuizData): Promise<QuizResponse> {
    const response = await this.request<QuizResponse>("/student/quiz", {
      method: "POST",
      body: JSON.stringify(quizData),
    });

    return response;
  }

  async createQuizV2(
    quizRequest: CreateQuizRequest,
  ): Promise<QuizResponseType> {
    const response = await this.request<QuizResponseType>("/student/quiz", {
      method: "POST",
      body: JSON.stringify(quizRequest),
    });

    return response;
  }

  async getQuizzes(): Promise<any[]> {
    const response = await this.request<any[]>("/student/quiz");
    return response;
  }

  async getQuizById(id: string): Promise<any> {
    const response = await this.request<any>(`/student/quiz/${id}`);
    return response;
  }

  async deleteQuiz(id: string): Promise<void> {
    await this.request(`/student/quiz/${id}`, {
      method: "DELETE",
    });
  }
}

export const quizAPI = new QuizAPI();
