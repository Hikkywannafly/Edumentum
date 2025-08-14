import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const GenerateTitleDescriptionRequestSchema = z.object({
  content: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      type: z.string().optional(),
    }),
  ),
  isExtractMode: z.boolean(),
  targetLanguage: z.string().default("auto"),
  filename: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  modelName: z.string().default("openai/gpt-oss-20b:free"),
});

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = GenerateTitleDescriptionRequestSchema.safeParse(body);

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
      content,
      questions,
      isExtractMode,
      targetLanguage,
      filename,
      category,
      tags,
      modelName,
    } = validated.data;

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OpenRouter API key not configured" },
        { status: 500 },
      );
    }

    // Build prompt on server
    const contentPreview = content.slice(0, 800);
    const questionSamples = questions
      .slice(0, 3)
      .map((q) => q.question)
      .join("\n");
    const contextInfo = [
      `- Questions: ${questions.length}`,
      `- Type: ${isExtractMode ? "Extracted from document" : "AI Generated"}`,
      filename ? `- File: ${filename}` : "",
      category ? `- Topic: ${category}` : "",
      tags && tags.length ? `- Tags: ${tags.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Language detection (simple heuristic) when targetLanguage = 'auto'
    const detectLanguage = (text: string): string => {
      const sample = text.toLowerCase();
      // Vietnamese diacritics or common words
      const viDiacritics =
        /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
      const viWords =
        /(câu hỏi|bài|trắc nghiệm|đúng|sai|mô tả|tiêu đề|nội dung)/i;
      const ko = /[\u3131-\uD79D]/; // Hangul
      const ja = /[\u3040-\u30ff]/; // Hiragana/Katakana
      const zh = /[\u4e00-\u9fff]/; // CJK Unified Ideographs
      if (viDiacritics.test(sample) || viWords.test(sample)) return "vi";
      if (ko.test(sample)) return "ko";
      if (ja.test(sample)) return "ja";
      if (zh.test(sample)) return "zh";
      return "en";
    };

    const requestedLang = (targetLanguage || "auto").toLowerCase();
    const effectiveLanguage =
      requestedLang === "auto"
        ? detectLanguage(`${contentPreview}\n${questionSamples}`)
        : requestedLang;

    const languageNote =
      effectiveLanguage === "vi"
        ? "tiếng Việt tự nhiên"
        : `natural ${effectiveLanguage}`;

    const prompt =
      effectiveLanguage === "vi"
        ? `Dựa trên nội dung và câu hỏi dưới đây, hãy tạo một tiêu đề và mô tả hấp dẫn cho bài quiz này.\n\nNỘI DUNG:\n${contentPreview}\n\nCÂU HỎI MẪU:\n${questionSamples}\n\nTHÔNG TIN QUIZ:\n${contextInfo}\n\nYÊU CẦU:\n1. Tiêu đề: Ngắn gọn, hấp dẫn, phản ánh đúng chủ đề (tối đa 60 ký tự)\n2. Mô tả: Chi tiết hơn, giải thích nội dung và mục đích của quiz (80-150 ký tự)\n3. Sử dụng ${languageNote}\n4. Phản ánh đúng chủ đề và nội dung thực tế\n\nTrả về JSON format:\n{\n  "title": "Tiêu đề quiz",\n  "description": "Mô tả chi tiết về quiz"\n}`
        : `Based on the content and questions below, create an engaging title and description for this quiz.\n\nCONTENT:\n${contentPreview}\n\nSAMPLE QUESTIONS:\n${questionSamples}\n\nQUIZ INFO:\n${contextInfo}\n\nREQUIREMENTS:\n1. Title: Concise, engaging, reflects the topic (max 60 characters)\n2. Description: Detailed explanation of quiz content and purpose (80-150 characters)\n3. Use ${languageNote}\n4. Accurately reflect the actual topic and content\n\nReturn JSON format:\n{\n  "title": "Quiz title",\n  "description": "Detailed quiz description"\n}`;

    const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://edumentum.vercel.app",
        "X-Title": "Edumentum Quiz Title Generator",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content:
              "You are a quiz title and description generator. Always return valid JSON according to the schema. Do not add any explanations outside the JSON response.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 250,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No content returned from AI");
    }

    const parsed = JSON.parse(aiResponse);
    if (!parsed.title || !parsed.description) {
      throw new Error(
        "Invalid AI response format - missing title or description",
      );
    }

    return NextResponse.json({
      success: true,
      title: parsed.title,
      description: parsed.description,
    });
  } catch (error) {
    console.error("Generate title/description API error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
