-- =====================================================
-- FIX CASCADE DELETE FOR ALL PROFILE TABLES
-- =====================================================
-- This ensures when a user is deleted from auth.users,
-- all their related data is automatically deleted

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DROP EXISTING FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Drop FK constraints from profiles table
ALTER TABLE IF EXISTS profiles 
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Drop FK constraints from user_roles table
ALTER TABLE IF EXISTS user_roles 
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Drop FK constraints from business_profiles table
ALTER TABLE IF EXISTS business_profiles 
  DROP CONSTRAINT IF EXISTS business_profiles_user_id_fkey;

-- Drop FK constraints from worker_profiles table
ALTER TABLE IF EXISTS worker_profiles 
  DROP CONSTRAINT IF EXISTS worker_profiles_user_id_fkey;

-- Drop FK constraints from customer_profiles table (if exists)
ALTER TABLE IF EXISTS customer_profiles 
  DROP CONSTRAINT IF EXISTS customer_profiles_user_id_fkey;

-- Drop FK constraints from demo_requests table (if exists)
ALTER TABLE IF EXISTS demo_requests 
  DROP CONSTRAINT IF EXISTS demo_requests_user_id_fkey;

-- =====================================================
-- 2. ADD NEW FOREIGN KEY CONSTRAINTS WITH CASCADE DELETE
-- =====================================================

-- profiles table
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- user_roles table
ALTER TABLE user_roles 
  ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- business_profiles table
ALTER TABLE business_profiles 
  ADD CONSTRAINT business_profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- worker_profiles table
ALTER TABLE worker_profiles 
  ADD CONSTRAINT worker_profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- customer_profiles table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_profiles') THEN
    ALTER TABLE customer_profiles 
      ADD CONSTRAINT customer_profiles_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 3. VERIFY CASCADE DELETE IS WORKING
-- =====================================================

-- Check all foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
  AND ccu.table_schema = 'auth'
ORDER BY tc.table_name;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON CONSTRAINT profiles_user_id_fkey ON profiles 
  IS 'Cascade delete: When user is deleted, their profile is deleted';

COMMENT ON CONSTRAINT user_roles_user_id_fkey ON user_roles 
  IS 'Cascade delete: When user is deleted, their roles are deleted';

COMMENT ON CONSTRAINT business_profiles_user_id_fkey ON business_profiles 
  IS 'Cascade delete: When user is deleted, their business profile is deleted';

COMMENT ON CONSTRAINT worker_profiles_user_id_fkey ON worker_profiles 
  IS 'Cascade delete: When user is deleted, their worker profile is deleted';

