import type { Answer, QuestionData } from "@/types/quiz";

// Re-export types for backward compatibility
export type { QuestionData, Answer };

export class ContentExtractor {
  extractQuestions(content: string): QuestionData[] {
    const questions: QuestionData[] = [];
    const lines = content.split("\n").filter((line) => line.trim());

    let currentQuestion: Partial<QuestionData> | null = null;
    let questionIndex = 0;
    let questionTextLines: string[] = [];
    let currentAnswerLines: string[] = [];
    let currentAnswerKey = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this is a new question (starts with number + dot)
      if (this.isNewQuestion(line)) {
        // Save previous question if exists
        if (currentQuestion) {
          // Save the last answer if exists
          if (currentAnswerLines.length > 0) {
            const lastAnswer = this.extractAnswerFromLines(
              currentAnswerLines,
              currentAnswerKey,
            );
            if (lastAnswer && currentQuestion.answers) {
              currentQuestion.answers.push(lastAnswer);
            }
          }

          currentQuestion.question = questionTextLines.join(" ").trim();
          questions.push(
            this.finalizeQuestion(currentQuestion, questionIndex++),
          );
        }

        // Start new question
        const questionText = this.extractQuestionText(line);
        currentQuestion = {
          id: `q_${questionIndex}`,
          question: questionText,
          type: this.detectQuestionType(line),
          points: 1,
          answers: [],
        };
        questionTextLines = [questionText];
        currentAnswerLines = [];
        currentAnswerKey = "";
      }
      // Check if this is an answer line (starts with A. B. C. D.)
      else if (currentQuestion && this.isAnswerLineStrict(line)) {
        // Save previous answer if exists
        if (currentAnswerLines.length > 0) {
          const answer = this.extractAnswerFromLines(
            currentAnswerLines,
            currentAnswerKey,
          );
          if (answer && currentQuestion.answers) {
            currentQuestion.answers.push(answer);
          }
        }

        // Start new answer
        const answerMatch = line.match(/^(\*?[A-Da-d])\.\s*(.+)$/);
        if (answerMatch) {
          currentAnswerKey = answerMatch[1];
          currentAnswerLines = [answerMatch[2]];
        }
      }
      // This line is continuation of question or answer
      else if (currentQuestion && line.length > 0) {
        if (this.isAnswerLineStrict(line)) {
          // This is actually an answer line (should have been caught above, but just in case)
          if (currentAnswerLines.length > 0) {
            const answer = this.extractAnswerFromLines(
              currentAnswerLines,
              currentAnswerKey,
            );
            if (answer && currentQuestion.answers) {
              currentQuestion.answers.push(answer);
            }
          }

          const answerMatch = line.match(/^(\*?[A-Da-d])\.\s*(.+)$/);
          if (answerMatch) {
            currentAnswerKey = answerMatch[1];
            currentAnswerLines = [answerMatch[2]];
          }
        } else if (currentAnswerLines.length > 0) {
          // This is continuation of current answer
          currentAnswerLines.push(line);
        } else if (this.isLikelyQuestionContinuation(line)) {
          // This is continuation of current question
          questionTextLines.push(line);
        }
      }
    }

    // Save the last question
    if (currentQuestion) {
      // Save the last answer if exists
      if (currentAnswerLines.length > 0) {
        const lastAnswer = this.extractAnswerFromLines(
          currentAnswerLines,
          currentAnswerKey,
        );
        if (lastAnswer && currentQuestion.answers) {
          currentQuestion.answers.push(lastAnswer);
        }
      }

      currentQuestion.question = questionTextLines.join(" ").trim();
      questions.push(this.finalizeQuestion(currentQuestion, questionIndex));
    }

