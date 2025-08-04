import type { Answer, Question } from "@/types/quiz";

// Migrate legacy QuestionData to new Question format
export function migrateQuestionData(legacyQuestion: any): Question {
  return {
    id: legacyQuestion.id || `q_${Date.now()}_${Math.random()}`,
    question: legacyQuestion.question || "",
    type: legacyQuestion.type || "MULTIPLE_CHOICE",
    difficulty: legacyQuestion.difficulty || "EASY",
    bloom_level: "REMEMBER", // Default value
    points: legacyQuestion.points || 1,
    order_index: legacyQuestion.order_index || 0,
    explanation: legacyQuestion.explanation,
    answers: (legacyQuestion.answers || []).map(
      (answer: any, index: number) => ({
        id: answer.id || `answer_${Date.now()}_${Math.random()}`,
        text: answer.text || "",
        isCorrect: answer.isCorrect || false,
        order_index: answer.order_index || index + 1,
        explanation: answer.explanation,
      }),
    ),
    shortAnswerText: legacyQuestion.shortAnswerText,
    tags: legacyQuestion.tags || [],
    image_url: legacyQuestion.image_url,
  };
}

// Migrate legacy Answer to new Answer format
export function migrateAnswer(legacyAnswer: any, index: number): Answer {
  return {
    id: legacyAnswer.id || `answer_${Date.now()}_${Math.random()}`,
    text: legacyAnswer.text || "",
    isCorrect: legacyAnswer.isCorrect || false,
    order_index: legacyAnswer.order_index || index + 1,
    explanation: legacyAnswer.explanation,
  };
}

// Validate and fix legacy data
export function validateAndFixLegacyData(data: any): any {
  if (!data) return null;

  // Fix missing required fields
  if (!data.id) {
    data.id = `legacy_${Date.now()}_${Math.random()}`;
  }

  if (!data.type) {
    data.type = "MULTIPLE_CHOICE";
  }

  if (!data.points) {
    data.points = 1;
  }

  if (!data.difficulty) {
    data.difficulty = "EASY";
  }

  // Fix answers
  if (data.answers && Array.isArray(data.answers)) {
    data.answers = data.answers.map((answer: any, index: number) => {
      if (!answer.id) {
        answer.id = `answer_${Date.now()}_${Math.random()}`;
      }
      if (typeof answer.isCorrect !== "boolean") {
        answer.isCorrect = false;
      }
      if (!answer.order_index) {
        answer.order_index = index + 1;
      }
      return answer;
    });
  }

  return data;
}

// Convert old question types to new ones
export function convertQuestionType(
  oldType: string,
): "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "FREE_RESPONSE" {
  const typeMap: Record<
    string,
    "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "FREE_RESPONSE"
  > = {
    SHORT_ANSWER: "FILL_BLANK",
    ESSAY: "FREE_RESPONSE",
    MATCHING: "MULTIPLE_CHOICE", // Fallback
  };

  return typeMap[oldType] || "MULTIPLE_CHOICE";
}

// Migrate entire quiz data
export function migrateQuizData(legacyQuiz: any) {
  if (!legacyQuiz) return null;

  return {
    ...legacyQuiz,
    questions: (legacyQuiz.questions || []).map((question: any) => {
      const migratedQuestion = migrateQuestionData(question);
      migratedQuestion.type = convertQuestionType(migratedQuestion.type);
      return migratedQuestion;
    }),
  };
}
