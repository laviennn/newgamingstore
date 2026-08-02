-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Categories Table
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon_name text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- 2. Create Tenants Table
CREATE TABLE public.tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  domain text UNIQUE NOT NULL,
  theme_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Games Table
CREATE TABLE public.games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text,
  background_image text,
  developer text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  form_fields jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Products Table
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  name text NOT NULL,
  price NUMERIC NOT NULL,
  is_flash_sale BOOLEAN DEFAULT false,
  original_price NUMERIC,
  flash_sale_stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Orders Table
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  form_data jsonb NOT NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processed', 'Success', 'Failed')),
  total_price numeric NOT NULL,
  transaction_id text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Articles / Blog Table
CREATE TABLE public.articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  image_url text,
  author text DEFAULT 'Admin',
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;

-- FAQs Table
CREATE TABLE public.faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.faqs DISABLE ROW LEVEL SECURITY;

-- Payment Channels Table
CREATE TABLE public.payment_channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  name text NOT NULL,
  logo_url text,
  qr_image_url text,
  account_number text,
  account_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.payment_channels DISABLE ROW LEVEL SECURITY;

-- Deposits Table
CREATE TABLE public.deposits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  wa_number text,
  amount numeric NOT NULL,
  payment_channel_id uuid REFERENCES public.payment_channels(id) ON DELETE SET NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processed', 'Success', 'Failed')),
  payment_proof_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
ALTER TABLE public.deposits DISABLE ROW LEVEL SECURITY;

-- Wallets Table
CREATE TABLE public.wallets (
  email text PRIMARY KEY,
  balance numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;

-- Trigger to update wallet balance on successful deposit
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status changed to 'Success'
  IF NEW.status = 'Success' AND OLD.status != 'Success' THEN
    -- Insert or update the wallet balance for this email
    INSERT INTO public.wallets (email, balance, updated_at)
    VALUES (NEW.customer_email, NEW.amount, now())
    ON CONFLICT (email)
    DO UPDATE SET balance = public.wallets.balance + EXCLUDED.balance, updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_deposit_success ON public.deposits;
CREATE TRIGGER on_deposit_success
AFTER UPDATE ON public.deposits
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- Membership Packages Table
CREATE TABLE IF NOT EXISTS public.membership_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  period_label text DEFAULT '/Tahun',
  benefits jsonb DEFAULT '[]'::jsonb,
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.membership_packages DISABLE ROW LEVEL SECURITY;

-- Seed default packages if table is empty
INSERT INTO public.membership_packages (name, price, period_label, benefits, is_popular, is_active)
SELECT 'Platinum', 550000, '/Tahun', '["Potongan Harga Rp 200 - Rp 1.000/produk", "Point Reward per Transaksi", "Prioritas Antrian Proses (Flash Process)", "Akses Grup WhatsApp Khusus Member", "Bebas Biaya Admin (Metode Saldo)", "Free Website Top Up Games"]'::jsonb, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_packages WHERE name = 'Platinum');

INSERT INTO public.membership_packages (name, price, period_label, benefits, is_popular, is_active)
SELECT 'Gold VIP', 1500000, '/Tahun', '["Harga Termurah (Reseller Price)", "Akses API Dokumentasi (Bisa jualan lagi)", "Dedicated Account Manager 24/7", "Limit Transaksi Harian Tanpa Batas", "Point Reward per Transaksi", "Early Access Promo Event Besar", "Menjadi reseller prioritas.", "Free Website Top Up Games"]'::jsonb, false, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_packages WHERE name = 'Gold VIP');


