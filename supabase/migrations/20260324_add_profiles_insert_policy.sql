-- Migration: Add INSERT policy for profiles table
-- This allows users to insert their own profile during signup

-- Enable RLS if not already enabled (should already be enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'profiles';
