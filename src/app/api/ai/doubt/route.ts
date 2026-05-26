import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { genAI, CHAT_SYSTEM_PROMPT } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "messages array is required" },
        { status: 400 }
      );
    }

    // Limit conversation history to last 20 messages to control token usage
    const recentMessages = messages.slice(-20);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: CHAT_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1000,
      },
    });

    const contents = recentMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({ contents });
    const reply = result.response.text() ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ success: true, data: { reply } });
  } catch (error: any) {
    console.error("[DOUBT SOLVER ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to get AI response" },
      { status: 500 }
    );
  }
}
