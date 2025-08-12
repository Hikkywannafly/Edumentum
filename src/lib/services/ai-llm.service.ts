import type { Difficulty, QuestionData } from "@/types/quiz";
import axios, { type AxiosInstance, type AxiosError } from "axios";
import { ContentExtractor } from "./content-extractor.service";
import type { FileForAI } from "./file-to-ai.service";

const inFlight = new Map<string, Promise<AIResponse>>();

function makeRequestKey(
  content: string,
  model: string,
  settings?: any,
): string {
  const raw = JSON.stringify({
    content: content.slice(0, 1000),
    model,
    settings,
  }); // Use first 1k chars for hash
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return String(h >>> 0);
}

// AI service for quiz generation (NOT extraction)
const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "openai/gpt-oss-20b:free";
const DEFAULT_TEMPERATURE = 0.3;
const DEFAULT_MAX_TOKENS = 3500;

const clientCache = new Map<string, AxiosInstance>();

const createOpenAIClient = (apiKey: string): AxiosInstance => {
  const cacheKey = apiKey.substring(0, 10);
  if (clientCache.has(cacheKey)) {
    const client = clientCache.get(cacheKey) as AxiosInstance;
    return client;
  }

  const client = axios.create({
    baseURL: OPENROUTER_API_BASE,
    timeout: 90000,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://edumentum.vercel.app",
      "X-Title": "Edumentum Quiz Generator",
    },
    maxRedirects: 0,
    validateStatus: (status) => status < 500,
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      const retryCount = config._retryCount || 0;
      const maxRetries = 4; // Increased retries for better resilience

      const isQuotaExhausted =
        (error.response?.data as any)?.error?.code === "insufficient_quota";
      const isNetworkError = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ENOTFOUND",
        "ECONNREFUSED",
      ].includes(error.code || "");
      const shouldRetry =
        ((error.response?.status === 429 && !isQuotaExhausted) ||
          (error.response?.status && error.response.status >= 500) ||
          isNetworkError) &&
        retryCount < maxRetries;

      if (shouldRetry) {
        config._retryCount = retryCount + 1;

        // Smart delay calculation based on error type
        let delay: number;
        if (error.response?.status === 429) {
          // For rate limits, check if Retry-After header is present
          const retryAfter = error.response.headers["retry-after"];
          delay = retryAfter
            ? Number.parseInt(retryAfter) * 1000
            : 2 ** retryCount * 1000;
        } else {
          // For other errors, use exponential backoff with jitter
          delay = 2 ** retryCount * 1000 + Math.random() * 1000;
        }

        const errorType =
          error.response?.status === 429
            ? "Rate limited (429)"
            : "Network/Server error";
        console.warn(
          `⚠️ ${errorType}. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return client(config);
      }

      return Promise.reject(error);
    },
  );

  // Request interceptor for logging (in development)
  if (process.env.NODE_ENV === "development") {
    client.interceptors.request.use((config) => {
      console.log(
        `🚀 OpenRouter API Request: ${config.method?.toUpperCase()} ${config.url}`,
      );
      return config;
    });
  }

  // Cache the client for reuse
  clientCache.set(cacheKey, client);

  return client;
};

// Utility function to clear client cache (useful for testing or when switching API keys)
export const clearOpenAIClientCache = () => {
  clientCache.clear();
  console.log("🧹 OpenRouter client cache cleared");
};

// For AI-based quiz generation from content
interface GenerateQuestionsParams {
  questionHeader: string;
  questionDescription: string;
  apiKey: string;
  fileContent?: string;
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

async function callOpenRouterApi(
  apiKey: string,
  prompt: string,
  modelName = DEFAULT_MODEL,
): Promise<string> {
  try {
    const client = createOpenAIClient(apiKey);

    // Prefer strict JSON output
    const basePayload: any = {
      model: modelName,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: DEFAULT_MAX_TOKENS,
    };

    let response = await client.post("/chat/completions", {
      ...basePayload,
      response_format: { type: "json_object" },
    });

    // Some models might not support response_format; fallback without it
    if (response.status === 400 || response.status === 422) {
      response = await client.post("/chat/completions", basePayload);
    }

    // Handle HTTP error status codes that didn't trigger retry
    if (response.status >= 400) {
      const errorData = response.data;
      console.error(`OpenRouter API error ${response.status}:`, errorData);

      let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
      if (errorData?.error?.message) {
        errorMessage += ` - ${errorData.error.message}`;
      }

      throw new Error(errorMessage);
    }

    const responseContent = response.data.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No content returned from OpenRouter API");
    }

    return responseContent;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          "Network error or CORS blocked the request. If running in the browser, ensure the endpoint allows required headers and CORS preflight.",
        );
      }
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const errorData = error.response?.data;

      console.error(
        `OpenRouter API call failed: ${status} ${statusText}`,
        errorData,
      );

      // Provide helpful error messages based on status and error type
      let userMessage = `OpenRouter API error: ${status} ${statusText}`;
      const errorCode = errorData?.error?.code;

      if (status === 401) {
        userMessage += " - Invalid API key";
      } else if (status === 429) {
        if (errorCode === "insufficient_quota") {
          userMessage =
            "🚫 OpenRouter Quota Exhausted - Your OpenRouter account has run out of credits. Please check your billing at https://openrouter.ai/account";
        } else {
          userMessage += " - Rate limit exceeded (too many requests)";
        }
      } else if (status === 503) {
        userMessage += " - Service temporarily unavailable";
      } else if (errorData?.error?.message) {
        userMessage += ` - ${errorData.error.message}`;
      }

      throw new Error(userMessage);
    }

    console.error("OpenRouter API call failed:", error);
    throw error;
  }
}

async function callOpenRouterApiWithFile(
  apiKey: string,
  prompt: string,
  file: FileForAI,
  modelName = "openai/gpt-oss-20b:free", // Use GPT-3.5 for file support
): Promise<string> {
  try {
    const client = createOpenAIClient(apiKey);

    // Prepare message content based on file type
    const messageContent: any[] = [
      {
        type: "text",
        text: prompt,
      },
    ];

    // Add file content based on type
    if (file.type === "image") {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:${file.mimeType};base64,${file.data}`,
        },
      });
    } else if (file.type === "document" || file.type === "text") {
      // For documents, we'll add them as base64 data with description
      messageContent.push({
        type: "text",
        text: `File: ${file.fileName} (${file.mimeType})\nBase64 Content: data:${file.mimeType};base64,${file.data}\n\nPlease analyze this file and extract the content to generate quiz questions.`,
      });
    }

    const basePayload: any = {
      model: modelName,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: DEFAULT_MAX_TOKENS,
    };

    let response = await client.post("/chat/completions", {
      ...basePayload,
      response_format: { type: "json_object" },
    });

    if (response.status === 400 || response.status === 422) {
      response = await client.post("/chat/completions", basePayload);
    }

    // Handle HTTP error status codes
    if (response.status >= 400) {
      const errorData = response.data;
      console.error(`OpenRouter API file error ${response.status}:`, errorData);

      let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
      if (errorData?.error?.message) {
        errorMessage += ` - ${errorData.error.message}`;
      }

      throw new Error(errorMessage);
    }

    const responseContent = response.data.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error(
        "No content returned from OpenRouter API for file processing",
      );
    }

    return responseContent;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const errorData = error.response?.data;

      console.error(
        `OpenAI API with file call failed: ${status} ${statusText}`,
        errorData,
      );

      let userMessage = `OpenAI API file processing error: ${status} ${statusText}`;
      const errorCode = errorData?.error?.code;

      if (status === 401) {
        userMessage += " - Invalid API key";
      } else if (status === 429) {
        if (errorCode === "insufficient_quota") {
          userMessage =
            "🚫 OpenAI Quota Exhausted - Your OpenAI account has run out of credits. Please check your billing at https://platform.openai.com/account/billing";
        } else {
          userMessage += " - Rate limit exceeded (too many requests)";
        }
      } else if (status === 413) {
        userMessage += " - File too large";
      } else if (status === 400) {
        userMessage += " - Invalid file format or content";
      } else if (errorData?.error?.message) {
        userMessage += ` - ${errorData.error.message}`;
      }

      throw new Error(userMessage);
    }

    console.error("OpenAI API with file call failed:", error);
    throw error;
  }
}

