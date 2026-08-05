-- Migration: Create api_validation_logs table & add provider_code_overrides to games table

-- 1. Create api_validation_logs table
CREATE TABLE IF NOT EXISTS public.api_validation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    game_code TEXT NOT NULL,
    user_id TEXT NOT NULL,
    server_id TEXT,
    provider TEXT NOT NULL, -- 'vip-reseller' | 'rapidapi'
    status TEXT NOT NULL, -- 'SUCCESS' | 'FAILED' | 'TIMEOUT'
    result_username TEXT,
    message TEXT,
    execution_time_ms INT,
    ratelimit_limit INT, -- RapidAPI x-ratelimit-requests-limit
    ratelimit_remaining INT -- RapidAPI x-ratelimit-requests-remaining
);

-- Indexing for fast analytics & filtering
CREATE INDEX IF NOT EXISTS idx_api_validation_logs_created_at ON public.api_validation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_validation_logs_provider ON public.api_validation_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_validation_logs_tenant_id ON public.api_validation_logs(tenant_id);

-- 2. Add provider_code_overrides column to games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS provider_code_overrides JSONB DEFAULT '{}'::jsonb;
