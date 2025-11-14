-- =====================================================
-- COMPLETE PROFILE TABLES FOR BLINK ONBOARDING
-- =====================================================
-- This migration creates comprehensive business_profiles and worker_profiles tables
-- with all fields collected during the 2-step onboarding process.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BUSINESS PROFILES TABLE
-- =====================================================
-- Contains all employer/business information from onboarding

DROP TABLE IF EXISTS business_profiles CASCADE;

CREATE TABLE business_profiles (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- ===== STEP 1: Company Information =====
  company_name text,
  industry text,
  company_size text,
  primary_location text,
  website text,
  
  -- ===== STEP 2: Hiring Needs =====
  hiring_frequency text,           -- How often do you hire? (weekly, monthly, quarterly, occasionally, rarely)
  typical_roles text,               -- What types of roles do you typically hire for?
  avg_open_positions text,          -- Average number of open positions (1-2, 3-5, 6-10, 11-20, 20+)
  company_description text,         -- Tell us about your company (Optional)
  search_radius text,               -- Preferred search radius for candidates (10, 25, 50, 100, statewide, nationwide)
  
  -- ===== Additional/Future Fields =====
  logo_url text,                    -- Company logo
  verified boolean DEFAULT false,    -- Verification status
  rating numeric(3, 2),             -- Average rating from workers
  total_hires integer DEFAULT 0,    -- Total number of hires made
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_industry ON business_profiles(industry);
CREATE INDEX idx_business_profiles_primary_location ON business_profiles(primary_location);
CREATE INDEX idx_business_profiles_verified ON business_profiles(verified);

-- =====================================================
-- WORKER PROFILES TABLE
-- =====================================================
-- Contains all worker information from onboarding

DROP TABLE IF EXISTS worker_profiles CASCADE;

CREATE TABLE worker_profiles (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- ===== STEP 1: Basic Information =====
  travel_radius text,               -- How far willing to travel (5, 10, 25, 50, 100, any)
  availability text,                -- Availability (immediate, 1-week, 2-weeks, 1-month, full-time, part-time, flexible)
  
  -- ===== STEP 2: Skills & Experience =====
  trades text[],                    -- Array of specialties/trades (e.g., ['Plumbing', 'HVAC', 'Roofing'])
  certifications text[],            -- Array of credentials/certifications (e.g., ['License #12345', 'OSHA Certified'])
  years_experience integer,         -- Years of experience in the field
  rate_cents integer,               -- Hourly rate in cents (e.g., 2500 = $25.00)
  service_radius_km numeric(10, 2), -- Service radius in kilometers
  
  -- ===== Profile Content =====
  headline text,                    -- Short headline/tagline
  bio text,                         -- About/bio section
  
  -- ===== Additional/Future Fields =====
  profile_photo_url text,           -- Profile photo
  portfolio_urls text[],            -- Array of portfolio/work sample URLs
  verified boolean DEFAULT false,   -- Verification status
  background_check_status text,     -- Background check status (pending, approved, failed)
  rating numeric(3, 2),             -- Average rating from employers
  total_jobs_completed integer DEFAULT 0,  -- Total jobs completed
  
  -- Work preferences
  preferred_work_types text[],      -- Types of work preferred
  willing_to_relocate boolean DEFAULT false,  -- Willing to relocate for work
  has_own_tools boolean,            -- Has own tools/equipment
  has_vehicle boolean,              -- Has own transportation
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_trades ON worker_profiles USING GIN(trades);
CREATE INDEX idx_worker_profiles_availability ON worker_profiles(availability);
CREATE INDEX idx_worker_profiles_verified ON worker_profiles(verified);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;

-- ===== BUSINESS PROFILES POLICIES =====

-- Users can view their own business profile
CREATE POLICY "Users can view own business profile" 
  ON business_profiles FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own business profile
CREATE POLICY "Users can insert own business profile" 
  ON business_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own business profile
CREATE POLICY "Users can update own business profile" 
  ON business_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own business profile
CREATE POLICY "Users can delete own business profile" 
  ON business_profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- Workers can view business profiles (for job browsing)
CREATE POLICY "Workers can view business profiles" 
  ON business_profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'worker'
      AND user_roles.stage = 'profile_done'
    )
  );

-- ===== WORKER PROFILES POLICIES =====

-- Users can view their own worker profile
CREATE POLICY "Users can view own worker profile" 
  ON worker_profiles FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own worker profile
CREATE POLICY "Users can insert own worker profile" 
  ON worker_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own worker profile
CREATE POLICY "Users can update own worker profile" 
  ON worker_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own worker profile
CREATE POLICY "Users can delete own worker profile" 
  ON worker_profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- Businesses can view worker profiles (for hiring)
CREATE POLICY "Businesses can view worker profiles" 
  ON worker_profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'business'
      AND user_roles.stage = 'profile_done'
    )
  );

-- =====================================================
-- AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for business_profiles
DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for worker_profiles
DROP TRIGGER IF EXISTS update_worker_profiles_updated_at ON worker_profiles;
CREATE TRIGGER update_worker_profiles_updated_at
  BEFORE UPDATE ON worker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE business_profiles IS 'Stores employer/business profile information collected during onboarding';
COMMENT ON TABLE worker_profiles IS 'Stores worker profile information collected during onboarding';

COMMENT ON COLUMN business_profiles.company_name IS 'Name of the company/business';
COMMENT ON COLUMN business_profiles.industry IS 'Type of work/industry (construction, manufacturing, etc.)';
COMMENT ON COLUMN business_profiles.company_size IS 'Number of employees (1-10, 11-50, 51-200, etc.)';
COMMENT ON COLUMN business_profiles.primary_location IS 'Primary business location (city, state)';
COMMENT ON COLUMN business_profiles.hiring_frequency IS 'How often the company hires (weekly, monthly, etc.)';
COMMENT ON COLUMN business_profiles.typical_roles IS 'Types of roles typically hired for';
COMMENT ON COLUMN business_profiles.avg_open_positions IS 'Average number of open positions at a time';
COMMENT ON COLUMN business_profiles.search_radius IS 'Preferred search radius for candidates';

COMMENT ON COLUMN worker_profiles.travel_radius IS 'How far worker is willing to travel (in miles)';
COMMENT ON COLUMN worker_profiles.availability IS 'Worker availability status';
COMMENT ON COLUMN worker_profiles.trades IS 'Array of worker specialties/trades';
COMMENT ON COLUMN worker_profiles.certifications IS 'Array of credentials/certifications';
COMMENT ON COLUMN worker_profiles.years_experience IS 'Years of experience in the field';
COMMENT ON COLUMN worker_profiles.rate_cents IS 'Hourly rate in cents (e.g., 2500 = $25.00)';

