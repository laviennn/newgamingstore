-- Run this in your Supabase SQL Editor to fix the RLS "Failed to Save" errors.

ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
