import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genAI, SKILL_GAP_PROMPT } from "@/lib/gemini";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SkillGapSchema = z.object({
  targetRole: z.string().min(2, "Target role is required"),
  experienceLevel: z.string().min(2, "Experience level is required"),
  currentSkills: z.array(z.string()),
  experienceSummary: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const analyses = await prisma.skillAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Parse stringified JSON fields for response
    const parsedAnalyses = analyses.map((a) => ({
      ...a,
      currentSkills: JSON.parse(a.currentSkills),
      missingSkills: JSON.parse(a.missingSkills),
      suggestions: JSON.parse(a.suggestions),
    }));

    return NextResponse.json({ success: true, data: parsedAnalyses });
  } catch (error: any) {
    console.error("[SKILL GAP GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "AI API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const result = SkillGapSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { targetRole, experienceLevel, currentSkills, experienceSummary } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Call Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const prompt = `${SKILL_GAP_PROMPT}

Analyze skill gaps for a user aiming to be a "${targetRole}" at ${experienceLevel} level.
Current skills: ${JSON.stringify(currentSkills)}.
Background summary: ${experienceSummary || "Not provided"}.
Compare their profile, find missing skills, categorize them by beginner/intermediate/advanced gaps, and suggest improvement steps.
Remember: respond with ONLY the raw JSON object, nothing else.`;

    const aiResult = await model.generateContent(prompt);
    const rawContent = aiResult.response.text() ?? "";

    let gapData: {
      targetRole: string;
      matchScore: number;
      missingSkills: Array<{ name: string; importance: string; category: string }>;
      suggestions: string[];
    };

    try {
      let cleaned = rawContent.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      gapData = JSON.parse(cleaned);
    } catch {
      console.error("Gemini JSON parse error:", rawContent.slice(0, 500));
      return NextResponse.json(
        { success: false, error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }

    // Save to database
    const savedAnalysis = await prisma.skillAnalysis.create({
      data: {
        userId: user.id,
        targetRole: gapData.targetRole || targetRole,
        experienceLevel,
        currentSkills: JSON.stringify(currentSkills),
        missingSkills: JSON.stringify(gapData.missingSkills),
        suggestions: JSON.stringify(gapData.suggestions),
        matchScore: gapData.matchScore || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...savedAnalysis,
        currentSkills,
        missingSkills: gapData.missingSkills,
        suggestions: gapData.suggestions,
      },
    });
  } catch (error: any) {
    console.error("[SKILL GAP POST ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to analyze skill gaps" },
      { status: 500 }
    );
  }
}
