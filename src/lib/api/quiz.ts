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

export interface DraftData {
  title: string;
  description: string;
  questions: any[];
  metadata?: {
    sourceFiles?: string[];
    sourceType?: "FILE" | "MANUAL" | "AI_GENERATED";
  };
}

export interface QuizDraft {
  id: string;
  title: string;
  description: string;
  draftData: DraftData;
  sourceType?: string;
  sourceFiles?: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CreateDraftRequest {
  title: string;
  description: string;
  draftData: DraftData;
  sourceType?: "FILE" | "MANUAL" | "AI_GENERATED";
  sourceFiles?: string[];
}

export interface UpdateDraftRequest {
  title?: string;
  description?: string;
  draftData?: DraftData;
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

  // ============ DRAFT APIs ============

  async createDraft(draftRequest: CreateDraftRequest): Promise<QuizDraft> {
    const response = await this.request<QuizDraft>("/student/quiz/drafts", {
      method: "POST",
      body: JSON.stringify(draftRequest),
    });
    return response;
  }

  async getDrafts(): Promise<QuizDraft[]> {
    const response = await this.request<QuizDraft[]>("/student/quiz/drafts");
    return response;
  }

  async getDraftById(id: string): Promise<QuizDraft> {
    const response = await this.request<QuizDraft>(
      `/student/quiz/drafts/${id}`,
    );
    return response;
  }

  async updateDraft(
    id: string,
    draftRequest: UpdateDraftRequest,
  ): Promise<QuizDraft> {
    const response = await this.request<QuizDraft>(
      `/student/quiz/drafts/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(draftRequest),
      },
    );
    return response;
  }

  async deleteDraft(id: string): Promise<void> {
    await this.request(`/student/quiz/drafts/${id}`, {
      method: "DELETE",
    });
  }

  async createQuizFromDraft(draftId: string): Promise<QuizResponse> {
    const response = await this.request<QuizResponse>(
      `/student/quiz/drafts/${draftId}/publish`,
      {
        method: "POST",
      },
    );
    return response;
  }
}

export const quizAPI = new QuizAPI();
