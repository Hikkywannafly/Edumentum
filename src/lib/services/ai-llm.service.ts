import type { Difficulty, QuestionData } from "@/types/quiz";
import axios, { type AxiosInstance, type AxiosError } from "axios";
import { ContentExtractor } from "./content-extractor.service";
import type { FileForAI } from "./file-to-ai.service";

// AI service for quiz generation (NOT extraction)
const OPENAI_API_BASE = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-3.5-turbo";

// Cache axios clients to avoid recreating instances
const clientCache = new Map<string, AxiosInstance>();

// Create optimized axios instance with retry logic
const createOpenAIClient = (apiKey: string): AxiosInstance => {
  // Use cached client if available (performance optimization)
  const cacheKey = apiKey.substring(0, 10); // Use partial key for caching
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey) as AxiosInstance;
  }

  const client = axios.create({
    baseURL: OPENAI_API_BASE,
    timeout: 90000, // 90 seconds for longer requests
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    // Performance optimizations
    maxRedirects: 0,
    validateStatus: (status) => status < 500, // Don't throw on 4xx errors, handle them manually
  });

  // Add retry interceptor for rate limiting (429) and network errors
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      const retryCount = config._retryCount || 0;
      const maxRetries = 4; // Increased retries for better resilience

      // Handle rate limiting (429), timeout errors, and connection resets
      // BUT NOT quota exhaustion (insufficient_quota) - retrying won't help
      const isQuotaExhausted =
        (error.response?.data as any)?.error?.code === "insufficient_quota";
      const shouldRetry =
        ((error.response?.status === 429 && !isQuotaExhausted) ||
          error.response?.status === 503 || // Service unavailable
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.code === "ENOTFOUND") &&
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
        `🚀 OpenAI API Request: ${config.method?.toUpperCase()} ${config.url}`,
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
  console.log("🧹 OpenAI client cache cleared");
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

async function callOpenAIApi(
  apiKey: string,
  prompt: string,
  modelName = DEFAULT_MODEL,
): Promise<string> {
  try {
    const client = createOpenAIClient(apiKey);

    const response = await client.post("/chat/completions", {
      model: modelName,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Handle HTTP error status codes that didn't trigger retry
    if (response.status >= 400) {
      const errorData = response.data;
      console.error(`OpenAI API error ${response.status}:`, errorData);

      // Provide more specific error messages
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
      if (errorData?.error?.message) {
        errorMessage += ` - ${errorData.error.message}`;
      }

      throw new Error(errorMessage);
    }

    const responseContent = response.data.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No content returned from OpenAI API");
    }

    return responseContent;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const errorData = error.response?.data;

      console.error(
        `OpenAI API call failed: ${status} ${statusText}`,
        errorData,
      );

      // Provide helpful error messages based on status and error type
      let userMessage = `OpenAI API error: ${status} ${statusText}`;
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
      } else if (status === 503) {
        userMessage += " - Service temporarily unavailable";
      } else if (errorData?.error?.message) {
        userMessage += ` - ${errorData.error.message}`;
      }

      throw new Error(userMessage);
    }

    console.error("OpenAI API call failed:", error);
    throw error;
  }
}

