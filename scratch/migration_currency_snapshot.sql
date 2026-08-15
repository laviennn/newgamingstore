-- Add currency column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'IDR';

-- Add currency column to deposits
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'IDR';
