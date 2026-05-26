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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error: any) {
    console.error("[CONVERSATIONS GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch conversations" },
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title } = body;

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: title || "New Conversation",
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ success: true, data: conversation });
  } catch (error: any) {
    console.error("[CONVERSATION CREATE ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create conversation" },
      { status: 500 }
    );
  }
}
