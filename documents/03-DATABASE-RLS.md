# Security Implementation: Database & Supabase RLS

## 🎯 Objective
Enforce Row Level Security (RLS) across all critical tables to ensure database-level multi-tenant isolation, acting as the last line of defense.

## 📝 Deliverables for AI Agent
1. **Generate Migration SQL (`supabase/migrations/xxxx_secure_rls.sql`):**
   - Write PostgreSQL statements to `ALTER TABLE ENABLE ROW LEVEL SECURITY` for the following tables: `admin_users`, `tenants`, `orders`, `deposits`.
2. **Tenant Isolation Policies:**
   - Create generic RLS policies for `orders` and `deposits` that strictly ensure:
     `(tenant_id = (select auth.jwt()->>'tenant_id')::uuid)`.
   - Ensure `admin_users` can only view/edit data belonging to their assigned `tenant_id`.
3. **Service Role Security Code Audit:**
   - Write a helper utility `lib/supabase/admin.ts` that safely initializes the Supabase client using `SUPABASE_SERVICE_ROLE_KEY`.
   - Add strict comments/JSDoc explicitly warning that this client bypasses RLS and MUST ONLY be used in Server Components/Actions, never exposed to the client.