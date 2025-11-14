-- Migration: Add Step 2 fields to business_profiles table
-- This migration ensures the business_profiles table has all fields needed for employer onboarding

-- Create business_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Step 1 fields (from EmployerOnboarding.tsx)
  company_name text,
  industry text,
  company_size text,
  website text,
  primary_location text,
  
  -- Step 2 fields (from SetupProfileClient.tsx - Your hiring needs)
  hiring_frequency text,
  typical_roles text,
  avg_open_positions text,
  company_description text,
  search_radius text,
  
  -- Legacy fields (kept for compatibility)
  hq_city text,
  
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Step 1 fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='company_name') THEN
    ALTER TABLE business_profiles ADD COLUMN company_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='industry') THEN
    ALTER TABLE business_profiles ADD COLUMN industry text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='company_size') THEN
    ALTER TABLE business_profiles ADD COLUMN company_size text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='website') THEN
    ALTER TABLE business_profiles ADD COLUMN website text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='primary_location') THEN
    ALTER TABLE business_profiles ADD COLUMN primary_location text;
  END IF;
  
  -- Step 2 fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='hiring_frequency') THEN
    ALTER TABLE business_profiles ADD COLUMN hiring_frequency text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='typical_roles') THEN
    ALTER TABLE business_profiles ADD COLUMN typical_roles text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='avg_open_positions') THEN
    ALTER TABLE business_profiles ADD COLUMN avg_open_positions text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='company_description') THEN
    ALTER TABLE business_profiles ADD COLUMN company_description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='business_profiles' AND column_name='search_radius') THEN
    ALTER TABLE business_profiles ADD COLUMN search_radius text;
  END IF;
END $$;

-- Set up Row Level Security (RLS)
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can insert their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can delete their own business profile" ON business_profiles;

-- Policies: Users can only access their own business profile
CREATE POLICY "Users can view their own business profile" 
  ON business_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business profile" 
  ON business_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile" 
  ON business_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business profile" 
  ON business_profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable automatic timestamp updates
CREATE OR REPLACE FUNCTION update_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_business_profiles_updated_at_trigger ON business_profiles;

CREATE TRIGGER update_business_profiles_updated_at_trigger
BEFORE UPDATE ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION update_business_profiles_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_industry ON business_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_business_profiles_primary_location ON business_profiles(primary_location);

