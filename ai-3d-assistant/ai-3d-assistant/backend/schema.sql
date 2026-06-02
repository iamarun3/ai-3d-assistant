-- ──────────────────────────────────────────────────────────────────
-- Supabase Schema — AI 2D→3D Design Assistant
-- Run this in the Supabase SQL editor to set up the database.
-- ──────────────────────────────────────────────────────────────────

-- 1. Design jobs table
CREATE TABLE IF NOT EXISTS design_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | complete | failed
  prompt        TEXT,
  image_url     TEXT,
  edited_url    TEXT,
  model_url     TEXT,
  is_mock       BOOLEAN DEFAULT FALSE,
  error         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

-- Index for fast status polling
CREATE INDEX IF NOT EXISTS idx_design_jobs_status ON design_jobs(status);
CREATE INDEX IF NOT EXISTS idx_design_jobs_created ON design_jobs(created_at DESC);

-- 2. Row Level Security (enable for production)
-- ALTER TABLE design_jobs ENABLE ROW LEVEL SECURITY;

-- 3. Storage bucket (run in dashboard or via API)
-- Create a public bucket named: ai-designs
-- Folder structure:
--   ai-designs/uploads/{uuid}.jpg    — original uploads
--   ai-designs/edited/{uuid}.jpg     — AI-edited images
--   ai-designs/models/{uuid}.glb     — 3D models

-- 4. Helpful view for recent jobs
CREATE OR REPLACE VIEW recent_jobs AS
  SELECT id, status, prompt, model_url, is_mock, created_at
  FROM design_jobs
  ORDER BY created_at DESC
  LIMIT 100;
