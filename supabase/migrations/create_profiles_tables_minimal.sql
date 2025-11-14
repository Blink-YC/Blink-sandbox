-- =====================================================
-- MINIMAL PROFILE TABLES (ONBOARDING FIELDS ONLY)
-- =====================================================
-- This is a simplified version with ONLY the fields collected during onboarding

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BUSINESS PROFILES TABLE (MINIMAL)
-- =====================================================

DROP TABLE IF EXISTS business_profiles CASCADE;

CREATE TABLE business_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- STEP 1: Company Information
  company_name text,
  industry text,
  company_size text,
  primary_location text,
  website text,
  
  -- STEP 2: Hiring Needs
  hiring_frequency text,
  typical_roles text,
  avg_open_positions text,
  company_description text,
  search_radius text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_industry ON business_profiles(industry);

-- =====================================================
-- WORKER PROFILES TABLE (MINIMAL)
-- =====================================================

DROP TABLE IF EXISTS worker_profiles CASCADE;

CREATE TABLE worker_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- STEP 1: Basic Information
  travel_radius text,
  availability text,
  
  -- STEP 2: Skills & Experience
  trades text[],
  certifications text[],
  years_experience integer,
  rate_cents integer,
  service_radius_km numeric(10, 2),
  headline text,
  bio text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_trades ON worker_profiles USING GIN(trades);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;

-- Business Profiles Policies
CREATE POLICY "Users can manage own business profile" 
  ON business_profiles 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Worker Profiles Policies  
CREATE POLICY "Users can manage own worker profile" 
  ON worker_profiles 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at
  BEFORE UPDATE ON worker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

