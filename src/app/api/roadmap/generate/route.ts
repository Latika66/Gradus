import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genAI, ROADMAP_SYSTEM_PROMPT } from "@/lib/gemini";
import { GeneratedRoadmap } from "@/types";

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
    const { skill, level, targetRole } = body;

    if (!skill || !level) {
      return NextResponse.json(
        { success: false, error: "skill and level are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Call Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const prompt = `${ROADMAP_SYSTEM_PROMPT}

Generate a career roadmap for: "${skill}" at ${level} level.${targetRole ? ` Target role: ${targetRole}.` : ""}
Remember: respond with ONLY the raw JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const rawContent = result.response.text() ?? "";

    // Parse JSON response - strip code fences, extract first JSON object
    let roadmapData: GeneratedRoadmap;
    try {
      let cleaned = rawContent.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }
      roadmapData = JSON.parse(cleaned);
    } catch {
      console.error("Gemini JSON parse error:", rawContent.slice(0, 500));
      return NextResponse.json(
        { success: false, error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }

    // Save roadmap to DB
    const roadmap = await prisma.roadmap.create({
      data: {
        userId: user.id,
        title: roadmapData.title,
        targetRole: roadmapData.targetRole ?? skill,
        description: roadmapData.description,
        nodes: JSON.stringify(roadmapData.nodes),
        totalXp: roadmapData.totalXp,
        earnedXp: 0,
        isActive: true,
      },
    });

    // Initialize node progress (first node unlocked, rest locked)
    const nodeProgressData = roadmapData.nodes.map((node, index) => ({
      roadmapId: roadmap.id,
      nodeId: node.id,
      status: index === 0 ? "unlocked" : "locked",
    }));

    await prisma.nodeProgress.createMany({ data: nodeProgressData });

    // Deactivate other roadmaps
    await prisma.roadmap.updateMany({
      where: { userId: user.id, id: { not: roadmap.id } },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: {
        roadmapId: roadmap.id,
        ...roadmapData,
        nodeProgress: Object.fromEntries(
          nodeProgressData.map((np) => [np.nodeId, np.status])
        ),
      },
    });
  } catch (error: any) {
    console.error("[ROADMAP GENERATE ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
