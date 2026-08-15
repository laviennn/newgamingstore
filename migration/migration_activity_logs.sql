-- Migration: Create activity_logs table for Admin Audit Trail and Operator Activity Tracking
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text NOT NULL,
  admin_role text,
  action text NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'DUPLICATE', 'APPROVE', 'REJECT', 'TOGGLE_STATUS', 'REORDER'
  entity text NOT NULL, -- 'game', 'category', 'product', 'order', 'payment_channel', 'contact_settings'
  entity_id text,
  description text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for ultra-fast filtering & searches
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_id ON public.activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_email ON public.activity_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Disable RLS for admin queries or allow service_role / authenticated read
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
