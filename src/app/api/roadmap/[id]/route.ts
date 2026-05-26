import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const roadmap = await prisma.roadmap.findFirst({
      where: { id: params.id, userId: user.id },
      include: { nodeProgress: true },
    });

    if (!roadmap) {
      return NextResponse.json({ success: false, error: "Roadmap not found" }, { status: 404 });
    }

    let nodes = [];
    try {
      nodes = JSON.parse(roadmap.nodes);
    } catch {
      nodes = [];
    }

    const nodeProgressMap = roadmap.nodeProgress.reduce(
      (acc: Record<string, string>, np) => {
        acc[np.nodeId] = np.status;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      data: {
        id: roadmap.id,
        title: roadmap.title,
        targetRole: roadmap.targetRole,
        description: roadmap.description,
        nodes,
        nodeProgress: nodeProgressMap,
        totalXp: roadmap.totalXp,
        earnedXp: roadmap.earnedXp,
        isActive: roadmap.isActive,
        createdAt: roadmap.createdAt,
      },
    });
  } catch (error) {
    console.error("[ROADMAP GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch roadmap" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    await prisma.roadmap.deleteMany({
      where: { id: params.id, userId: user.id },
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("[ROADMAP DELETE]", error);
    return NextResponse.json({ success: false, error: "Failed to delete roadmap" }, { status: 500 });
  }
}
