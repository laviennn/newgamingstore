# Security Implementation: Rate Limiting & Brute Force Protection

## 🎯 Objective
Prevent brute-force attacks on Admin login endpoints and protect public checkout/deposit endpoints from spam/DDoS.

## 🛠️ Required Technologies
- `@upstash/ratelimit` & `@upstash/redis` (Implementation via Next.js Middleware/Serverless).

## 📝 Deliverables for AI Agent
1. **Create Redis Client:** Initialize Upstash Redis client in `lib/redis.ts`.
2. **Implement Rate Limiter Logic (`lib/rate-limit.ts`):**
   - Create a strict limiter for `/login` (Max 5 attempts per 15 minutes per IP).
   - Create a standard limiter for storefront mutations like `/checkout` or `/deposit` (Max 10 requests per minute per IP or User ID).
3. **Middleware Integration (`middleware.ts`):**
   - Integrate the login rate limiter specifically for the admin login path/subdomain.
   - Return a `429 Too Many Requests` response if the limit is exceeded, without leaking backend errors.
4. **Action Integration:** Show an example of wrapping a Server Action (e.g., `processDepositAction`) with the rate limiter based on the user's session ID.