// ===== ENUMS & TYPES =====
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_BLANK"
  | "FREE_RESPONSE";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type BloomLevel =
  | "REMEMBER"
  | "UNDERSTAND"
  | "APPLY"
  | "ANALYZE"
  | "EVALUATE"
  | "CREATE";
export type Visibility = "PRIVATE" | "PUBLIC" | "UNLISTED";
export type Language = "AUTO" | "EN" | "VI" | "ZH" | "JA" | "KO";
export type QuizMode = "QUIZ" | "FLASHCARD" | "STUDY_GUIDE";
export type Task = "GENERATE_QUIZ" | "REVIEW" | "TEST";
export type ParsingMode = "FAST" | "BALANCED" | "THOROUGH";
export type SourceType =
  | "FILE"
  | "TEXT"
  | "LINK"
  | "DRIVE"
  | "MATERIAL"
  | "MEDIA"
  | "IMAGE"
  | "YOUTUBE";
export type AIModel = "GPT-4" | "CLAUDE-3" | "GEMINI" | "LOCAL";

// ===== CORE INTERFACES =====
export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  order_index: number;
  explanation?: string;
}

export interface Question {
  id: string;
  question: string; // HTML content from Tiptap
  type: QuestionType;
  difficulty: Difficulty;
  bloom_level: BloomLevel;
  points: number;
  order_index: number;
  explanation?: string;
  answers: Answer[];
  shortAnswerText?: string; // For FILL_BLANK and FREE_RESPONSE
  tags?: string[];
  image_url?: string;
}

// ===== QUIZ SETTINGS =====
export interface QuizSettings {
  visibility: Visibility;
  language: Language;
  question_type: QuestionType | "MIXED";
  number_of_questions: number;
  mode: QuizMode;
  difficulty: Difficulty;
  task: Task;
  parsing_mode: ParsingMode;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_explanations: boolean;
  allow_retry: boolean;
  time_limit_per_question?: number | null; // seconds
  passing_score: number; // percentage
}

// ===== SOURCE INFORMATION =====
export interface SourceInfo {
  type: SourceType;
  content: string; // URL, text content, or file references
  file_references?: string[]; // Array of file paths/IDs
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
    size?: number;
  };
}

// ===== AI INFORMATION =====
export interface AIInfo {
  is_ai_generated: boolean;
  model?: AIModel;
  prompt?: string;
  generation_settings?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  };
  processing_time?: number; // seconds
}

// ===== QUIZ DATA (JSONB) =====
export interface QuizData {
  questions: Question[];
  settings: QuizSettings;
  source_info: SourceInfo;
  ai_info: AIInfo;
  metadata: {
    total_questions: number;
    total_points: number;
    estimated_time: number; // minutes
    tags: string[];
    category?: string;
    subject?: string;
    grade_level?: string;
  };
}

// ===== DATABASE ENTITY =====
export interface QuizEntity {
  id: number;
  title: string;
  description?: string;
  user_id: number;
  category_id?: number;
  quiz_data: QuizData;
  created_at: string;
  updated_at: string;
}

// ===== API REQUEST/RESPONSE =====
export interface CreateQuizRequest {
  title: string;
  description?: string;
  category_id?: number;
  quiz_data: QuizData;
}

export interface UpdateQuizRequest {
  id: number;
  title?: string;
  description?: string;
  category_id?: number;
  quiz_data?: Partial<QuizData>;
}

export interface QuizResponse {
  id: number;
  title: string;
  description?: string;
  user_id: number;
  category_id?: number;
  quiz_data: QuizData;
  created_at: string;
  updated_at: string;
}

// ===== LEGACY INTERFACES (for backward compatibility) =====
export interface QuestionData {
  id: string;
  question: string;
  type: QuestionType;
  difficulty?: Difficulty;
  points?: number;
  explanation?: string;
  tags?: string[];
  answers: Answer[];
  shortAnswerText?: string;
}

// ===== UTILITY TYPES =====
export type QuizCreationType =
  | "FILE_UPLOAD"
  | "AI_GENERATED"
  | "MANUAL"
  | "TEMPLATE";
export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
