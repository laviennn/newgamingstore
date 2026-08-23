-- ============================================================================
-- MIGRATION: MULTI-CURRENCY & MULTI-REGION DATABASE SCHEMA (FASE 1)
-- Mendukung isolasi mata uang IDR (Rp), MYR (RM), dan SGD (S$) per tenant
-- Jalankan skrip ini di Supabase SQL Editor
-- ============================================================================

-- 1. TABEL PRODUCTS: Tambah kolom JSONB untuk nama & harga per mata uang
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS names JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS original_prices JSONB DEFAULT '{}'::jsonb;

-- 2. TABEL GAMES: Tambah array mata uang yang didukung (default semua aktif)
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS supported_currencies TEXT[] DEFAULT '{IDR,MYR,SGD}';

-- 3. TABEL PAYMENT_CHANNELS: Tambah array mata uang yang didukung
ALTER TABLE public.payment_channels 
ADD COLUMN IF NOT EXISTS supported_currencies TEXT[] DEFAULT '{IDR}';

-- 4. TABEL ORDERS: Catat mata uang transaksi secara eksplisit
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';

-- 5. TABEL DEPOSITS: Catat mata uang deposit secara eksplisit
ALTER TABLE public.deposits 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';

-- 6. TABEL MEMBERSHIP_PACKAGES: Tambah harga per mata uang untuk paket member
ALTER TABLE public.membership_packages 
ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{}'::jsonb;

-- 7. TABEL PROMO_CODES: Tambah batas berlakunya promo per region/mata uang
ALTER TABLE public.promo_codes 
ADD COLUMN IF NOT EXISTS supported_currencies TEXT[] DEFAULT '{IDR,MYR,SGD}';

-- ============================================================================
-- INDEXING UNTUK OPTIMASI PERFORMA QUERY
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_games_supported_currencies ON public.games USING GIN (supported_currencies);
CREATE INDEX IF NOT EXISTS idx_payment_channels_currencies ON public.payment_channels USING GIN (supported_currencies);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON public.orders (currency);
CREATE INDEX IF NOT EXISTS idx_deposits_currency ON public.deposits (currency);

-- ============================================================================
-- DATA BACKFILL (MENGISI DATA EKSISTING KE STRUKTUR BARU SECARA AMAN)
-- ============================================================================

-- 1. Backfill nama produk eksisting ke dalam kolom names JSONB
UPDATE public.products p
SET names = jsonb_build_object(
  COALESCE(t.theme_config->>'currency', CASE WHEN t.theme_config->>'language' = 'ms' THEN 'MYR' ELSE 'IDR' END),
  p.name
)
FROM public.tenants t
WHERE p.tenant_id = t.id 
  AND (p.names IS NULL OR p.names = '{}'::jsonb);

-- 2. Backfill harga produk eksisting ke dalam kolom prices JSONB
-- Mengisi key IDR atau MYR sesuai konfigurasi tenant produk tersebut
UPDATE public.products p
SET prices = jsonb_build_object(
  COALESCE(t.theme_config->>'currency', CASE WHEN t.theme_config->>'language' = 'ms' THEN 'MYR' ELSE 'IDR' END),
  p.price
)
FROM public.tenants t
WHERE p.tenant_id = t.id 
  AND (p.prices IS NULL OR p.prices = '{}'::jsonb);

-- 2. Backfill original_price jika produk merupakan flash sale
UPDATE public.products p
SET original_prices = jsonb_build_object(
  COALESCE(t.theme_config->>'currency', CASE WHEN t.theme_config->>'language' = 'ms' THEN 'MYR' ELSE 'IDR' END),
  p.original_price
)
FROM public.tenants t
WHERE p.tenant_id = t.id 
  AND p.original_price IS NOT NULL
  AND (p.original_prices IS NULL OR p.original_prices = '{}'::jsonb);

-- 3. Set supported_currencies untuk payment channel bertipe Wallet / Saldo Akun agar berlaku di semua mata uang
UPDATE public.payment_channels
SET supported_currencies = '{IDR,MYR,SGD}'
WHERE account_number = 'WALLET' OR category = 'WALLET' OR name ILIKE '%saldo%' OR name ILIKE '%wallet%';
