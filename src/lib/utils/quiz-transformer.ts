import type {
  AIInfo,
  CreateQuizRequest,
  Question,
  QuestionData,
  QuizData,
  QuizEntity,
  QuizSettings,
  SourceInfo,
} from "@/types/quiz";

// Default quiz settings
export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  visibility: "PRIVATE",
  language: "AUTO",
  question_type: "MIXED",
  number_of_questions: 10,
  mode: "QUIZ",
  difficulty: "EASY",
  task: "GENERATE_QUIZ",
  parsing_mode: "BALANCED",
  shuffle_questions: false,
  shuffle_answers: false,
  show_explanations: true,
  allow_retry: false,
  time_limit_per_question: null,
  passing_score: 70,
};

// Transform legacy QuestionData to new Question format
export function transformQuestionData(questionData: QuestionData): Question {
  return {
    id: questionData.id,
    question: questionData.question,
    type: questionData.type,
    difficulty: questionData.difficulty || "EASY",
    bloom_level: "REMEMBER", // Default value
    points: questionData.points || 1,
    order_index: 0, // Will be set by parent
    explanation: questionData.explanation,
    answers: questionData.answers.map((answer, index) => ({
      ...answer,
      order_index: index + 1,
    })),
    shortAnswerText: questionData.shortAnswerText,
  };
}

// Transform new Question to legacy QuestionData format
export function transformToQuestionData(question: Question): QuestionData {
  return {
    id: question.id,
    question: question.question,
    type: question.type,
    difficulty: question.difficulty,
    points: question.points,
    explanation: question.explanation,
    answers: question.answers,
    shortAnswerText: question.shortAnswerText,
  };
}

// Create QuizData from questions and settings
export function createQuizData(
  questions: Question[],
  settings?: Partial<QuizSettings>,
  sourceInfo?: Partial<SourceInfo>,
  aiInfo?: Partial<AIInfo>,
): QuizData {
  const finalSettings = { ...DEFAULT_QUIZ_SETTINGS, ...settings };

  // Add order_index to questions
  const orderedQuestions = questions.map((question, index) => ({
    ...question,
    order_index: index + 1,
  }));

  const totalPoints = orderedQuestions.reduce((sum, q) => sum + q.points, 0);
  const estimatedTime = Math.ceil(orderedQuestions.length * 1.5); // 1.5 minutes per question

  return {
    questions: orderedQuestions,
    settings: finalSettings,
    source_info: {
      type: "FILE",
      content: "",
      ...sourceInfo,
    },
    ai_info: {
      is_ai_generated: false,
      ...aiInfo,
    },
    metadata: {
      total_questions: orderedQuestions.length,
      total_points: totalPoints,
      estimated_time: estimatedTime,
      tags: [],
    },
  };
}

// Transform from legacy format to new format
export function transformLegacyToQuizData(
  title: string,
  description: string,
  questions: QuestionData[],
  settings?: Partial<QuizSettings>,
): CreateQuizRequest {
  const transformedQuestions = questions.map(transformQuestionData);
  const quizData = createQuizData(transformedQuestions, settings);

  return {
    title,
    description,
    quiz_data: quizData,
  };
}

// Transform QuizEntity to QuizData
export function extractQuizDataFromEntity(entity: QuizEntity): QuizData {
  return entity.quiz_data;
}

// Create default quiz settings based on creation type
export function getDefaultSettingsForType(
  creationType: "FILE_UPLOAD" | "AI_GENERATED" | "MANUAL" | "TEMPLATE",
): Partial<QuizSettings> {
  switch (creationType) {
    case "FILE_UPLOAD":
      return {
        parsing_mode: "BALANCED",
        task: "GENERATE_QUIZ",
        show_explanations: true,
      };
    case "AI_GENERATED":
      return {
        parsing_mode: "THOROUGH",
        task: "GENERATE_QUIZ",
        show_explanations: true,
        allow_retry: true,
      };
    case "MANUAL":
      return {
        parsing_mode: "FAST",
        task: "TEST",
        show_explanations: false,
      };
    case "TEMPLATE":
      return {
        parsing_mode: "FAST",
        task: "REVIEW",
        show_explanations: true,
        allow_retry: true,
      };
    default:
      return {};
  }
}

// Validate quiz data
export function validateQuizData(quizData: QuizData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!quizData.questions || quizData.questions.length === 0) {
    errors.push("Quiz must have at least one question");
  }

  quizData.questions.forEach((question, index) => {
    if (!question.question.trim()) {
      errors.push(`Question ${index + 1} cannot be empty`);
    }

    if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
      if (!question.answers || question.answers.length === 0) {
        errors.push(`Question ${index + 1} must have at least one answer`);
      }

      const correctAnswers = question.answers.filter((a) => a.isCorrect);
      if (correctAnswers.length === 0) {
        errors.push(
          `Question ${index + 1} must have at least one correct answer`,
        );
      }
    }

    if (question.type === "FILL_BLANK" || question.type === "FREE_RESPONSE") {
      if (!question.shortAnswerText?.trim()) {
        errors.push(`Question ${index + 1} must have a correct answer text`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate quiz metadata from questions
export function generateQuizMetadata(
  questions: Question[],
): QuizData["metadata"] {
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const estimatedTime = Math.ceil(questions.length * 1.5);

  // Extract tags from questions
  const allTags = questions.flatMap((q) => q.tags || []);
  const uniqueTags = [...new Set(allTags)];

  // Detect subject/category from question content
  const subjectKeywords = {
    math: ["calculate", "equation", "formula", "number", "solve"],
    history: ["history", "historical", "war", "battle", "king", "emperor"],
    science: ["science", "chemical", "physics", "biology", "experiment"],
    language: ["grammar", "vocabulary", "sentence", "word", "language"],
  };

  let detectedSubject = "";
  const questionText = questions.map((q) => q.question.toLowerCase()).join(" ");

  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    if (keywords.some((keyword) => questionText.includes(keyword))) {
      detectedSubject = subject;
      break;
    }
  }

  return {
    total_questions: questions.length,
    total_points: totalPoints,
    estimated_time: estimatedTime,
    tags: uniqueTags,
    subject: detectedSubject || undefined,
  };
}
