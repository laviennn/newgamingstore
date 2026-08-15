-- Migration: Fix Multi-Tenant Unique Constraints (Slug & Promo Code)
-- Mengubah Unique Constraint dari Global menjadi Per-Tenant (Composite Unique Constraint)
-- Jalankan skrip ini di Supabase SQL Editor

-- 1. Tabel GAMES: Ubah unique slug menjadi per-tenant (tenant_id, slug)
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_slug_key;
ALTER TABLE public.games ADD CONSTRAINT games_tenant_id_slug_key UNIQUE (tenant_id, slug);

-- 2. Tabel CATEGORIES: Ubah unique slug menjadi per-tenant (tenant_id, slug)
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE public.categories ADD CONSTRAINT categories_tenant_id_slug_key UNIQUE (tenant_id, slug);

-- 3. Tabel ARTICLES: Ubah unique slug menjadi per-tenant (tenant_id, slug)
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_slug_key;
ALTER TABLE public.articles ADD CONSTRAINT articles_tenant_id_slug_key UNIQUE (tenant_id, slug);

-- 4. Tabel PROMO_CODES: Ubah unique promo code menjadi per-tenant (tenant_id, code)
ALTER TABLE public.promo_codes DROP CONSTRAINT IF EXISTS promo_codes_code_key;
ALTER TABLE public.promo_codes ADD CONSTRAINT promo_codes_tenant_id_code_key UNIQUE (tenant_id, code);

-- 5. Tambahkan Index untuk mempercepat query pencarian slug per-tenant
CREATE INDEX IF NOT EXISTS idx_games_tenant_slug ON public.games(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_slug ON public.categories(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_articles_tenant_slug ON public.articles(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_promo_codes_tenant_code ON public.promo_codes(tenant_id, code);
