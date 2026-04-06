-- ============================================
-- Add Fayda Verification Columns to profiles
-- ============================================

-- Add columns for Fayda verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fayda_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fayda_number TEXT,
ADD COLUMN IF NOT EXISTS fayda_verified_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fayda_verified 
ON public.profiles(fayda_verified) 
WHERE fayda_verified = true;

CREATE INDEX IF NOT EXISTS idx_profiles_fayda_number 
ON public.profiles(fayda_number);

-- ============================================
-- Optional: Add RLS policy for users to view their own Fayda status
-- ============================================

-- Already covered by existing "Users can update own profile" policy
-- which allows updating any profile field

-- ============================================
-- Verify the columns were added
-- ============================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('fayda_verified', 'fayda_number', 'fayda_verified_at');