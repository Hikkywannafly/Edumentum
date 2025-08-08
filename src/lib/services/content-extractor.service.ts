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
    /^Câu\s+(\d+)[\s\.\:\-\)]*\s*/i,
    /^Câu\s+hỏi\s+(\d+)[\s\.\:\-\)]*\s*/i,
    /^Ch\s+(\d+)[\s\.\:\-\)]*\s*/i,
    /^Bài\s+(\d+)[\s\.\:\-\)]*\s*/i,
    /^Question\s+(\d+)[\s\.\:\-\)]*\s*/i,
    /^Q[\.\s]*(\d+)[\s\.\:\-\)]*\s*/i,
    /^Problem\s+(\d+)[\s\.\:\-\)]*\s*/i,
    /^Exercise\s+(\d+)[\s\.\:\-\)]*\s*/i,
    /^Task\s+(\d+)[\s\.\:\-\)]*\s*/i,
    /^(\d+)[\.\)\:\-]\s+/,
    /^\((\d+)\)[\s\.\:\-]*\s*/,
    /^\[(\d+)\][\s\.\:\-]*\s*/,
    /^(\d+)\s*\/\s*/,
    /^#(\d+)[\s\.\:\-]*\s*/,
    /^[IVXLCDM]+[\.\)\:\-]\s+/i,
    /^[\*\-\+\•\▪\►]\s*(\d+)?[\.\:\-]?\s*/,
  ];

  private readonly ANSWER_PATTERNS = [
    /^(\*?\s*)([A-Da-d])[\.\)\:\-]\s*/,
    /^(\*?\s*)\(([A-Da-d])\)[\s\.\:\-]*/,
    /^(\*?\s*)\[([A-Da-d])\][\s\.\:\-]*/,
    /^(\*?\s*)([A-Da-d])\s*[\.\)\:\-]\s*/,
    /^(✓\s*|✔\s*|☑\s*|√\s*)([A-Da-d])[\.\)\:\-]\s*/,
    /^(\*?\s*)([A-Da-d])\s*\*\s*[\.\)\:\-]?\s*/,
    /^(\*?\s*)([1-4])[\.\)\:\-]\s*/,
    /^(\*?\s*)\(([1-4])\)[\s\.\:\-]*/,
    /^(\*?\s*)Đáp\s*án\s*([A-Da-d])[\.\:\-]?\s*/i,
    /^(\*?\s*)ĐA\s*([A-Da-d])[\.\:\-]?\s*/i,
    /\s+(\*?\s*)([A-Da-d])[\.\)\:]\s+/,
    /^→\s*([A-Da-d])[\.\)\:\-]?\s*/,
    /^=>\s*([A-Da-d])[\.\)\:\-]?\s*/,
    /^>>\s*([A-Da-d])[\.\)\:\-]?\s*/,
  ];

  private readonly CONTINUATION_INDICATORS = [
    /^\s*[a-z]/i,
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
      .replace(/\u200B/g, "")
      .replace(/\u200C/g, "")
      .replace(/\u200D/g, "")
      .replace(/\uFEFF/g, "")
      .replace(/\u202F/g, "")
      .replace(/[""„‚]/g, '"')
      .replace(/[''‚]/g, "'")
      .replace(/[…]/g, "...")
      .replace(/[–—]/g, "-")
      .replace(/\s+([\.,;:!?\)\]\}])/g, "$1")
      .replace(/([\(\[\{])\s+/g, "$1")
      .replace(/([\.,;:!?])\s+/g, "$1 ")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();

    // 🔹 Tách đáp án trên cùng một dòng thành nhiều dòng
    processed = processed.replace(
      /(\s+)(\*?\s*(?:[A-Da-d]|\([A-Da-d]\)|\[[A-Da-d]\])[\.\)\:])\s+/g,
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
      } else if (line && currentQuestion) {
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
        const number = match[1] || match[2] || match[3];
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
        let key = "";
        const markerGroup = match[1] || "";
        if (
          markerGroup.includes("*") ||
          markerGroup.includes("✓") ||
          markerGroup.includes("✔") ||
          markerGroup.includes("☑") ||
          markerGroup.includes("√")
        ) {
          isCorrect = true;
        }
        key = (match[2] || match[3] || match[4] || "").toUpperCase();
        let text = cleanLine.replace(pattern, "").trim();
        text = this.cleanAnswerText(text);
        if (!text || text.length < 1) continue;
        return { key, text, isCorrect };
      }
    }
    return null;
  }

  private cleanAnswerText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[\*✓✔☑√]+$/, "")
      .replace(/^[\-\s]+/, "")
      .replace(/[\s\-]+$/, "")
      .trim();
  }

  private isLikelyContinuation(line: string, questionLines: string[]): boolean {
    if (this.matchAnswerPattern(line)) return false;
    if (this.matchQuestionPattern(line)) return false;
    for (const indicator of this.CONTINUATION_INDICATORS) {
      if (indicator.test(line)) return true;
    }
    if (/^[a-z]/.test(line) && questionLines.length > 0) {
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

    const questionType = this.detectQuestionType(questionText, answers);

    if (answers.length > 0 && !answers.some((a) => a.isCorrect)) {
      answers[0].isCorrect = true;
    }
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
    // const answerTexts = answers.map(a => a.text.toLowerCase().trim());
    console.log(questionText, answers);
    // if (answers.length === 2) {
    //   const hasTrueFalse = (
    //     answerTexts.some(text => /^(true|đúng|yes|có|right|correct|phải)$/i.test(text)) &&
    //     answerTexts.some(text => /^(false|sai|no|không|wrong|incorrect|không phải)$/i.test(text))
    //   );
    //   if (hasTrueFalse) return "TRUE_FALSE";
    // }

    // const fillBlankIndicators = [
    //   /_{3,}/, /\.{3,}/, /\[\s*\]/, /\(\s*\)/,
    //   /điền/i, /fill/i, /blank/i, /chỗ trống/i,
    //   /hoàn thành/i, /complete/i, /từ còn thiếu/i, /missing word/i
    // ];
    // if (fillBlankIndicators.some(pattern => pattern.test(lowerQuestion))) {
    //   return "FILL_BLANK";
    // }

    // const freeResponseIndicators = [
    //   /giải thích/i, /explain/i, /why/i, /tại sao/i,
    //   /trình bày/i, /describe/i, /mô tả/i,
    //   /phân tích/i, /analyze/i, /analyse/i,
    //   /thảo luận/i, /discuss/i,
    //   /so sánh/i, /compare/i,
    //   /đánh giá/i, /evaluate/i,
    //   /nhận xét/i, /comment/i,
    //   /như thế nào/i, /how/i,
    //   /nêu/i, /list/i, /liệt kê/i,
    //   /viết/i, /write/i,
    //   /tính toán/i, /calculate/i, /compute/i
    // ];
    // if (freeResponseIndicators.some(pattern => pattern.test(lowerQuestion))) {
    //   return "FREE_RESPONSE";
    // }

    return "MULTIPLE_CHOICE";
  }
}
