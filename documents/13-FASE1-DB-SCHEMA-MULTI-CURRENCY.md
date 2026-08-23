# 13 - FASE 1: SKEMA DATABASE & MIGRASI DATA MULTI-CURRENCY (SQL DDL & ZOD SCHEMAS)

Dokumen ini berisi spesifikasi teknis lengkap untuk **Fase 1**: Perubahan skema database (*PostgreSQL / Supabase*), skrip migrasi data lama (*data backfill*), dan pembaruan skema validasi (*Zod Schema*) untuk mendukung sistem Multi-Currency & Multi-Region (IDR, MYR, SGD).

---

## 1. Spesifikasi DDL SQL Migrations

Jalankan perintah SQL berikut pada Supabase SQL Editor:

```sql
-- ============================================================================
-- FASE 1: MULTI-CURRENCY & MULTI-REGION DATABASE SCHEMA MIGRATION
-- ============================================================================

-- 1. TABEL PRODUCTS: Tambah kolom JSONB untuk harga per mata uang
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS original_prices JSONB DEFAULT '{}'::jsonb;

-- 2. TABEL GAMES: Tambah array mata uang yang didukung
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
-- INDEXING UNTUK PERFORMA QUERY CEPAT
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_games_supported_currencies ON public.games USING GIN (supported_currencies);
CREATE INDEX IF NOT EXISTS idx_payment_channels_currencies ON public.payment_channels USING GIN (supported_currencies);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON public.orders (currency);
CREATE INDEX IF NOT EXISTS idx_deposits_currency ON public.deposits (currency);
```

---

## 2. Skrip Migrasi Data Eksisting (Data Backfill)

Agar data produk lama tetap memiliki nilai pada kolom `prices` baru sesuai mata uang default tenant-nya:

```sql
-- Backfill harga produk lama ke dalam objek JSONB prices
-- Jika tenant ber-mata uang MYR, masukkan ke key "MYR", selain itu masukkan ke "IDR"
UPDATE public.products p
SET prices = jsonb_build_object(
  COALESCE(t.theme_config->>'currency', CASE WHEN t.theme_config->>'language' = 'ms' THEN 'MYR' ELSE 'IDR' END),
  p.price
)
FROM public.tenants t
WHERE p.tenant_id = t.id 
  AND (p.prices IS NULL OR p.prices = '{}'::jsonb);

-- Backfill original_price jika produk merupakan flash sale
UPDATE public.products p
SET original_prices = jsonb_build_object(
  COALESCE(t.theme_config->>'currency', CASE WHEN t.theme_config->>'language' = 'ms' THEN 'MYR' ELSE 'IDR' END),
  p.original_price
)
FROM public.tenants t
WHERE p.tenant_id = t.id 
  AND p.original_price IS NOT NULL
  AND (p.original_prices IS NULL OR p.original_prices = '{}'::jsonb);

-- Backfill Payment Channels Wallet agar dapat digunakan di semua mata uang
UPDATE public.payment_channels
SET supported_currencies = '{IDR,MYR,SGD}'
WHERE account_number = 'WALLET' OR category = 'WALLET';
```

---

## 3. Pembaruan Skema Validasi TypeScript (Zod Schemas)

Perbarui skema transaksi dan produk pada [`src/schemas/transaction.schema.ts`](file:///Users/naoo/P.A.R.A/PROJECTS/newgamingstore/src/schemas/transaction.schema.ts):

```typescript
import { z } from "zod";

// Schema untuk harga dinamis per mata uang
export const CurrencyPricesSchema = z.record(
  z.enum(["IDR", "MYR", "SGD"]),
  z.number().min(0, "Harga tidak boleh negatif")
);

// Schema Update / Insert Produk
export const UpdateProductSchema = z.object({
  id: z.string().uuid().optional(),
  game_id: z.string().uuid("Game ID wajib diisi"),
  name: z.string().min(1, "Nama produk wajib diisi"),
  price: z.number().min(0, "Harga dasar wajib diisi"),
  prices: CurrencyPricesSchema.optional().default({}),
  is_flash_sale: z.boolean().default(false),
  original_price: z.number().nullable().optional(),
  original_prices: CurrencyPricesSchema.optional().default({}),
  flash_sale_stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  image_url: z.string().optional().default(""),
  variant_type: z.string().nullable().optional(),
});

// Schema Game dengan Region/Currency
export const UpdateGameSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nama game wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  supported_currencies: z.array(z.enum(["IDR", "MYR", "SGD"])).min(1, "Pilih minimal 1 mata uang"),
  // ... field game lainnya
});

// Schema Payment Channel dengan Currency
export const UpdatePaymentChannelSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nama kanal pembayaran wajib diisi"),
  category: z.string().min(1, "Kategori pembayaran wajib diisi"),
  supported_currencies: z.array(z.enum(["IDR", "MYR", "SGD"])).min(1, "Pilih minimal 1 mata uang"),
  // ... field payment channel lainnya
});
```

---

## 4. Helper Utility Penyelesaian Harga (`src/lib/currencyUtils.ts`)

Tambahkan helper universal untuk mengekstrak harga yang tepat sesuai mata uang aktif:

```typescript
export interface MultiCurrencyProduct {
  price: number;
  prices?: Record<string, number> | null;
  original_price?: number | null;
  original_prices?: Record<string, number> | null;
}

/**
 * Mendapatkan harga nominal produk berdasarkan mata uang aktif
 * Jika mata uang tidak ditemukan di objek `prices`, fallback ke `price` dasar
 */
export function getProductPrice(product: MultiCurrencyProduct, currency: Currency = "IDR"): number {
  if (product.prices && product.prices[currency] !== undefined && product.prices[currency] !== null) {
    return Number(product.prices[currency]);
  }
  return Number(product.price) || 0;
}

/**
 * Mendapatkan harga coret (original_price) produk berdasarkan mata uang aktif
 */
export function getProductOriginalPrice(product: MultiCurrencyProduct, currency: Currency = "IDR"): number | null {
  if (product.original_prices && product.original_prices[currency] !== undefined && product.original_prices[currency] !== null) {
    return Number(product.original_prices[currency]);
  }
  return product.original_price ? Number(product.original_price) : null;
}
```

---

## 5. Rencana Pengujian & Verifikasi Fase 1

1. **Uji Eksekusi SQL**: Jalankan DDL di staging/database test dan pastikan seluruh kolom baru terbuat tanpa error.
2. **Uji Integritas Data Lama**: Pastikan produk dan transaksi yang sudah ada tidak mengalami kerusakan nilai (*zero data loss*).
3. **Uji Validasi Zod**: Buat unit test pada `UpdateProductSchema` untuk memverifikasi payload valid dan invalid.
