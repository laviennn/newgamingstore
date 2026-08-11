import { Ratelimit } from '@upstash/ratelimit';
import { redis, hasRedisCredentials } from './redis';

/**
 * In-memory fallback rate limiter untuk lingkungan local development
 * ketika variabel lingkungan UPSTASH_REDIS belum dikonfigurasi.
 */
class MemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();

  async limit(identifier: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const timestamps = (this.requests.get(identifier) || []).filter(
      (time) => now - time < windowMs
    );

    if (timestamps.length >= maxRequests) {
      const reset = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      return { success: false, limit: maxRequests, remaining: 0, reset };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - timestamps.length,
      reset: Math.ceil(windowMs / 1000),
    };
  }
}

const memoryLimiter = new MemoryRateLimiter();

/**
 * Rate Limiter Ketat untuk Admin Login Endpoint:
 * Maksimal 5 percobaan per 15 menit per IP / identifier.
 */
export const adminLoginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/admin-login',
    })
  : null;

/**
 * Rate Limiter Standar untuk Storefront Mutations (Checkout & Deposit):
 * Maksimal 10 request per 1 menit per IP atau User ID.
 */
export const storefrontMutationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/storefront-mutation',
    })
  : null;

/**
 * Helper terpadu untuk memverifikasi Rate Limit pada Middleware maupun Server Actions.
 * Mendukung Upstash Redis & Fallback ke in-memory jika env tidak tersedia.
 */
export async function checkRateLimit(
  type: 'admin-login' | 'storefront-mutation',
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  let result: { success: boolean; limit: number; remaining: number; reset: number };

  if (hasRedisCredentials && redis) {
    const limiter = type === 'admin-login' ? adminLoginLimiter : storefrontMutationLimiter;
    if (limiter) {
      const res = await limiter.limit(identifier);
      result = {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } else {
      result = await memoryLimiter.limit(
        type === 'admin-login' ? `admin-login:${identifier}` : `storefront:${identifier}`,
        type === 'admin-login' ? 5 : 10,
        type === 'admin-login' ? 15 * 60 * 1000 : 60 * 1000
      );
    }
  } else {
    // Fallback ke in-memory rate limiter jika kredensial Redis belum di-set di local dev
    if (type === 'admin-login') {
      result = await memoryLimiter.limit(`admin-login:${identifier}`, 5, 15 * 60 * 1000);
    } else {
      result = await memoryLimiter.limit(`storefront:${identifier}`, 10, 60 * 1000);
    }
  }

  // Kirim log error ke server console jika batas rate limit terlampaui
  if (!result.success) {
    console.error(
      `[RATE_LIMIT_EXCEEDED] [${new Date().toISOString()}] Type: "${type}" | Identifier: "${identifier}" | Limit: ${result.limit} | ResetIn: ${result.reset}s`
    );
  }

  return result;
}
