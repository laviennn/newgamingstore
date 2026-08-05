-- Dynamic Login/Register Mode migration
-- Run manually in Supabase SQL Editor

-- 1. Add auth_mode column to tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS auth_mode TEXT DEFAULT 'email'
  CHECK (auth_mode IN ('email', 'username'));

-- 2. Members table for Username Auth mode
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (tenant_id, username)
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