// Robust JSON parsing with fallback fixes
function tryParseJSON(content: string): any {
  try {
    return JSON.parse(content);
  } catch {
    let fixed = content
      .replace(/,\s*]/g, "]")
      .replace(/,\s*}/g, "}")
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
      .replace(/:\s*'([^']*)'/g, ': "$1"');

    fixed = fixed.replace(
      /"([^"]+)":\s*([^",\[\]{}][^,\]\}]*)/g,
      (match, key, value) => {
        const trimmedValue = value.trim();
        if (
          trimmedValue.startsWith('"') ||
          /^-?\d+\.?\d*$/.test(trimmedValue) ||
          trimmedValue === "true" ||
          trimmedValue === "false" ||
          trimmedValue === "null"
        ) {
          return match;
        }
        return `"${key}": "${trimmedValue}"`;
      },
    );

    try {
      return JSON.parse(fixed);
    } catch {
      const arrayMatch = fixed.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}

export function parseQuestionsFromAI(
  aiResponse: string,
  settings?: GenerateQuestionsParams["settings"],
): QuestionData[] {
  // Clean wrappers like code fences or think tags
  let content = aiResponse.trim();
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  content = content.replace(/```json\s*([\s\S]*?)\s*```/i, "$1").trim();
  content = content.replace(/```\s*([\s\S]*?)\s*```/i, "$1").trim();

  // 1) Strict: expect a JSON object { questions: [...] }
  try {
    const direct = JSON.parse(content);
    if (
      direct &&
      typeof direct === "object" &&
      Array.isArray((direct as any).questions)
    ) {
      return processQuestionArray((direct as any).questions, settings);
    }
    if (Array.isArray(direct)) {
      return processQuestionArray(direct, settings);
    }
  } catch (_) {
    // ignore and try minimal fallback
  }

  // 2) Minimal fallback: slice first [...] block if present
  const firstBracket = content.indexOf("[");
  const lastBracket = content.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const sliced = content.slice(firstBracket, lastBracket + 1);
    try {
      const arr = JSON.parse(sliced);
      if (Array.isArray(arr)) {
        return processQuestionArray(arr, settings);
      }
    } catch (_) {
      // ignore
    }
  }

  const parsed = tryParseJSON(content);
  if (parsed) {
    const array = Array.isArray(parsed) ? parsed : [parsed];
    const questions = processQuestionArray(array, settings);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ Successfully parsed ${questions.length} questions from full content`,
      );
    }
    return questions;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Failed to parse AI response as JSON");
    console.log(
      "🔍 Raw content that failed to parse:",
      content.substring(0, 1000),
    );
  }

  return [];
}

function processQuestionArray(
  parsed: any[],
  settings?: GenerateQuestionsParams["settings"],
): QuestionData[] {
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
            : answersArray.findIndex((a: any) => a.text === q.correctAnswer);
        if (correctIndex >= 0 && correctIndex < answersArray.length) {
          answersArray[correctIndex].isCorrect = true;
        }
      }
    }

    // Ensure answers array is valid and has at least one correct answer
    const answers = Array.isArray(answersArray)
      ? answersArray.map((a: any, i: number) => ({
          id: a.id || `a-${Date.now()}-${index}-${i}`,
          text: a.text || String(a) || `Option ${i + 1}`,
          isCorrect: !!a.isCorrect,
          order_index: typeof a.order_index === "number" ? a.order_index : i,
        }))
      : [];

    // Ensure at least one answer is marked as correct
    if (answers.length > 0 && !answers.some((a) => a.isCorrect)) {
      answers[0].isCorrect = true;
    }

    // Ensure minimum number of answers for multiple choice
    if (q.type === "MULTIPLE_CHOICE" && answers.length < 2) {
      while (answers.length < 4) {
        answers.push({
          id: `a-${Date.now()}-${index}-${answers.length}`,
          text: `Option ${answers.length + 1}`,
          isCorrect: false,
          order_index: answers.length,
        });
      }
    }

    return {
      id: q.id || `q-${Date.now()}-${index}`,
      question: q.question || q.text || `Question ${index + 1}`,
      type: q.type || "MULTIPLE_CHOICE",
      difficulty: (q.difficulty ||
        settings?.difficulty ||
        "EASY") as Difficulty,
      points: typeof q.points === "number" ? q.points : 1,
      explanation: q.explanation || "",
      tags: Array.isArray(q.tags) ? q.tags : [],
      answers,
      shortAnswerText: q.shortAnswerText || "",
    };
  });
}

// Removed regex fallback for performance and determinism

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
  params: GenerateQuestionsParams & { useMultiAgent?: boolean },
): Promise<AIResponse> {
  const {
    questionHeader,
    questionDescription,
    apiKey,
    fileContent = "",
    modelName = DEFAULT_MODEL,
    settings = {},
    useMultiAgent = false,
  } = params;

  const requestKey = makeRequestKey(fileContent, modelName, settings);
  if (inFlight.has(requestKey)) {
    console.log(
      "🔄 Request already in progress, waiting for existing result...",
    );
    const existingPromise = inFlight.get(requestKey);
    if (existingPromise) {
      return existingPromise;
    }
  }

  // Create promise and cache it
  const promise = (async (): Promise<AIResponse> => {
    try {
      // Use multi-agent workflow if enabled
      if (useMultiAgent) {
        console.log(
          "🤖 Using multi-agent workflow via API for question generation",
        );

        try {
          const response = await fetch("/api/ai/multi-agent-quiz", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questionHeader,
              questionDescription,
              apiKey,
              fileContent,
              modelName,
              settings,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.questions) {
              console.log(
                `✅ Multi-agent API generated ${result.questions.length} questions`,
              );
              return {
                success: true,
                questions: result.questions,
              };
            }
          }

          console.log("⚠️ Multi-agent API failed, falling back to single-agent");
        } catch (apiError) {
          console.error("Error calling multi-agent API:", apiError);
          console.log("⚠️ Multi-agent API error, falling back to single-agent");
        }
      }

      // Build the prompt based on settings
      const numberOfQuestions = Math.max(
        5,
        Math.min(10, settings.numberOfQuestions || 5),
      );
      // Truncate very long content to keep token usage reasonable
      const limitedContent = fileContent?.slice(0, 8000) || ""; // ~8k chars
      const prompt = `
Bạn là một chuyên gia tạo quiz. Bạn PHẢI trả về CHÍNH XÁC ${numberOfQuestions} câu hỏi chất lượng cao.

YÊU CẦU:
- Header: ${questionHeader}
- Description: ${questionDescription}
- Ngôn ngữ: ${settings.language || "AUTO"}
- Loại câu hỏi: ${settings.questionType || "MIXED"}
- Độ khó: ${settings.difficulty || "EASY"}
- Số câu hỏi: ${numberOfQuestions}

 Nội dung để tạo câu hỏi (truncated nếu quá dài):
 ${limitedContent}

QUY TẮC QUAN TRỌNG:
1. Trả về CHÍNH XÁC ${numberOfQuestions} câu hỏi, không nhiều hơn không ít hơn
2. Mỗi câu hỏi trắc nghiệm PHẢI có CHÍNH XÁC 4 đáp án (A, B, C, D)
3. CHỈ có 1 đáp án đúng cho mỗi câu hỏi
4. BẮT BUỘC có explanation chi tiết cho mỗi câu hỏi
5. Tự động tạo tags phù hợp dựa trên nội dung câu hỏi
6. Response PHẢI là MỘT OBJECT JSON hợp lệ có dạng {"questions": [...]}, không có text nào khác

FORMAT JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Câu hỏi của bạn?",
      "type": "MULTIPLE_CHOICE",
      "difficulty": "${settings.difficulty || "EASY"}",
      "points": 1,
      "explanation": "Giải thích chi tiết tại sao đáp án này đúng và các đáp án khác sai",
      "tags": ["tag1", "tag2", "tag3"],
      "answers": [
        {"id": "a1", "text": "Đáp án A", "isCorrect": false, "order_index": 0},
        {"id": "a2", "text": "Đáp án B", "isCorrect": true, "order_index": 1},
        {"id": "a3", "text": "Đáp án C", "isCorrect": false, "order_index": 2},
        {"id": "a4", "text": "Đáp án D", "isCorrect": false, "order_index": 3}
      ]
    }
  ]
}

