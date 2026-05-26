import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: user.id },
      include: { nodeProgress: true },
      orderBy: { createdAt: "desc" },
    });

    const progressData = roadmaps.map((r) => {
      let nodes: { id: string }[] = [];
      try {
        nodes = JSON.parse(r.nodes);
      } catch {
        nodes = [];
      }
      const total = nodes.length;
      const completed = r.nodeProgress.filter((np) => np.status === "completed").length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        roadmapId: r.id,
        title: r.title,
        targetRole: r.targetRole,
        totalNodes: total,
        completedNodes: completed,
        percentage,
        earnedXp: r.earnedXp,
        totalXp: r.totalXp,
        nodeProgress: r.nodeProgress,
        isActive: r.isActive,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: progressData });
  } catch (error) {
    console.error("[PROGRESS GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roadmapId, nodeId, status } = body;

    if (!roadmapId || !nodeId || !status) {
      return NextResponse.json(
        { success: false, error: "roadmapId, nodeId, and status are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const roadmap = await prisma.roadmap.findFirst({
      where: { id: roadmapId, userId: user.id },
    });
    if (!roadmap) {
      return NextResponse.json({ success: false, error: "Roadmap not found" }, { status: 404 });
    }

    // Get node XP from roadmap nodes JSON
    let nodeXp = 0;
    try {
      const nodes: { id: string; xpReward: number }[] = JSON.parse(roadmap.nodes);
      const node = nodes.find((n) => n.id === nodeId);
      nodeXp = node?.xpReward ?? 0;
    } catch {
      nodeXp = 0;
    }

    const isCompleting = status === "completed";

    // Upsert node progress
    const nodeProgress = await prisma.nodeProgress.upsert({
      where: { roadmapId_nodeId: { roadmapId, nodeId } },
      create: {
        roadmapId,
        nodeId,
        status,
        xpEarned: isCompleting ? nodeXp : 0,
        completedAt: isCompleting ? new Date() : null,
      },
      update: {
        status,
        xpEarned: isCompleting ? nodeXp : 0,
        completedAt: isCompleting ? new Date() : null,
      },
    });

    // If completing: update roadmap earned XP, user profile XP, and unlock next node
    if (isCompleting) {
      // Recalculate total earned XP from all completed nodes
      const allProgress = await prisma.nodeProgress.findMany({
        where: { roadmapId, status: "completed" },
      });
      const totalEarnedXp = allProgress.reduce((acc, np) => acc + np.xpEarned, 0);

      await prisma.roadmap.update({
        where: { id: roadmapId },
        data: { earnedXp: totalEarnedXp },
      });

      // Update user total XP
      const allRoadmaps = await prisma.roadmap.findMany({ where: { userId: user.id } });
      const totalXp = allRoadmaps.reduce((acc, r) => acc + r.earnedXp, 0) + nodeXp;
      await prisma.profile.update({
        where: { userId: user.id },
        data: { xp: totalXp },
      });

      // Unlock next node in sequence
      try {
        const allNodes: { id: string; order: number }[] = JSON.parse(roadmap.nodes);
        const completedNode = allNodes.find((n) => n.id === nodeId);
        if (completedNode) {
          const nextNode = allNodes
            .filter((n) => n.order > completedNode.order)
            .sort((a, b) => a.order - b.order)[0];
          if (nextNode) {
            await prisma.nodeProgress.upsert({
              where: { roadmapId_nodeId: { roadmapId, nodeId: nextNode.id } },
              create: { roadmapId, nodeId: nextNode.id, status: "unlocked" },
              update: { status: "unlocked" },
            });
          }
        }
      } catch {
        // Non-fatal: node unlock failed
      }
    }

    return NextResponse.json({ success: true, data: nodeProgress });
  } catch (error) {
    console.error("[PROGRESS POST]", error);
    return NextResponse.json({ success: false, error: "Failed to update progress" }, { status: 500 });
  }
}
