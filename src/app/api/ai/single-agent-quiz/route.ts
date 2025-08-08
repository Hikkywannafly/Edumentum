import axios, { type AxiosError } from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Create optimized axios client for server-side API route
const createServerOpenAIClient = (apiKey: string) => {
  const client = axios.create({
    baseURL: "https://api.openai.com/v1",
    timeout: 60000,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  // Add retry interceptor for rate limiting
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      const retryCount = config._retryCount || 0;
      const maxRetries = 3;

      // Don't retry on quota exhaustion
      const isQuotaExhausted =
        (error.response?.data as any)?.error?.code === "insufficient_quota";

      if (
        error.response?.status === 429 &&
        !isQuotaExhausted &&
        retryCount < maxRetries
      ) {
        config._retryCount = retryCount + 1;
        const delay = 2 ** retryCount * 1000; // 1s, 2s, 4s

        console.warn(`⚠️ Server: Rate limited (429). Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return client(config);
      }

      return Promise.reject(error);
    },
  );

  return client;
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, modelName }: { prompt: string; modelName?: string } =
      await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured on server" },
        { status: 500 },
      );
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 },
      );
    }

    const client = createServerOpenAIClient(apiKey);

    const response = await client.post("/chat/completions", {
      model: modelName || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ success: true, content });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const statusText = error.response?.statusText || "Unknown error";
      const errorData = error.response?.data;

      console.error(
        `Server OpenAI API error: ${status} ${statusText}`,
        errorData,
      );

      // Provide better error messages for quota exhaustion
      let errorMessage = `OpenAI API error: ${status} ${statusText}`;
      if (
        status === 429 &&
        (errorData as any)?.error?.code === "insufficient_quota"
      ) {
        errorMessage =
          "🚫 OpenAI Quota Exhausted - Your OpenAI account has run out of credits. Please check your billing at https://platform.openai.com/account/billing";
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: errorData,
        },
        { status: status === 429 ? 429 : 500 }, // Preserve 429 status for client handling
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
