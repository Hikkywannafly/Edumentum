import type { Answer, QuestionData } from "@/types/quiz";
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
  // Pattern nhận diện câu hỏi
  private readonly QUESTION_PATTERNS = [
    /^Câu\s+(\d+)[\s\.\:\-\)]*/i,
    /^Câu\s+hỏi\s+(\d+)[\s\.\:\-\)]*/i,
    /^Ch\s+(\d+)[\s\.\:\-\)]*/i,
    /^Bài\s+(\d+)[\s\.\:\-\)]*/i,
    /^Question\s+(\d+)[\s\.\:\-\)]*/i,
    /^Q[\.\s]*(\d+)[\s\.\:\-\)]*/i,
    /^Problem\s+(\d+)[\s\.\:\-\)]*/i,
    /^Exercise\s+(\d+)[\s\.\:\-\)]*/i,
    /^Task\s+(\d+)[\s\.\:\-\)]*/i,
    /^(\d+)[\.\)\:\-]\s+/,
    /^\((\d+)\)[\s\.\:\-]*/,
    /^\[(\d+)\][\s\.\:\-]*/,
    /^(\d+)\s*\/\s*/,
    /^#(\d+)[\s\.\:\-]*/,
    /^[IVXLCDM]+[\.\)\:\-]\s+/i,
    /^[\*\-\+\•\▪\►]\s*(\d+)?[\.\:\-]?\s*/,
  ];

  // Pattern nhận diện đáp án
  private readonly ANSWER_PATTERNS = [
    /^(\*?\s*)([A-Da-d])[\.\)\:\-]\s*/,
    /^(\*?\s*)\(([A-Da-d])\)[\s\.\:\-]*/,
    /^(\*?\s*)\[([A-Da-d])\][\s\.\:\-]*/,
    /^(✓\s*|✔\s*|☑\s*|√\s*)([A-Da-d])[\.\)\:\-]*/,
    /^(\*?\s*)([A-Da-d])\s*\*\s*/,
    /^(\*?\s*)([1-4])[\.\)\:\-]\s*/,
    /^(\*?\s*)\(([1-4])\)[\s\.\:\-]*/,
    /^(\*?\s*)Đáp\s*án\s*([A-Da-d])[\.\:\-]?/i,
    /^(\*?\s*)ĐA\s*([A-Da-d])[\.\:\-]?/i,
    /^→\s*([A-Da-d])[\.\)\:\-]?/,
    /^=>\s*([A-Da-d])[\.\)\:\-]?/,
    /^>>\s*([A-Da-d])[\.\)\:\-]?/,
    /^(\*?\s*)\(?Đúng\)?\s*([A-Da-d])?/i,
  ];

  // Các trường hợp xuống dòng vẫn là nội dung của câu hỏi/đáp án
  private readonly CONTINUATION_INDICATORS = [
    /^\s*[a-zàáảãạâầấẩẫậăằắẳẵặ]/i,
    /^\s*(và|and|or|hoặc|hay)\s+/i,
    /^\s*[\-\+\*]/,
    /^\s*\(/,
    /^\s*["""''']/,
    /^\s*\d+\s*[\.\)]/,
  ];

  extractQuestions(content: string): QuestionData[] {
    const preprocessed = this.preprocessContent(content);
    const lines = preprocessed.split("\n");
    const parsedQuestions = this.parseQuestionsStructure(lines);

    return parsedQuestions.map((pq, index) =>
      this.convertToQuestionData(pq, index),
    );
  }

  private preprocessContent(content: string): string {
    let processed = content
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\u00A0/g, " ")
      .replace(/[\u2000-\u200F]/g, " ")
      .replace(/[\u2028-\u2029]/g, "\n")
      .replace(/\u200B|\u200C|\u200D|\uFEFF|\u202F/g, "")
      .replace(/[…]/g, "...")
      .replace(/[–—]/g, "-")
      .replace(/\s+([\.,;:!?\)\]\}])/g, "$1")
      .replace(/([\(\[\{])\s+/g, "$1")
      .replace(/([\.,;:!?])\s+/g, "$1 ")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();

    // Tách đáp án trong cùng dòng câu hỏi
    processed = processed.replace(
      /(\s+)(\*?\s*(?:[A-Da-d]|\([A-Da-d]\)|\[[A-Da-d]\]))\s+/g,
      "\n$2 ",
    );

    return processed;
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
        if (currentQuestion) {
          if (currentAnswer) currentQuestion.answers.push(currentAnswer);
          questions.push(currentQuestion);
        }
        currentQuestion = {
          questionLines: [questionMatch.text],
          answers: [],
          startIndex: i,
          endIndex: i,
        };
        currentAnswer = null;
      } else if (answerMatch && currentQuestion) {
        if (currentAnswer) currentQuestion.answers.push(currentAnswer);
        currentAnswer = {
          key: answerMatch.key,
          lines: [answerMatch.text],
          isCorrect: answerMatch.isCorrect,
        };
      } else if (currentQuestion) {
        if (currentAnswer) {
          currentAnswer.lines.push(line);
        } else if (
          this.isLikelyContinuation(line, currentQuestion.questionLines)
        ) {
          currentQuestion.questionLines.push(line);
        }
        currentQuestion.endIndex = i;
      }
    }

    if (currentQuestion) {
      if (currentAnswer) currentQuestion.answers.push(currentAnswer);
      questions.push(currentQuestion);
    }
    return questions;
  }

  private matchQuestionPattern(line: string): QuestionMatch | null {
    const cleanLine = line.trim();
    if (!cleanLine) return null;

    for (const pattern of this.QUESTION_PATTERNS) {
      const match = cleanLine.match(pattern);
      if (match) {
        let text = cleanLine.replace(pattern, "").trim();
        const number = match[1];
        text = this.cleanQuestionText(text);
        if (text.length < 3 || this.looksLikeAnswer(text)) continue;
        return { text, number };
      }
    }
    return null;
  }

  private cleanQuestionText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[\.:;,]+$/, "")
      .trim();
  }

  private looksLikeAnswer(text: string): boolean {
    return (
      /^[A-Da-d][\.:)\-]/.test(text) ||
      /^\([A-Da-d]\)/.test(text) ||
      /^[1-4][\.:)\-]/.test(text)
    );
  }

  private matchAnswerPattern(line: string): AnswerMatch | null {
    const cleanLine = line.trim();
    if (!cleanLine) return null;

    for (const pattern of this.ANSWER_PATTERNS) {
      const match = cleanLine.match(pattern);
      if (match) {
        let isCorrect = false;
        const markerGroup = match[1] || "";
        if (/[*✓✔☑√]|Đúng|Correct/i.test(markerGroup)) isCorrect = true;
        const key = (match[2] || "").toUpperCase();
        let text = cleanLine.replace(pattern, "").trim();
        text = this.cleanAnswerText(text);
        if (!text) continue;
        return { key, text, isCorrect };
      }
    }
    return null;
  }

  private cleanAnswerText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[\*✓✔☑√]+$/, "")
      .trim();
  }

  private isLikelyContinuation(line: string, questionLines: string[]): boolean {
    if (this.matchAnswerPattern(line)) return false;
    if (this.matchQuestionPattern(line)) return false;
    for (const indicator of this.CONTINUATION_INDICATORS) {
      if (indicator.test(line)) return true;
    }
    if (/^[a-zàáảãạâầấẩẫậăằắẳẵặ]/i.test(line) && questionLines.length > 0) {
      const lastLine = questionLines[questionLines.length - 1];
      if (!/[\.!?:]$/.test(lastLine.trim())) return true;
    }
    if (line.length < 50 && !/^[A-Z]/.test(line)) return true;
    return false;
  }

  private convertToQuestionData(
    parsedQuestion: ParsedQuestion,
    index: number,
  ): QuestionData {
    const questionText = parsedQuestion.questionLines
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
    const answers: Answer[] = parsedQuestion.answers.map((pa, answerIndex) => ({
      id: `answer_${index}_${answerIndex}`,
      text: pa.lines.join(" ").trim().replace(/\s+/g, " "),
      isCorrect: pa.isCorrect,
      order_index: answerIndex + 1,
    }));

    const questionType: QuestionData["type"] =
      answers.length > 0 ? "MULTIPLE_CHOICE" : "FREE_RESPONSE";

    return {
      id: `question_${index}`,
      question: questionText,
      type: questionType,
      points: 1,
      answers,
    };
  }
}
