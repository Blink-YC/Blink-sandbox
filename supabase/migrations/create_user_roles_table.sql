-- =====================================================
-- USER ROLES TABLE
-- =====================================================
-- Tracks user roles and onboarding progress

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('business', 'worker', 'customer')),
  stage text NOT NULL DEFAULT 'enabled' CHECK (stage IN ('enabled', 'basics_done', 'profile_done')),
  enabled_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Ensure one role per user (user can only have one role at a time)
  UNIQUE(user_id, role)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_stage ON user_roles(stage);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_stage ON user_roles(user_id, stage);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can delete own roles" ON user_roles;

-- RLS Policies
CREATE POLICY "Users can view own roles" 
  ON user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles" 
  ON user_roles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roles" 
  ON user_roles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roles" 
  ON user_roles FOR DELETE 
  USING (auth.uid() = user_id);

-- Automatic timestamp updates
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_roles_updated_at_trigger ON user_roles;

CREATE TRIGGER update_user_roles_updated_at_trigger
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_user_roles_updated_at();

-- Comments
COMMENT ON TABLE user_roles IS 'Tracks user roles and onboarding progress';
COMMENT ON COLUMN user_roles.role IS 'User role: business, worker, or customer';
COMMENT ON COLUMN user_roles.stage IS 'Onboarding stage: enabled, basics_done, or profile_done';
COMMENT ON COLUMN user_roles.enabled_at IS 'When this role was first enabled for the user';

