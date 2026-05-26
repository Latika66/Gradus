import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevel, getLevelProgress, getRank, getXPForNextLevel } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        userAchievements: { include: { achievement: true } },
        roadmaps: {
          where: { isActive: true },
          include: { nodeProgress: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const xp = user.profile.xp;
    const level = getLevel(xp);
    const xpProgress = getLevelProgress(xp);
    const rank = getRank(level);
    const xpToNextLevel = getXPForNextLevel(level);

    // Count completed nodes
    const completedNodes = user.roadmaps.reduce((acc, r) => {
      return acc + r.nodeProgress.filter((np) => np.status === "completed").length;
    }, 0);

    const totalNodes = user.roadmaps.reduce((acc, r) => {
      try {
        const nodes = JSON.parse(r.nodes);
        return acc + nodes.length;
      } catch {
        return acc;
      }
    }, 0);

    const achievements = user.userAchievements.map((ua) => ({
      ...ua.achievement,
      earnedAt: ua.earnedAt,
    }));

    // Build active roadmap summary
    const activeRoadmap = user.roadmaps[0]
      ? {
          id: user.roadmaps[0].id,
          title: user.roadmaps[0].title,
          targetRole: user.roadmaps[0].targetRole,
          nodes: JSON.parse(user.roadmaps[0].nodes),
          nodeProgress: user.roadmaps[0].nodeProgress.reduce(
            (acc: Record<string, string>, np) => {
              acc[np.nodeId] = np.status;
              return acc;
            },
            {}
          ),
          totalXp: user.roadmaps[0].totalXp,
          earnedXp: user.roadmaps[0].earnedXp,
        }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: user.profile.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          xp: user.profile.xp,
          level,
          currentStreak: user.profile.currentStreak,
          totalDays: user.profile.totalDays,
          skills: JSON.parse(user.profile.skills),
          interests: JSON.parse(user.profile.interests),
          targetRole: user.profile.targetRole,
          bio: user.profile.bio,
        },
        stats: {
          xp,
          level,
          xpToNextLevel,
          xpProgress,
          completedNodes,
          totalNodes,
          currentStreak: user.profile.currentStreak,
          achievements: achievements.length,
          rank,
        },
        activeRoadmap,
        achievements,
      },
    });
  } catch (error) {
    console.error("[PROFILE GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, targetRole, skills, interests } = body;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Update user name if provided
    if (name) {
      await prisma.user.update({ where: { id: user.id }, data: { name } });
    }

    // Update profile
    const updated = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(targetRole !== undefined && { targetRole }),
        ...(skills && { skills: JSON.stringify(skills) }),
        ...(interests && { interests: JSON.stringify(interests) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PROFILE PATCH]", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
