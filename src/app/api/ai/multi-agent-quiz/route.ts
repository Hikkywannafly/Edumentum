import { parseQuestionsFromAI } from "@/lib/services/ai-llm.service";
import { generateQuestionsWithMultiAgent } from "@/lib/services/multi-agent-workflow";
import { type NextRequest, NextResponse } from "next/server";

interface MultiAgentRequest {
  questionHeader: string;
  questionDescription: string;
  apiKey: string;
  fileContent: string;
  siteUrl?: string;
  siteName?: string;
  modelName?: string;
  settings?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: MultiAgentRequest = await request.json();

    const {
      questionHeader,
      questionDescription,
      apiKey,
      fileContent,
      siteUrl,
      siteName,
      modelName,
      settings,
    } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 },
      );
    }

    console.log("🤖 Starting multi-agent workflow via API");

    const result = await generateQuestionsWithMultiAgent({
      questionHeader,
      questionDescription: `${questionDescription}\n\nContent:\n${fileContent}`,
      apiKey,
      siteUrl,
      siteName,
      modelName,
    });

    if (result.success && result.streamEvents && result.stream) {
      // Process the stream to extract final questions
      console.log("📊 Processing multi-agent stream in API...");
      let finalQuestions: any[] = [];

      try {
        for await (const event of result.stream) {
          if (event.Formatter && event.Formatter.messages) {
            const formatterMessage = event.Formatter.messages[0];
            if (formatterMessage && formatterMessage.content) {
              const content = formatterMessage.content as string;
              finalQuestions = parseQuestionsFromAI(content, settings);
              break;
            }
          }
        }
      } catch (streamError) {
        console.error("Error processing multi-agent stream:", streamError);
        return NextResponse.json(
          { success: false, error: "Failed to process multi-agent stream" },
          { status: 500 },
        );
      }

      if (finalQuestions.length > 0) {
        console.log(
          `✅ Multi-agent API generated ${finalQuestions.length} questions`,
        );
        return NextResponse.json({
          success: true,
          questions: finalQuestions,
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Multi-agent workflow failed to generate questions",
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("❌ Multi-agent API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Multi-agent workflow failed: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
