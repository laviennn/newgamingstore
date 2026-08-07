-- Migration: Add sort_order column to games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Optional index for faster sorting
CREATE INDEX IF NOT EXISTS idx_games_sort_order ON public.games(sort_order);
