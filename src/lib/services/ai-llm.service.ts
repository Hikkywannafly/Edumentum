import type { Difficulty, QuestionData } from "@/types/quiz";

// Simplified AI service for quiz generation
const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "qwen/qwq-32b:free";

interface GenerateQuestionsParams {
  questionHeader: string;
  questionDescription: string;
  apiKey: string;
  fileContent?: string;
  siteUrl?: string;
  siteName?: string;
  modelName?: string;
  settings?: {
    visibility?: string;
    language?: string;
    questionType?: string;
    numberOfQuestions?: number;
    mode?: string;
    difficulty?: string;
    task?: string;
    parsingMode?: string;
  };
}

interface AIResponse {
  success: boolean;
  questions?: QuestionData[];
  error?: string;
}

async function callOpenRouterAPI(
  apiKey: string,
  prompt: string,
  modelName = DEFAULT_MODEL,
  siteUrl = "http://localhost:3000",
  siteName = "Edumentum",
): Promise<string> {
  try {
    const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenRouter API call failed:", error);
    throw error;
  }
}

function parseQuestionsFromAI(
  aiResponse: string,
  settings?: GenerateQuestionsParams["settings"],
): QuestionData[] {
  const questions: QuestionData[] = [];

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(aiResponse);
    if (Array.isArray(parsed)) {
      return parsed.map((q, index) => ({
        id: `q-${Date.now()}-${index}`,
        question: q.question || q.text || "",
        type: q.type || "MULTIPLE_CHOICE",
        difficulty: (q.difficulty ||
          settings?.difficulty ||
          "EASY") as Difficulty,
        points: q.points || 1,
        explanation: q.explanation || "",
        answers: q.answers || [],
        shortAnswerText: q.shortAnswerText || "",
      }));
    }
  } catch {
    // If JSON parsing fails, try to extract questions from text
    const lines = aiResponse.split("\n");
    let currentQuestion: Partial<QuestionData> | null = null;
    let questionIndex = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detect question start
      if (trimmedLine.match(/^\d+\.|^Question \d+:|^Q\d+:/)) {
        if (currentQuestion) {
          questions.push({
            id: `q-${Date.now()}-${questionIndex}`,
            question: currentQuestion.question || "",
            type: currentQuestion.type || "MULTIPLE_CHOICE",
            difficulty: (currentQuestion.difficulty ||
              settings?.difficulty ||
              "EASY") as Difficulty,
            explanation: currentQuestion.explanation || "",
            answers: currentQuestion.answers || [],
            shortAnswerText: currentQuestion.shortAnswerText || "",
          });
          questionIndex++;
        }

        currentQuestion = {
          question: trimmedLine
            .replace(/^\d+\.|^Question \d+:|^Q\d+:/, "")
            .trim(),
          answers: [],
        };
      }
      // Detect answers
      else if (trimmedLine.match(/^[A-D]\)|^[a-d]\)/)) {
        if (currentQuestion) {
          const answerText = trimmedLine.replace(/^[A-Da-d]\)/, "").trim();
          const isCorrect =
            trimmedLine.toLowerCase().includes("correct") ||
            trimmedLine.includes("✓") ||
            trimmedLine.includes("*");

          currentQuestion.answers = currentQuestion.answers || [];
          currentQuestion.answers.push({
            id: `a-${Date.now()}-${currentQuestion.answers.length}`,
            text: answerText,
            isCorrect,
            order_index: currentQuestion.answers.length,
          });
        }
      }
    }

    // Add the last question
    if (currentQuestion) {
      questions.push({
        id: `q-${Date.now()}-${questionIndex}`,
        question: currentQuestion.question || "",
        type: currentQuestion.type || "MULTIPLE_CHOICE",
        difficulty: (currentQuestion.difficulty ||
          settings?.difficulty ||
          "EASY") as Difficulty,
        points: 1,
        explanation: currentQuestion.explanation || "",
        answers: currentQuestion.answers || [],
        shortAnswerText: currentQuestion.shortAnswerText || "",
      });
    }
  }
  console.log("test,", questions);
  return questions;
}

