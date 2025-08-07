import type { Answer, QuestionData } from "@/types/quiz";

// Re-export types for backward compatibility
export type { QuestionData, Answer };

interface ParsedQuestion {
  questionLines: string[];
  answers: ParsedAnswer[];
  startIndex: number;
  endIndex: number;
}

interface ParsedAnswer {
  key: string;
  lines: string[];
  isCorrect: boolean;
}

interface QuestionMatch {
  text: string;
  number?: string;
}

interface AnswerMatch {
  key: string;
  text: string;
  isCorrect: boolean;
}

export class ContentExtractor {
  private readonly QUESTION_PATTERNS = [
    // Vietnamese patterns
    /^Câu\s+(\d+)[\.:]?\s*/i, // "Câu 1." or "Câu 1:"
    /^Câu\s+hỏi\s+(\d+)[\.:]?\s*/i, // "Câu hỏi 1."
    /^Ch\s+(\d+)[\.:]?\s*/i, // "Ch 1." (short form)
    /^Kết\s+quả\s+(\d+)[\.:]?\s*/i, // "Kết quả 1."

    // English patterns
    /^Question\s+(\d+)[\.:]?\s*/i, // "Question 1." or "Question 1:"
    /^Q[\.\s]*(\d+)[\.:]?\s*/i, // "Q.1" or "Q 1" or "Q1."

    // Numeric patterns (universal)
    /^(\d+)[\.\)\:]\s+/, // "1." or "1)" or "1:"
    /^\((\d+)\)\s+/, // "(1)"

