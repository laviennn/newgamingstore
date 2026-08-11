# 🛡️ Global Security Guidelines & Architecture Context

## 🏗️ Architecture Stack
- **Framework:** Next.js 16 (App Router ONLY, strict Server Components & Server Actions paradigm).
- **Database & Auth:** Supabase (PostgreSQL).
- **Architecture:** Multi-Tenant Architecture (Database shared, row isolated via `tenant_id`).
- **Infrastructure:** Vercel (Hosting), Cloudflare (WAF/DNS), Cloudflare R2 (Object Storage).

## 🔒 Core Security Principles (Zero Trust)
1. **Never Trust the Client:** UI/Frontend checks are for UX only. All actual validation and authorization MUST happen on the Server/Backend.
2. **Strict App Router Paradigms:** Do NOT use traditional `/pages` API routes. All mutations must use Server Actions (`"use strict"`).
3. **Multi-Tenant Isolation:** Every single database query and mutation MUST include a strict check against the active session's `tenant_id`. Cross-tenant data leakage is a critical failure.
4. **Secure by Default:** All inputs must be validated with Zod. All database tables must have RLS enabled.

## 🤖 Instructions for AI Agent
- When generating code, always prioritize security over brevity.
- Do not use deprecated Next.js features.
- If a security measure requires an environment variable, explicitly list it in the response.
- Do not output generic code; tailor the code specifically to a multi-tenant e-commerce/transactional system.