async function callOpenAIApiWithFile(
  apiKey: string,
  prompt: string,
  file: FileForAI,
  modelName = "gpt-4o", // Use vision model for file support
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

    const response = await client.post("/chat/completions", {
      model: modelName,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Handle HTTP error status codes
    if (response.status >= 400) {
      const errorData = response.data;
      console.error(`OpenAI API file error ${response.status}:`, errorData);

      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
      if (errorData?.error?.message) {
        errorMessage += ` - ${errorData.error.message}`;
      }

      throw new Error(errorMessage);
    }

    const responseContent = response.data.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error(
        "No content returned from OpenAI API for file processing",
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

export function parseQuestionsFromAI(
  aiResponse: string,
  settings?: GenerateQuestionsParams["settings"],
): QuestionData[] {
  console.log("🔍 Parsing AI Response, length:", aiResponse.length);
  console.log(
    "🔍 Raw AI Response (first 500 chars):",
    aiResponse.substring(0, 500),
  );

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

  // Remove any extra text before the JSON
  cleanedResponse = cleanedResponse.replace(/^[^[\{]*/, "").trim();

  // Try multiple approaches to find valid JSON
  const jsonExtractionMethods = [
    // Method 1: Look for array brackets
    () => {
      const startIndex = cleanedResponse.indexOf("[");
      const endIndex = cleanedResponse.lastIndexOf("]");
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return cleanedResponse.substring(startIndex, endIndex + 1);
      }
      return null;
    },

    // Method 2: Look for object brackets (single object)
    () => {
      const startIndex = cleanedResponse.indexOf("{");
      const endIndex = cleanedResponse.lastIndexOf("}");
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonContent = cleanedResponse.substring(startIndex, endIndex + 1);
        // Wrap single object in array
        return `[${jsonContent}]`;
      }
      return null;
    },

    // Method 3: Use the entire cleaned response
    () => {
      return cleanedResponse;
    },
  ];

  for (const [index, method] of jsonExtractionMethods.entries()) {
    try {
      const jsonString = method();
      if (!jsonString) continue;

      console.log(
        `🔍 Trying extraction method ${index + 1}:`,
        jsonString.substring(0, 200),
      );

      const parsed = JSON.parse(jsonString);

      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(
          `✅ Successfully parsed JSON with method ${index + 1}, found ${parsed.length} items`,
        );
        return processQuestionArray(parsed, settings);
      }

      if (typeof parsed === "object" && parsed !== null) {
        // Single question object
        console.log(
          `✅ Successfully parsed single question object with method ${index + 1}`,
        );
        return processQuestionArray([parsed], settings);
      }
    } catch (error) {
      console.warn(`⚠️ Method ${index + 1} failed:`, error);
    }
  }

  // Fallback: Try to extract questions using regex patterns
  console.log("🔧 Attempting regex fallback extraction...");
  try {
    const regexQuestions = extractQuestionsWithRegex(aiResponse, settings);
    if (regexQuestions.length > 0) {
      console.log(
        `✅ Regex fallback extracted ${regexQuestions.length} questions`,
      );
      return regexQuestions;
    }
  } catch (regexError) {
    console.warn("❌ Regex fallback also failed:", regexError);
  }

  console.error("❌ All parsing methods failed");
  console.error("❌ Full AI response:", aiResponse);
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
      answers,
      shortAnswerText: q.shortAnswerText || "",
    };
  });
}

function extractQuestionsWithRegex(
  text: string,
  settings?: GenerateQuestionsParams["settings"],
): QuestionData[] {
  const questions: QuestionData[] = [];

  // Try to find question patterns
  const questionPatterns = [
    /(?:Question|Câu hỏi)\s*\d*[:.]\s*(.+?)(?=(?:Question|Câu hỏi)\s*\d*[:..]|$)/gi,
    /^\d+[.)]\s*(.+?)(?=^\d+[.)]|$)/gm,
    /\?\s*(?:\n|$)/gm,
  ];

  for (const pattern of questionPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      matches.forEach((match, index) => {
        const cleanQuestion = match
          .replace(/^(?:Question|Câu hỏi)\s*\d*[:.]\s*/, "")
          .trim();
        if (cleanQuestion.length > 10) {
          // Only include substantial questions
          questions.push({
            id: `regex-q-${Date.now()}-${index}`,
            question: cleanQuestion,
            type: "MULTIPLE_CHOICE",
            difficulty: (settings?.difficulty || "EASY") as Difficulty,
            points: 1,
            explanation: "",
            answers: [
              {
                id: `a-${index}-0`,
                text: "Option A",
                isCorrect: true,
                order_index: 0,
              },
              {
                id: `a-${index}-1`,
                text: "Option B",
                isCorrect: false,
                order_index: 1,
              },
              {
                id: `a-${index}-2`,
                text: "Option C",
                isCorrect: false,
                order_index: 2,
              },
              {
                id: `a-${index}-3`,
                text: "Option D",
                isCorrect: false,
                order_index: 3,
              },
            ],
            shortAnswerText: "",
          });
        }
      });

      if (questions.length > 0) break; // Use first successful pattern
    }
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
      1,
      Math.min(10, settings.numberOfQuestions || 5),
    );
    const prompt = `
Bạn là một chuyên gia tạo quiz. Bạn PHẢI trả về CHÍNH XÁC ${numberOfQuestions} câu hỏi chất lượng cao.

YÊU CẦU:
- Header: ${questionHeader}
- Description: ${questionDescription}
- Ngôn ngữ: ${settings.language || "AUTO"}
- Loại câu hỏi: ${settings.questionType || "MIXED"}
- Độ khó: ${settings.difficulty || "EASY"}
- Số câu hỏi: ${numberOfQuestions}

Nội dung để tạo câu hỏi:
${fileContent}

QUY TẮC QUAN TRỌNG:
1. Trả về CHÍNH XÁC ${numberOfQuestions} câu hỏi, không nhiều hơn không ít hơn
2. Mỗi câu hỏi trắc nghiệm PHẢI có CHÍNH XÁC 4 đáp án (A, B, C, D)
3. CHỈ có 1 đáp án đúng cho mỗi câu hỏi
4. Response PHẢI là JSON array hợp lệ, không có text khác

FORMAT JSON:
[
  {
    "id": "q1",
    "question": "Câu hỏi của bạn?",
    "type": "MULTIPLE_CHOICE",
    "difficulty": "${settings.difficulty || "EASY"}",
    "points": 1,
    "explanation": "Giải thích tại sao đáp án này đúng",
    "answers": [
      {"id": "a1", "text": "Đáp án A", "isCorrect": false, "order_index": 0},
      {"id": "a2", "text": "Đáp án B", "isCorrect": true, "order_index": 1},
      {"id": "a3", "text": "Đáp án C", "isCorrect": false, "order_index": 2},
      {"id": "a4", "text": "Đáp án D", "isCorrect": false, "order_index": 3}
    ]
  }
]

PHẢI TRẢ VỀ ${numberOfQuestions} OBJECT TRONG ARRAY. Chỉ trả về JSON array, không có text khác.`.trim();

    console.log("🚀 Generating questions with AI...");
    const aiResponse = await callOpenAIApi(apiKey, prompt, modelName);

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
5. Response PHẢI là JSON array hợp lệ, không có text khác
6. Nếu không tìm thấy câu hỏi có sẵn, trả về array rỗng []