    return questions;
  }

  private isQuestionLine(line: string): boolean {
    const questionPatterns = [
      /^Câu\s+\d+\./i, // Câu 1. hoặc Câu 25.
      /^Câu\s+\d+/i, // Câu 1 (không có dấu chấm)
      /^\d+\.\s+/, // 1. Nội dung
      /^Q\d+\.\s/, // Q1. (viết theo dạng tiếng Anh)
      /^Question\s+\d+/i, // Question 1
      /^\*\s/, // * Dạng bullet
      /^-\s/, // - Dạng bullet
    ];

    // Check if line starts with a question pattern
    const isQuestion = questionPatterns.some((pattern) => pattern.test(line));

    // Also check if it's not an answer line (to avoid confusion)
    const isAnswer = this.isAnswerLineStrict(line);

    return isQuestion && !isAnswer;
  }

  private isNewQuestion(line: string): boolean {
    // Support both "Câu 1." and "1." formats, with or without dot
    // Also support "13." and "13" (without space after dot)
    return /^(\d+|Câu\s+\d+)\.?\s*/.test(line);
  }

  private isAnswerLine(line: string): boolean {
    const answerPatterns = [
      /^[A-Da-d]\.\s/, // A. Answer hoặc a. Answer
      /^\*[A-Da-d]\.\s/, // *A. Answer hoặc *a. Answer (correct answer)
    ];

    return answerPatterns.some((pattern) => pattern.test(line));
  }

  private isAnswerLineStrict(line: string): boolean {
    // More strict check for answer lines
    return /^(\*?[A-Da-d])\.\s/.test(line);
  }

  private isLikelyQuestionContinuation(line: string): boolean {
    // Không phải đáp án, không phải dòng bắt đầu câu hỏi, và không rỗng
    return (
      !this.isAnswerLineStrict(line) &&
      !this.isNewQuestion(line) &&
      line.length > 0
    );
  }

  private extractQuestionText(line: string): string {
    return line
      .replace(
        /^(Câu\s+\d+\.?|\d+\.\s*|Q\d+\.\s*|Question\s+\d+\.?\s*|\*\s*|-\s*)/i,
        "",
      )
      .trim();
  }

  private extractInlineAnswers(_line: string): Answer[] {
    // Standard format doesn't support inline answers
    return [];
  }

  private extractAnswer(line: string): Answer | null {
    // Handle standard answer patterns: A. or *A. (both uppercase and lowercase)
    const match = line.match(/^(\*?[A-Da-d])\.\s*(.+)$/);

    if (!match) return null;

    const answerText = match[2].trim();
    const isCorrect = match[1].startsWith("*");

    return {
      id: `answer_${Date.now()}_${Math.random()}`,
      text: answerText,
      isCorrect: isCorrect,
      order_index: 0, // Will be set by parent
    };
  }

  private extractAnswerFromLines(
    answerLines: string[],
    answerKey: string,
  ): Answer | null {
    if (answerLines.length === 0 || !answerKey) return null;

    const answerText = answerLines.join(" ").trim();
    const isCorrect = answerKey.startsWith("*");

    return {
      id: `answer_${Date.now()}_${Math.random()}`,
      text: answerText,
      isCorrect: isCorrect,
      order_index: 0, // Will be set by parent
    };
  }

  private detectQuestionType(_line: string): QuestionData["type"] {
    // const lowerLine = line.toLowerCase();

    // if (lowerLine.includes("true") || lowerLine.includes("false") ||
    //   lowerLine.includes("đúng") || lowerLine.includes("sai")) {
    //   return "TRUE_FALSE";
    // }

    // if (
    //   lowerLine.includes("fill") ||
    //   lowerLine.includes("blank") ||
    //   lowerLine.includes("___") ||
    //   lowerLine.includes("...") ||
    //   lowerLine.includes("điền") ||
    //   lowerLine.includes("chỗ trống")
    // ) {
    //   return "FILL_BLANK";
    // }

    // if (
    //   lowerLine.includes("explain") ||
    //   lowerLine.includes("describe") ||
    //   lowerLine.includes("why") ||
    //   lowerLine.includes("giải thích") ||
    //   lowerLine.includes("trình bày") ||
    //   lowerLine.includes("phân tích")
    // ) {
    //   return "FREE_RESPONSE";
    // }

    return "MULTIPLE_CHOICE";
  }

  // private detectDifficulty(line: string): QuestionData["difficulty"] {
  //   const lowerLine = line.toLowerCase();

  //   if (lowerLine.includes("easy") || lowerLine.includes("basic")) {
  //     return "EASY";
  //   }
  //   if (lowerLine.includes("hard") || lowerLine.includes("advanced")) {
  //     return "HARD";
  //   }

  //   return "MEDIUM";
  // }

  private finalizeQuestion(
    question: Partial<QuestionData>,
    index: number,
  ): QuestionData {
    if (!question.answers || question.answers.length === 0) {
      question.answers = [
        {
          id: `answer_${index}_1`,
          text: "True",
          isCorrect: true,
          order_index: 1,
        },
        {
          id: `answer_${index}_2`,
          text: "False",
          isCorrect: false,
          order_index: 2,
        },
      ];
      question.type = "TRUE_FALSE";
    }

    // Set order_index for answers if not set
    if (question.answers) {
      question.answers.forEach((answer, idx) => {
        if (answer.order_index === 0) {
          answer.order_index = idx + 1;
        }
      });
    }

    if (question.answers && !question.answers.some((a) => a.isCorrect)) {
      question.answers[0].isCorrect = true;
    }

    return question as QuestionData;
  }
}
