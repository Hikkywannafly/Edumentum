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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (this.isQuestionLine(line)) {
        // Save previous question if exists
        if (currentQuestion) {
          currentQuestion.question = questionTextLines.join(" ").trim();
          questions.push(
            this.finalizeQuestion(currentQuestion, questionIndex++),
          );
        }

        // Start new question
        currentQuestion = {
          id: `q_${questionIndex}`,
          question: this.extractQuestionText(line),
          type: this.detectQuestionType(line),
          difficulty: this.detectDifficulty(line),
          points: 1,
          answers: [],
        };
        questionTextLines = [this.extractQuestionText(line)];
      } else if (currentQuestion && this.isAnswerLine(line)) {
        // Save question text before processing answers
        currentQuestion.question = questionTextLines.join(" ").trim();

        const answer = this.extractAnswer(line);
        if (answer && currentQuestion.answers) {
          currentQuestion.answers.push(answer);
        }
      } else if (
        currentQuestion &&
        !this.isAnswerLine(line) &&
        line.length > 0
      ) {
        // This is continuation of question text
        questionTextLines.push(line);
      }
    }

    // Save the last question
    if (currentQuestion) {
      currentQuestion.question = questionTextLines.join(" ").trim();
      questions.push(this.finalizeQuestion(currentQuestion, questionIndex));
    }

    return questions;
  }

  private isQuestionLine(line: string): boolean {
    const questionPatterns = [
      /^Câu\s+\d+\./, // Câu 1.
      /^Câu\s+\d+/, // Câu 1
      /^\d+\.\s/, // 1.
      /^Q\d+\.\s/, // Q1.
      /^Question\s+\d+/, // Question 1
      /^\*\s/, // * Question
      /^-\s/, // - Question
      /^[A-ZẮẰẲẴẶĂẤẦẨẪẬÂÁÀẢÃẠĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]\s+\d+\./, // Phần 1.
    ];

    return questionPatterns.some((pattern) => pattern.test(line));
  }

  private isAnswerLine(line: string): boolean {
    const answerPatterns = [
      /^[A-D]\.\s/, // A. Answer
      /^[a-d]\.\s/, // a. Answer
      /^\d+\)\s/, // 1) Answer
      /^\(\w+\)\s/, // (A) Answer
      /^\*[A-D]\.\s/, // *A. Answer (correct answer)
      /^[A-D]\.\s.*\*/, // A. Answer * (correct answer)
    ];

    return answerPatterns.some((pattern) => pattern.test(line));
  }

  private extractQuestionText(line: string): string {
    return line
      .replace(/^(Câu\s+\d+\.?|\d+\.|Q\d+\.|Question\s+\d+|\*|-)\s*/, "")
      .trim();
  }

  private extractAnswer(line: string): Answer | null {
    // Handle different answer patterns
    let match = line.match(/^(\*?[A-Da-d])\.\s*(.+)/);
    if (!match) {
      match = line.match(/^(\d+)\)\s*(.+)/);
    }
    if (!match) {
      match = line.match(/^\((\w+)\)\s*(.+)/);
    }

    if (!match) return null;

    // Remove * if present from answer letter
    match[1].replace("*", "");
    const answerText = match[2].trim();

    // Check if this is a correct answer
    const isCorrect =
      line.includes("*") ||
      answerText.includes("*") ||
      answerText.includes("(correct)");
    const cleanText = answerText.replace(/[\*\(correct\)]/g, "").trim();

    return {
      id: `answer_${Date.now()}_${Math.random()}`,
      text: cleanText,
      isCorrect: isCorrect,
      order_index: 0, // Will be set by parent
    };
  }

  private detectQuestionType(line: string): QuestionData["type"] {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes("true") || lowerLine.includes("false")) {
      return "TRUE_FALSE";
    }

    if (
      lowerLine.includes("fill") ||
      lowerLine.includes("blank") ||
      lowerLine.includes("___")
    ) {
      return "FILL_BLANK";
    }

    if (
      lowerLine.includes("explain") ||
      lowerLine.includes("describe") ||
      lowerLine.includes("why")
    ) {
      return "FREE_RESPONSE";
    }

    return "MULTIPLE_CHOICE";
  }

  private detectDifficulty(line: string): QuestionData["difficulty"] {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes("easy") || lowerLine.includes("basic")) {
      return "EASY";
    }
    if (lowerLine.includes("hard") || lowerLine.includes("advanced")) {
      return "HARD";
    }

    return "MEDIUM";
  }

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

    if (question.answers && !question.answers.some((a) => a.isCorrect)) {
      question.answers[0].isCorrect = true;
    }

    return question as QuestionData;
  }
}