CHỈ TRẢ VỀ OBJECT JSON TRÊN. Không thêm bất kỳ text nào khác.`.trim();

      console.log("🚀 Generating questions with AI...");
      const aiResponse = await callOpenRouterApi(apiKey, prompt, modelName);

      if (process.env.NODE_ENV === "development") {
        console.log("📝 Parsing AI response...");
        console.log("🔍 Full AI Response Length:", aiResponse.length, settings);
        console.log("🔍 Full AI Response:", aiResponse);
      }

      const questions = parseQuestionsFromAI(aiResponse, settings);

      if (questions.length === 0) {
        throw new Error("No questions could be extracted from AI response");
      }

      // ✅ OPTIMIZATION: Don't throw if we have partial results
      const expectedCount = settings?.numberOfQuestions || 5;
      if (questions.length < expectedCount) {
        console.warn(
          `⚠️ Got ${questions.length}/${expectedCount} questions. Returning partial results without retry.`,
        );
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
    } finally {
      // Clean up in-flight cache
      inFlight.delete(requestKey);
    }
  })();

  // Cache the promise
  inFlight.set(requestKey, promise);
  return promise;
}

// Extract questions using AI (for content that already has quiz format)
export async function extractQuestionsWithAI(
  params: GenerateQuestionsParams & {
    useMultiAgent?: boolean;
    file?: FileForAI;
  },
): Promise<AIResponse> {
  const {
    questionHeader,
    questionDescription,
    apiKey,
    fileContent,
    modelName = DEFAULT_MODEL,
    settings = {},
    file,
  } = params;

  try {
    const numberOfQuestions = Math.max(
      1,
      Math.min(10, settings.numberOfQuestions || 10), // Higher default for extraction
    );

    const prompt = `