FORMAT JSON:
[
  {
    "id": "q1",
    "question": "Câu hỏi được trích xuất nguyên văn",
    "type": "MULTIPLE_CHOICE",
    "difficulty": "${settings.difficulty || "EASY"}",
    "points": 1,
    "explanation": "Giải thích nếu có sẵn trong nguồn",
    "answers": [
      {"id": "a1", "text": "Đáp án A", "isCorrect": false, "order_index": 0},
      {"id": "a2", "text": "Đáp án B", "isCorrect": true, "order_index": 1},
      {"id": "a3", "text": "Đáp án C", "isCorrect": false, "order_index": 2},
      {"id": "a4", "text": "Đáp án D", "isCorrect": false, "order_index": 3}
    ]
  }
]

CHỈ TRÍCH XUẤT câu hỏi có SẴN. Nếu không có quiz format, trả về [].`.trim();

    console.log("🔍 Extracting questions with AI...");

    let aiResponse: string;

    if (file) {
      console.log(
        "📄 File:",
        file.fileName,
        file.mimeType,
        `${(file.size / 1024).toFixed(1)}KB`,
      );
      aiResponse = await callOpenAIApiWithFile(
        apiKey,
        prompt,
        file,
        "gpt-4o", // Use vision model for file support
      );
    } else {
      aiResponse = await callOpenAIApi(
        apiKey,
        `${prompt}\n\nContent to extract from:\n${fileContent}`,
        modelName,
      );
    }

    console.log("📝 Parsing AI extraction response...");
    console.log("🔍 Full AI Response Length:", aiResponse.length);
    console.log("🔍 Full AI Response:", aiResponse);

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
    modelName = "gpt-4o", // Use vision model for file support
    settings = {},
    file,
  } = params;

  try {
    const numberOfQuestions = Math.max(
      1,
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
4. Response PHẢI là JSON array hợp lệ, không có text khác
5. Phân tích toàn bộ nội dung file để tạo câu hỏi chính xác

FORMAT JSON:
[
  {
    "id": "q1",
    "question": "Câu hỏi của bạn?",
    "type": "MULTIPLE_CHOICE",
    "difficulty": "${settings.difficulty || "EASY"}",
    "points": 1,
    "explanation": "Giải thích tại sao đáp án này đúng",
    "answers": [
      {"id": "a1", "text": "Đáp án A", "isCorrect": false, "order_index": 0},
      {"id": "a2", "text": "Đáp án B", "isCorrect": true, "order_index": 1},
      {"id": "a3", "text": "Đáp án C", "isCorrect": false, "order_index": 2},
      {"id": "a4", "text": "Đáp án D", "isCorrect": false, "order_index": 3}
    ]
  }
]

PHẢI TRẢ VỀ ${numberOfQuestions} OBJECT TRONG ARRAY. Chỉ trả về JSON array, không có text khác.`.trim();

    console.log("🚀 Generating questions from file with AI...");
    console.log(
      "📄 File:",
      file.fileName,
      file.mimeType,
      `${(file.size / 1024).toFixed(1)}KB`,
    );

    const aiResponse = await callOpenAIApiWithFile(
      apiKey,
      prompt,
      file,
      modelName,
    );

    console.log("📝 Parsing AI response from file...");
    console.log("🔍 Full AI Response Length:", aiResponse.length);
    console.log("🔍 Full AI Response:", aiResponse);

    const questions = parseQuestionsFromAI(aiResponse, settings);

    if (questions.length === 0) {
      throw new Error("No questions could be extracted from AI response");
    }

    console.log(
      `✅ Successfully generated ${questions.length} questions from file`,
    );
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
