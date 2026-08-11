import { Redis } from '@upstash/redis';

// Deteksi ketersediaan kredensial Upstash Redis
export const hasRedisCredentials = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Inisialisasi instance Redis jika env terpasang, jika tidak set null
export const redis = hasRedisCredentials
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;
