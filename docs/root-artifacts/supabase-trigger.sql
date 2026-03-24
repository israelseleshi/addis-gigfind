-- Run this in Supabase Dashboard: SQL Editor
-- This creates the trigger to auto-create profiles when users sign up

-- 1. Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      new.id,
      COALESCE(
        NULLIF(new.raw_user_meta_data->>'full_name', ''),
        NULLIF(new.raw_user_meta_data->>'fullName', ''),
        new.email,
        'New User'
      ),
      COALESCE(
        NULLIF(new.raw_user_meta_data->>'role', ''),
        'client'
      )::user_role
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user failed for user %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
CREATE POLICY "Authenticated users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Verify trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