    // Bullet patterns
    /^[\*\-\+]\s+(\d+)[\.:]?\s*/, // "* 1." or "- 1."
  ];

  private readonly ANSWER_PATTERNS = [
    // Standard A, B, C, D patterns
    /^(\*?)([A-Za-z])[\.\)\:]\s*/, // "A." or "*A." or "a)" or "A:"

    // Parentheses patterns
    /^(\*?)\(([A-Za-z])\)\s*/, // "(A)" or "*(A)"

    // Vietnamese specific
    /^(\*?)([A-Za-z])\s*[-\.]\s*/, // "A -" or "A."

    // Numbered answers (fallback)
    /^(\*?)(\d+)[\.\)\:]\s*/, // "1." or "*1)"

    // Inline answer patterns (for cases where answer is on same line as question)
    /\s+(\*?)([A-Za-z])[\.\)\:]\s+/, // " ... a. ..." (embedded in text)
  ];

  private readonly CONTINUATION_INDICATORS = [
    // Lines that likely continue previous content
    /^\s*[a-z]/i, // Starts with lowercase (likely continuation)
    /^\s*(và|and|or|hoặc|hay)\s+/i, // Conjunction words
    /^\s*[\-\+\*]/, // Bullet points
    /^\s*\(/, // Parentheses
    /^\s*["""''']/, // Quotes
    /^\s*\d+\s*[\.\)]/, // Numbered sub-items
  ];

  private readonly QUESTION_STOPWORDS = [
    // Words that indicate end of question
    "A.",
    "B.",
    "C.",
    "D.",
    "a.",
    "b.",
    "c.",
    "d.",
    "*A.",
    "*B.",
    "*C.",
    "*D.",
    "(A)",
    "(B)",
    "(C)",
    "(D)",
  ];

  extractQuestions(content: string): QuestionData[] {
    // Preprocess content
    const preprocessed = this.preprocessContent(content);
    const lines = preprocessed.split("\n");

    // Parse structure first
    const parsedQuestions = this.parseQuestionsStructure(lines);

    // Convert to QuestionData format
    return parsedQuestions.map((pq, index) =>
      this.convertToQuestionData(pq, index),
    );
  }

  private preprocessContent(content: string): string {
    return (
      content
        // Normalize line breaks
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // Remove excessive whitespace but preserve structure
        .replace(/[ \t]+/g, " ")
        // Normalize Vietnamese characters
        .replace(/\u00A0/g, " ") // Non-breaking space
        // Clean up common OCR artifacts
        .replace(/\u200B/g, "") // Zero-width space
        .replace(/\u200C/g, "") // Zero-width non-joiner
        .replace(/\u200D/g, "") // Zero-width joiner
        .replace(/\uFEFF/g, "") // Zero-width no-break space
        // Normalize punctuation
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/…/g, "...")
        // Clean up extra spaces around punctuation
        .replace(/\s+([\.,:;!?])/g, "$1")
        .replace(/([\.,:;!?])\s+/g, "$1 ")
    );
  }

  private parseQuestionsStructure(lines: string[]): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    let currentQuestion: ParsedQuestion | null = null;
    let currentAnswer: ParsedAnswer | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const questionMatch = this.matchQuestionPattern(line);
      const answerMatch = this.matchAnswerPattern(line);

      if (questionMatch) {
        // Save previous question
        if (currentQuestion) {
          if (currentAnswer) {
            currentQuestion.answers.push(currentAnswer);
          }
          questions.push(currentQuestion);
        }

        // Start new question
        currentQuestion = {
          questionLines: [questionMatch.text],
          answers: [],
          startIndex: i,
          endIndex: i,
        };
        currentAnswer = null;
      } else if (answerMatch && currentQuestion) {
        // Save previous answer
        if (currentAnswer) {
          currentQuestion.answers.push(currentAnswer);
        }

        // Start new answer
        currentAnswer = {
          key: answerMatch.key,
          lines: [answerMatch.text],
          isCorrect: answerMatch.isCorrect,
        };
      } else if (line && currentQuestion) {
        // This is a continuation line
        if (currentAnswer) {
          // Continue current answer
          currentAnswer.lines.push(line);
        } else if (
          this.isLikelyContinuation(line, currentQuestion.questionLines)
        ) {
          // Continue current question
          currentQuestion.questionLines.push(line);
        }
        currentQuestion.endIndex = i;
      }
    }

    // Save last question
    if (currentQuestion) {
      if (currentAnswer) {
        currentQuestion.answers.push(currentAnswer);
      }
      questions.push(currentQuestion);
    }

    return questions;
  }

  private matchQuestionPattern(line: string): QuestionMatch | null {
    for (const pattern of this.QUESTION_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const text = line.replace(pattern, "").trim();
        return {
          text,
          number: match[1],
        };
      }
    }
    return null;
  }

  private matchAnswerPattern(line: string): AnswerMatch | null {
    for (const pattern of this.ANSWER_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const isCorrect = match[1] === "*";
        const key = match[2];
        const text = line.replace(pattern, "").trim();

        return {
          key,
          text,
          isCorrect,
        };
      }
    }
    return null;
  }

  private isLikelyContinuation(line: string, questionLines: string[]): boolean {
    // Don't continue if it looks like an answer
    if (this.matchAnswerPattern(line)) {
      return false;
    }

    // Don't continue if it looks like a new question
    if (this.matchQuestionPattern(line)) {
      return false;
    }

    // Check continuation indicators
    for (const indicator of this.CONTINUATION_INDICATORS) {
      if (indicator.test(line)) {
        return true;
      }
    }

    // If line starts with lowercase and previous line doesn't end with punctuation
    if (/^[a-z]/.test(line) && questionLines.length > 0) {
      const lastLine = questionLines[questionLines.length - 1];
      if (!/[\.!?:]$/.test(lastLine.trim())) {
        return true;
      }
    }

    // If line is short and doesn't start with capital (likely continuation)
    if (line.length < 50 && !/^[A-Z]/.test(line)) {
      return true;
    }

    return false;
  }

  private convertToQuestionData(
    parsedQuestion: ParsedQuestion,
    index: number,
  ): QuestionData {
    // Combine question lines into single text
    const questionText = parsedQuestion.questionLines
      .join(" ")
      .trim()
      .replace(/\s+/g, " "); // Normalize spaces

    // Convert answers
    const answers: Answer[] = parsedQuestion.answers.map((pa, answerIndex) => ({
      id: `answer_${index}_${answerIndex}`,
      text: pa.lines.join(" ").trim().replace(/\s+/g, " "),
      isCorrect: pa.isCorrect,
      order_index: answerIndex + 1,
    }));

    // Detect question type
    const questionType = this.detectQuestionType(questionText, answers);

    // Ensure at least one correct answer
    if (answers.length > 0 && !answers.some((a) => a.isCorrect)) {
      answers[0].isCorrect = true;
    }

    // If no answers found, create default True/False
    if (answers.length === 0) {
      answers.push(
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
      );
    }

    return {
      id: `question_${index}`,
      question: questionText,
      type: questionType,
      points: 1,
      answers,
    };
  }

  private detectQuestionType(
    questionText: string,
    answers: Answer[],
  ): QuestionData["type"] {
    // const lowerQuestion = questionText.toLowerCase();
    console.log(questionText, answers);
    // // True/False detection
    // if (
    //   answers.length === 2 &&
    //   answers.some(a => /^(true|đúng|yes|có)$/i.test(a.text.trim())) &&
    //   answers.some(a => /^(false|sai|no|không)$/i.test(a.text.trim()))
    // ) {
    //   return "TRUE_FALSE";
    // }

    // // Fill in the blank detection
    // if (
    //   lowerQuestion.includes('___') ||
    //   lowerQuestion.includes('...') ||
    //   lowerQuestion.includes('điền') ||
    //   lowerQuestion.includes('fill') ||
    //   lowerQuestion.includes('blank') ||
    //   lowerQuestion.includes('chỗ trống')
    // ) {
    //   return "FILL_BLANK";
    // }

    // // Free response detection
    // if (
    //   lowerQuestion.includes('giải thích') ||
    //   lowerQuestion.includes('trình bày') ||
    //   lowerQuestion.includes('phân tích') ||
    //   lowerQuestion.includes('explain') ||
    //   lowerQuestion.includes('describe') ||
    //   lowerQuestion.includes('analyze') ||
    //   lowerQuestion.includes('why') ||
    //   lowerQuestion.includes('how') ||
    //   lowerQuestion.includes('tại sao') ||
    //   lowerQuestion.includes('như thế nào')
    // ) {
    //   return "FREE_RESPONSE";
    // }

    // Default to multiple choice
    return "MULTIPLE_CHOICE";
  }
}
