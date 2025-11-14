-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Common profile data shared across all user types

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Common profile fields
  full_name text,
  phone text,
  city text,
  avatar_url text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
  ON profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- Automatic timestamp updates
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;

CREATE TRIGGER update_profiles_updated_at_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Comments
COMMENT ON TABLE profiles IS 'Common profile data shared across all user types';
COMMENT ON COLUMN profiles.full_name IS 'User full name';
COMMENT ON COLUMN profiles.phone IS 'User phone number';
COMMENT ON COLUMN profiles.city IS 'User city/location';

