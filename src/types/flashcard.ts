export interface FlashcardData {
  id: number;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  roles: Role[];
  isActive: boolean;
}

export interface Role {
  id: number;
  name: string;
}

export interface FlashcardSet {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  user: User;
  flashcards: FlashcardData[];
}

export interface FlashcardApiResponse {
  total: number;
  message: string;
  status: string;
  data: FlashcardSet[];
}

export interface FlashcardSetApiResponse {
  status: string;
  message: string;
  data: FlashcardSet;
}

export interface FlashcardStats {
  totalFlashcards: number;
  totalDecks: number;
  averageScore: number;
  studyTime: string;
}
