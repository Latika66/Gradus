import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequestResponse, serverErrorResponse } from "@/lib/auth-utils";
import { changePasswordSchema, getFirstError } from "@/lib/validations";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ── Rate Limiting ──────────────────────────────────────────
  const identifier = getClientIdentifier(req, "change-password");
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.changePassword);

  if (!rateLimit.success) {
    const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { success: false, error: `Too many attempts. Retry in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // ── Auth Guard ─────────────────────────────────────────────
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {
    // ── Input Validation ───────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const message = getFirstError(parsed) ?? "Invalid input";
      return badRequestResponse(message);
    }

    const { currentPassword, newPassword } = parsed.data;

    // ── Fetch current hashed password ──────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return badRequestResponse("User not found");
    }

    // OAuth users don't have a password — they should use OAuth to log in
    if (!user.password) {
      return badRequestResponse(
        "Your account uses Google Sign-In. Password change is not available."
      );
    }

    // ── Verify current password ────────────────────────────
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentValid) {
      return badRequestResponse("Current password is incorrect.");
    }

    // Prevent re-using the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return badRequestResponse("New password must be different from your current password.");
    }

    // ── Hash & Update ──────────────────────────────────────
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("[CHANGE-PASSWORD ERROR]", error);
    return serverErrorResponse("Failed to update password.");
  }
}