Bạn là một chuyên gia trích xuất quiz. Bạn cần TRÍCH XUẤT tất cả câu hỏi có sẵn từ nội dung được cung cấp.

YÊU CẦU:
- Header: ${questionHeader}
- Description: ${questionDescription}
- Ngôn ngữ: ${settings.language || "AUTO"}
- Tối đa: ${numberOfQuestions} câu hỏi

NHIỆM VỤ: TRÍCH XUẤT (không tạo mới) các câu hỏi và đáp án có sẵn trong nội dung.

QUY TẮC QUAN TRỌNG:
1. CHỈ trích xuất câu hỏi có SẴN, KHÔNG tạo ra câu hỏi mới
2. Giữ nguyên nội dung câu hỏi và đáp án từ nguồn
3. Mỗi câu hỏi trắc nghiệm PHẢI có CHÍNH XÁC 4 đáp án (A, B, C, D)
4. CHỈ có 1 đáp án đúng cho mỗi câu hỏi
5. Response PHẢI là MỘT OBJECT JSON hợp lệ dạng {"questions": [...]}, không có text khác
6. Nếu không tìm thấy câu hỏi có sẵn, trả về array rỗng []

FORMAT JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Câu hỏi được trích xuất nguyên văn",
      "type": "MULTIPLE_CHOICE",
      "difficulty": "${settings.difficulty || "EASY"}",
      "points": 1,
      "explanation": "Giải thích nếu có sẵn trong nguồn, hoặc tạo giải thích ngắn gọn",
      "tags": ["tag1", "tag2"],
      "answers": [
        {"id": "a1", "text": "Đáp án A", "isCorrect": false, "order_index": 0},
        {"id": "a2", "text": "Đáp án B", "isCorrect": true, "order_index": 1},
        {"id": "a3", "text": "Đáp án C", "isCorrect": false, "order_index": 2},
        {"id": "a4", "text": "Đáp án D", "isCorrect": false, "order_index": 3}
      ]
    }
  ]
}

