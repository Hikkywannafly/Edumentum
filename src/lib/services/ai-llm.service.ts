import type { Difficulty, QuestionData } from "@/types/quiz";
import { ContentExtractor } from "./content-extractor.service";

// AI service for quiz generation (NOT extraction)
const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "qwen/qwq-32b:free";

// For AI-based quiz generation from content
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
    promptOverride?: string;
  };
}

// For direct extraction from files with existing questions
interface ExtractQuestionsParams {
  fileContent: string;
  settings?: {
    language?: string;
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

  console.log("🔍 Parsing AI Response, length:", aiResponse.length);

  let cleanedResponse = aiResponse.trim();

  // Remove any <think> tags if present
  cleanedResponse = cleanedResponse
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();

  // Remove any markdown code blocks
  cleanedResponse = cleanedResponse
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  // Find JSON array in the response
  const startIndex = cleanedResponse.indexOf("[");
  const endIndex = cleanedResponse.lastIndexOf("]");

  if (startIndex === -1 || endIndex === -1) {
    console.error("❌ No valid JSON array found in AI response");
    console.error("Response preview:", cleanedResponse.substring(0, 500));
    return questions;
  }

  // Extract just the JSON array part
  cleanedResponse = cleanedResponse.substring(startIndex, endIndex + 1);

  try {
    const parsed = JSON.parse(cleanedResponse);
    if (Array.isArray(parsed)) {
      console.log("✅ Successfully parsed JSON with", parsed.length, "items");
      return parsed.map((q, index) => {
        // Handle both 'answers' and 'options' fields from AI
        let answersArray = q.answers || q.options || [];

        // If it's just an array of strings (options), convert to answer objects
        if (answersArray.length > 0 && typeof answersArray[0] === "string") {
          answersArray = answersArray.map((opt: string, _i: number) => ({
            text: opt,
            isCorrect: false, // Will need to be set based on correctAnswer field
          }));

          // If there's a correctAnswer field, mark the right answer
          if (q.correctAnswer !== undefined) {
            const correctIndex =
              typeof q.correctAnswer === "number"
                ? q.correctAnswer
                : answersArray.findIndex(
                    (a: any) => a.text === q.correctAnswer,
                  );
            if (correctIndex >= 0 && correctIndex < answersArray.length) {
              answersArray[correctIndex].isCorrect = true;
            }
          }
        }

        // Ensure answers array is valid
        const answers = Array.isArray(answersArray)
          ? answersArray.map((a: any, i: number) => ({
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

// Extract questions from files with existing questions (NO AI, direct parsing)
export async function extractQuestions(
  params: ExtractQuestionsParams,
): Promise<AIResponse> {
  const { fileContent } = params;

  try {
    console.log(
      "🔍 Extracting questions from file content (direct text parsing)...",
    );
    console.log(
      "📄 File content to extract from:",
      `${fileContent.substring(0, 500)}...`,
    );

    const extractor = new ContentExtractor();
    const questions = extractor.extractQuestions(fileContent);

    if (questions.length === 0) {
      throw new Error(
        "No questions could be extracted from file content. Please ensure the file contains properly formatted questions and answers.",
      );
    }

    console.log(
      `✅ Successfully extracted ${questions.length} questions without modification`,
    );
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

// Generate NEW questions using AI from content (NOT extraction)
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
You are an expert quiz generator. Your response must be ONLY a valid JSON array, nothing else.

Create ${settings.numberOfQuestions || 5} high-quality questions based on the following requirements:

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

IMPORTANT: Return ONLY a valid JSON array. Each question object must have:
- "question": the question text
- "answers": array of answer objects with "text" and "isCorrect" fields
- "type": question type (e.g., "MULTIPLE_CHOICE")
- "difficulty": difficulty level
- "explanation": explanation text

Example format:
[{"question":"What is...","type":"MULTIPLE_CHOICE","answers":[{"text":"Option A","isCorrect":false},{"text":"Option B","isCorrect":true}],"difficulty":"EASY","explanation":"Because..."}]

Respond with ONLY the JSON array, no other text.`.trim();

    console.log("🚀 Generating questions with AI...");
    const aiResponse = await callOpenRouterAPI(
      apiKey,
      prompt,
      modelName,
      siteUrl,
      siteName,
    );

    console.log("📝 Parsing AI response...");

    console.log("🔍 Full AI Response Length:", aiResponse.length, settings);
    console.log("🔍 Full AI Response:", aiResponse);

    const questions = parseQuestionsFromAI(aiResponse, settings);

    if (questions.length === 0) {
      throw new Error("No questions could be extracted from AI response");
    }

    console.log(`✅ Successfully generated ${questions.length} questions`);
    return {
      success: true,
      questions, // Return the actual questions, not empty array!
    };
  } catch (error) {
    console.error("❌ Question generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function createMultiAgentWorkflow() {
  throw new Error(
    "Multi-agent workflow is disabled. Use generateQuestions instead.",
  );
}
