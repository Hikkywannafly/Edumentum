import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExtractQuestionsRequestSchema = z.object({
  questionHeader: z.string(),
  questionDescription: z.string(),
  apiKey: z.string(),
  fileContent: z.string().optional(),
  modelName: z.string().default("openai/gpt-4o-mini"),
  settings: z
    .object({
      language: z.string().optional(),
      questionType: z.string().optional(),
      numberOfQuestions: z.number().int().min(1).max(10).optional(),
      mode: z.enum(["exact", "max"]).optional(),
      difficulty: z.string().optional(),
    })
    .optional(),
  file: z
    .object({
      fileName: z.string(),
      mimeType: z.string(),
      data: z.string(),
      size: z.number(),
      type: z.string(),
    })
    .optional(),
});

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ExtractQuestionsRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
          details: validated.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      questionHeader,
      questionDescription,
      apiKey,
      fileContent,
      modelName,
      settings = {},
      file,
    } = validated.data;
    const numberOfQuestions = settings.numberOfQuestions || 10;
    const questionType = settings.questionType || "MIXED";

    // Build extraction prompt
    const prompt = `
You are an expert quiz extractor. You need to EXTRACT all existing questions from the provided content.

REQUIREMENTS:
- Header: ${questionHeader}
- Description: ${questionDescription}
- Language: ${settings.language || "AUTO"}
- Question Type: ${questionType}
- Maximum: ${numberOfQuestions} questions

TASK: EXTRACT (do not create new) existing questions and answers from the content.

CRITICAL RULES:
1. ONLY extract questions that ALREADY EXIST, DO NOT create new questions
2. Preserve original question and answer content from source
3. Only ONE correct answer per question (except free response)
4. Response MUST be a valid JSON object with format {"questions": [...]}
5. If no existing questions found, return {"questions": []}

FORMAT:
{
  "questions": [
    {
      "id": "q1",
      "question": "Extracted question verbatim",
      "type": "MULTIPLE_CHOICE",
      "difficulty": "${settings.difficulty || "EASY"}",
      "points": 1,
      "explanation": "Explanation if available in source, or brief explanation",
      "tags": ["tag1", "tag2"],
      "answers": [
        {"id": "a1", "text": "Answer A", "isCorrect": false, "order_index": 0},
        {"id": "a2", "text": "Answer B", "isCorrect": true, "order_index": 1},
        {"id": "a3", "text": "Answer C", "isCorrect": false, "order_index": 2},
        {"id": "a4", "text": "Answer D", "isCorrect": false, "order_index": 3}
      ]
    }
  ]
}

ONLY EXTRACT existing questions. If no quiz format found, return {"questions": []}.`.trim();

    let finalPrompt = prompt;
    const messageContent: any[] = [{ type: "text", text: prompt }];

    // Handle file content
    if (file) {
      if (file.type === "image") {
        messageContent.push({
          type: "image_url",
          image_url: { url: `data:${file.mimeType};base64,${file.data}` },
        });
      } else {
        finalPrompt += `\n\nFile: ${file.fileName} (${file.mimeType})\nContent: ${file.data.slice(0, 8000)}`;
      }
    } else if (fileContent) {
      finalPrompt += `\n\nContent to extract from:\n${fileContent.slice(0, 8000)}`;
    }

    // Call OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_API_BASE}/chat/completions`,
      {
        model: modelName,
        messages:
          file?.type === "image"
            ? [{ role: "user", content: messageContent }]
            : [{ role: "user", content: finalPrompt }],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumentum.vercel.app",
          "X-Title": "Edumentum Quiz Extractor",
        },
        timeout: 90000,
      },
    );

    const aiResponse = response.data.choices?.[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No content returned from AI");
    }

    // Parse and validate response
    const parsed = JSON.parse(aiResponse);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return NextResponse.json({
        success: true,
        questions: [], // Return empty array if no questions found
      });
    }

    return NextResponse.json({
      success: true,
      questions: parsed.questions,
    });
  } catch (error) {
    console.error("Extract questions API error:", error);

    let errorMessage = "Failed to extract questions";
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 401) {
        errorMessage = "Invalid API key";
      } else if (status === 429) {
        errorMessage =
          errorData?.error?.code === "insufficient_quota"
            ? "API quota exhausted - please check your billing"
            : "Rate limit exceeded";
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
