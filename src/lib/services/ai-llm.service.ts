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

  // Clean the AI response - remove any extra text before/after JSON
  let cleanedResponse = aiResponse.trim();

  // Try to find JSON array in the response
  const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    cleanedResponse = jsonMatch[0];
  }

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(cleanedResponse);
    if (Array.isArray(parsed)) {
      return parsed.map((q, index) => {
        // Ensure answers array is valid
        const answers = Array.isArray(q.answers)
          ? q.answers.map((a: any, i: number) => ({
              id: a.id || `a-${Date.now()}-${index}-${i}`,
              text: a.text || String(a) || "",
              isCorrect: !!a.isCorrect,
              order_index:
                typeof a.order_index === "number" ? a.order_index : i,
            }))
          : [];
        return {
          id: q.id || `q-${Date.now()}-${index}`,
          question: q.question || q.text || "",
          type: q.type || "MULTIPLE_CHOICE",
          difficulty: (q.difficulty ||
            settings?.difficulty ||
            "EASY") as Difficulty,
          points: typeof q.points === "number" ? q.points : 1,
          explanation: q.explanation || "",
          answers,
          shortAnswerText: q.shortAnswerText || "",
        };
      });
    }
  } catch (jsonError) {
    console.warn("JSON parsing failed, trying text parsing:", jsonError);
    console.error(
      "Failed to parse AI response as JSON:",
      cleanedResponse.substring(0, 200),
    );
  }

  return questions;
}

// Function to extract existing questions from file content using AI
export async function extractQuestions(
  params: GenerateQuestionsParams,
): Promise<AIResponse> {
  const {
    apiKey,
    fileContent = "",
    modelName = DEFAULT_MODEL,
    siteUrl,
    siteName,
    settings = {},
  } = params;

  try {
    // Build the prompt for extraction (not generation)
    const prompt = `Extract quiz questions from the following content and return ONLY a valid JSON array. No explanations, no extra text.

Content:
${fileContent}

Return format (JSON array only):
[{"question":"exact question text","type":"MULTIPLE_CHOICE","difficulty":"EASY","answers":[{"text":"answer text","isCorrect":false},{"text":"correct answer","isCorrect":true}],"explanation":""}]

Rules:
- Extract questions exactly as written
- Identify correct answers marked with *, ✓, (correct), or similar indicators
- Return only the JSON array, nothing else
- If no questions found, return []

JSON:`;

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