CHỈ TRÍCH XUẤT câu hỏi có SẴN. Nếu không có quiz format, trả về {"questions": []}.`.trim();

    console.log("🔍 Extracting questions with AI...");

    let aiResponse: string;

    if (file) {
      console.log(
        "📄 File:",
        file.fileName,
        file.mimeType,
        `${(file.size / 1024).toFixed(1)}KB`,
      );
      aiResponse = await callOpenRouterApiWithFile(
        apiKey,
        prompt,
        file,
        "openai/gpt-oss-20b:free", // Use GPT-3.5 for file support
      );
    } else {
      const limitedExtractContent = (fileContent || "").slice(0, 8000);
      aiResponse = await callOpenRouterApi(
        apiKey,
        `${prompt}\n\nContent to extract from (truncated nếu quá dài):\n${limitedExtractContent}`,
        modelName,
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("📝 Parsing AI extraction response...");
      console.log("🔍 Full AI Response Length:", aiResponse.length);
      console.log("🔍 Full AI Response:", aiResponse);
    }

    const questions = parseQuestionsFromAI(aiResponse, settings);

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

// Generate questions directly from file (no parsing)
export async function generateQuestionsFromFile(
  params: GenerateQuestionsParams & {
    useMultiAgent?: boolean;
    file: FileForAI;
  },
): Promise<AIResponse> {
  const {
    questionHeader,
    questionDescription,
    apiKey,
    modelName = "openai/gpt-oss-20b:free",
    settings = {},
    file,
  } = params;

  try {
    const numberOfQuestions = Math.max(
      5,
      Math.min(10, settings.numberOfQuestions || 5),
    );

    const prompt = `