// Function to extract existing questions from file content using AI
export async function extractQuestions(
  params: GenerateQuestionsParams,
): Promise<AIResponse> {
  const {
    questionHeader,
    questionDescription,
    apiKey,
    fileContent = "",
    modelName = DEFAULT_MODEL,
    siteUrl,
    siteName,
    settings = {},
  } = params;

  try {
    // Build the prompt for extraction (not generation)
    const prompt = `
You are an expert quiz parser. Extract and parse existing quiz questions from the provided content. DO NOT generate new questions, only extract what already exists.

Header: ${questionHeader}
Description: ${questionDescription}

Settings:
- Language: ${settings.language || "AUTO"}
- Parsing Mode: ${settings.parsingMode || "BALANCED"}

Content to extract questions from:
${fileContent}

Please extract ALL existing questions and convert them to JSON format with the following structure:
[
  {
    "question": "Exact question text from the content",
    "type": "MULTIPLE_CHOICE",
    "difficulty": "${settings.difficulty || "EASY"}",
    "answers": [
      {"text": "Option A text", "isCorrect": false},
      {"text": "Option B text", "isCorrect": false},
      {"text": "Option C text", "isCorrect": false},
      {"text": "Option D text", "isCorrect": true}
    ],
    "explanation": ""
  }
]

IMPORTANT RULES:
1. Extract questions EXACTLY as they appear in the content
2. Identify correct answers by looking for markers like: *, ✓, (correct), or any indication
3. Keep original question numbering and text
4. Do not modify or rephrase the questions
5. If no clear correct answer is marked, make your best guess based on context
6. Extract ALL questions found in the content

Return only the JSON array, no additional text.`;

    console.log("🔍 Extracting questions from file content...");
    console.log(
      "📄 File content to extract from:",
      `${fileContent.substring(0, 500)}...`,
    );
    const aiResponse = await callOpenRouterAPI(
      apiKey,
      prompt,
      modelName,
      siteUrl,
      siteName,
    );

    console.log("🤖 AI Response:", aiResponse);
    console.log("📝 Parsing extracted questions...");
    const questions = parseQuestionsFromAI(aiResponse, settings);

    if (questions.length === 0) {
      throw new Error("No questions could be extracted from file content");
    }

    console.log(`✅ Successfully extracted ${questions.length} questions`);
    return {
      success: true,
      questions,
    };
  } catch (error) {
    console.error("❌ Question extraction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Main function to generate questions using AI
export async function generateQuestions(
  params: GenerateQuestionsParams,
): Promise<AIResponse> {
  const {
    questionHeader,
    questionDescription,
    apiKey,
    fileContent = "",
    modelName = DEFAULT_MODEL,
    siteUrl,
    siteName,
    settings = {},
  } = params;

  try {
    // Build the prompt based on settings
    const prompt = `
You are an expert quiz generator. Create ${settings.numberOfQuestions || 5} high-quality questions based on the following requirements:

Header: ${questionHeader}
Description: ${questionDescription}

Settings:
- Language: ${settings.language || "AUTO"}
- Question Type: ${settings.questionType || "MIXED"}
- Difficulty: ${settings.difficulty || "EASY"}
- Mode: ${settings.mode || "QUIZ"}
- Task: ${settings.task || "GENERATE_QUIZ"}
- Parsing Mode: ${settings.parsingMode || "BALANCED"}

Content to generate questions from:
${fileContent}

Please generate exactly ${settings.numberOfQuestions || 5} questions in JSON format with the following structure:
[
  {
    "question": "Question text here",
    "type": "MULTIPLE_CHOICE",
    "difficulty": "${settings.difficulty || "EASY"}",
    "answers": [
      {"text": "Option A", "isCorrect": false},
      {"text": "Option B", "isCorrect": true},
      {"text": "Option C", "isCorrect": false},
      {"text": "Option D", "isCorrect": false}
    ],
    "explanation": "Explanation for the correct answer"
  }
]

Ensure questions are relevant to the content and match the specified difficulty level.`;

    console.log("🚀 Generating questions with AI...");
    const aiResponse = await callOpenRouterAPI(
      apiKey,
      prompt,
      modelName,
      siteUrl,
      siteName,
    );

    console.log("📝 Parsing AI response...");
    const questions = parseQuestionsFromAI(aiResponse, settings);

    if (questions.length === 0) {
      throw new Error("No questions could be extracted from AI response");
    }

    console.log(`✅ Successfully generated ${questions.length} questions`);
    return {
      success: true,
      questions,
    };
  } catch (error) {
    console.error("❌ Question generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Legacy function for backward compatibility
export async function createMultiAgentWorkflow() {
  throw new Error(
    "Multi-agent workflow is disabled. Use generateQuestions instead.",
  );
}
