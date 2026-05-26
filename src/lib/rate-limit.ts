/**
 * Production-grade in-memory sliding-window rate limiter.
 * Works per IP. For multi-instance deployments, replace with Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (entry.resetAt < now) store.delete(key);
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSecs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // Unix ms timestamp
}

/**
 * Check rate limit for a given identifier (IP + route).
 * @param identifier - e.g. `${ip}:register`
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSecs * 1000;

  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // First request or window expired — reset
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: config.limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Extracts a safe identifier from a Next.js request for rate limiting.
 * Respects X-Forwarded-For for proxied environments.
 */
export function getClientIdentifier(req: Request, route: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${ip}:${route}`;
}

// Preset configurations
export const RATE_LIMITS = {
  register: { limit: 5, windowSecs: 60 * 15 },       // 5 registrations per 15 min
  login: { limit: 10, windowSecs: 60 * 15 },           // 10 attempts per 15 min
  changePassword: { limit: 5, windowSecs: 60 * 60 },   // 5 attempts per hour
  api: { limit: 60, windowSecs: 60 },                  // 60 general API calls/min
} satisfies Record<string, RateLimitConfig>;
