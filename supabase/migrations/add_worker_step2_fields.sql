-- =====================================================
-- ADD WORKER STEP 2 FIELDS
-- =====================================================
-- This migration adds new fields to worker_profiles for the updated Step 2 form

-- Add years_experience_range (string instead of numeric)
-- Stores ranges like "0-1", "1-3", "3-5", "5-10", "10+"
ALTER TABLE worker_profiles
ADD COLUMN IF NOT EXISTS years_experience_range text;

-- Add job_type_preference
-- Stores values like "full-time", "part-time", "contract", "temporary", "flexible"
ALTER TABLE worker_profiles
ADD COLUMN IF NOT EXISTS job_type_preference text;

-- Add index for job type preference for faster filtering
CREATE INDEX IF NOT EXISTS idx_worker_profiles_job_type 
  ON worker_profiles(job_type_preference);

COMMENT ON COLUMN worker_profiles.years_experience_range IS 'Experience range selected during onboarding (e.g., "1-3", "5-10", "10+")';
COMMENT ON COLUMN worker_profiles.job_type_preference IS 'Preferred job type (full-time, part-time, contract, temporary, flexible)';

