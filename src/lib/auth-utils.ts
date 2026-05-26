import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

// ============================================================
// Session helpers
// ============================================================

/**
 * Get the current authenticated session on the server.
 * Returns null if unauthenticated.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Get the authenticated user's full DB record.
 * Returns null if unauthenticated or user not found.
 */
export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });
}

// ============================================================
// API Route Guard
// ============================================================

type GuardResult =
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>>; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Guards an API route handler.
 * Returns the session + userId if authenticated, or an error response.
 *
 * Usage in route handler:
 * ```ts
 * const guard = await requireAuth();
 * if (!guard.ok) return guard.response;
 * const { session, userId } = guard;
 * ```
 */
export async function requireAuth(): Promise<GuardResult> {
  const session = await getSession();

  if (!session?.user?.email) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      ),
    };
  }

  // Look up user id from DB (email is the canonical identifier)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      ),
    };
  }

  return { ok: true, session, userId: user.id };
}

// ============================================================
// Error response helpers
// ============================================================

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export function serverErrorResponse(message = "Internal server error") {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    {
      success: false,
      error: `Too many requests. Please try again in ${retryAfter} seconds.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(resetAt),
      },
    }
  );
}
