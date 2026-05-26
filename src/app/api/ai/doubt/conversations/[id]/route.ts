import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
    });

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized access to conversation" }, { status: 403 });
    }

    await prisma.conversation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Conversation deleted successfully" });
  } catch (error: any) {
    console.error("[CONVERSATION DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
