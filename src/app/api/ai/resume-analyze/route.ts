import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genAI, RESUME_ANALYZE_PROMPT } from "@/lib/gemini";
import pdf from "pdf-parse";

export const dynamic = "force-dynamic";

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

    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const parsedAnalyses = analyses.map((a) => ({
      ...a,
      strengths: JSON.parse(a.strengths),
      weaknesses: JSON.parse(a.weaknesses),
      missingKeywords: JSON.parse(a.missingKeywords),
      projectSuggestions: JSON.parse(a.projectSuggestions),
    }));

    return NextResponse.json({ success: true, data: parsedAnalyses });
  } catch (error: any) {
    console.error("[RESUME GET ERROR]", error);
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetRole = formData.get("targetRole") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Please upload a PDF resume." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Convert file to buffer and parse PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let resumeText = "";
    try {
      const parsedPdf = await pdf(buffer);
      resumeText = parsedPdf.text;
    } catch (err: any) {
      console.error("PDF Parsing error:", err);
      return NextResponse.json(
        { success: false, error: "Failed to parse PDF resume text" },
        { status: 400 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { success: false, error: "The uploaded PDF appears to be empty or unreadable." },
        { status: 400 }
      );
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

    const prompt = `${RESUME_ANALYZE_PROMPT}

Analyze the following resume text.
${targetRole ? `Target Role specified: "${targetRole}"` : "Target Role: General Software/Tech role"}

Resume Text:
${resumeText}

Remember: respond with ONLY the raw JSON object, nothing else.`;

    const aiResult = await model.generateContent(prompt);
    const rawContent = aiResult.response.text() ?? "";

    let analysisData: {
      atsScore: number;
      summary: string;
      strengths: string[];
      weaknesses: string[];
      missingKeywords: string[];
      projectSuggestions: Array<{ title: string; description: string; tech: string[] }>;
      fitScore: number;
    };

    try {
      let cleaned = rawContent.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      analysisData = JSON.parse(cleaned);
    } catch {
      console.error("Gemini JSON parse error:", rawContent.slice(0, 500));
      return NextResponse.json(
        { success: false, error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }

    // Save to database
    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        userId: user.id,
        fileName: file.name,
        atsScore: analysisData.atsScore || 0,
        summary: analysisData.summary || "",
        strengths: JSON.stringify(analysisData.strengths || []),
        weaknesses: JSON.stringify(analysisData.weaknesses || []),
        missingKeywords: JSON.stringify(analysisData.missingKeywords || []),
        projectSuggestions: JSON.stringify(analysisData.projectSuggestions || []),
        fitScore: analysisData.fitScore || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...savedAnalysis,
        strengths: analysisData.strengths,
        weaknesses: analysisData.weaknesses,
        missingKeywords: analysisData.missingKeywords,
        projectSuggestions: analysisData.projectSuggestions,
      },
    });
  } catch (error: any) {
    console.error("[RESUME POST ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