Bạn là một chuyên gia tạo quiz. Bạn PHẢI trả về CHÍNH XÁC ${numberOfQuestions} câu hỏi chất lượng cao từ file được cung cấp.

YÊU CẦU:
- Header: ${questionHeader}
- Description: ${questionDescription}
- Ngôn ngữ: ${settings.language || "AUTO"}
- Loại câu hỏi: ${settings.questionType || "MIXED"}
- Độ khó: ${settings.difficulty || "EASY"}
- Số câu hỏi: ${numberOfQuestions}

File đính kèm: ${file.fileName}

QUY TẮC QUAN TRỌNG:
1. Trả về CHÍNH XÁC ${numberOfQuestions} câu hỏi, không nhiều hơn không ít hơn
2. Mỗi câu hỏi trắc nghiệm PHẢI có CHÍNH XÁC 4 đáp án (A, B, C, D)
3. CHỈ có 1 đáp án đúng cho mỗi câu hỏi
4. Response PHẢI là MỘT OBJECT JSON hợp lệ có dạng {"questions": [...]}, không có text khác
5. Phân tích toàn bộ nội dung file để tạo câu hỏi chính xác

FORMAT JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Câu hỏi của bạn?",
      "type": "MULTIPLE_CHOICE",
      "difficulty": "${settings.difficulty || "EASY"}",
      "points": 1,
      "explanation": "Giải thích chi tiết tại sao đáp án này đúng và các đáp án khác sai",
      "tags": ["tag1", "tag2", "tag3"],
      "answers": [
        {"id": "a1", "text": "Đáp án A", "isCorrect": false, "order_index": 0},
        {"id": "a2", "text": "Đáp án B", "isCorrect": true, "order_index": 1},
        {"id": "a3", "text": "Đáp án C", "isCorrect": false, "order_index": 2},
        {"id": "a4", "text": "Đáp án D", "isCorrect": false, "order_index": 3}
      ]
    }
  ]
}

CHỈ TRẢ VỀ OBJECT JSON TRÊN. Không thêm bất kỳ text nào khác.`.trim();

    console.log("🚀 Generating questions from file with AI...");
    console.log(
      "📄 File:",
      file.fileName,
      file.mimeType,
      `${(file.size / 1024).toFixed(1)}KB`,
    );

    const aiResponse = await callOpenRouterApiWithFile(
      apiKey,
      prompt,
      file,
      modelName,
    );

    if (process.env.NODE_ENV === "development") {
      console.log("📝 Parsing AI response from file...");
      console.log("🔍 Full AI Response Length:", aiResponse.length);
      console.log("🔍 Full AI Response:", aiResponse);
    }

    const questions = parseQuestionsFromAI(aiResponse, settings);

    if (questions.length === 0) {
      throw new Error("No questions could be extracted from AI response");
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ Successfully generated ${questions.length} questions from file`,
      );
    }
    return {
      success: true,
      questions,
    };
  } catch (error) {
    console.error("❌ Question generation from file failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
