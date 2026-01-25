-- Migration: Create ENUM types and profile trigger
-- Created: 2026-01-24

-- Create ENUM types (use IF NOT EXISTS to avoid errors on reapply)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('client', 'freelancer', 'admin', 'regulator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.gig_status AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create function to auto-create profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'client'),
    COALESCE(new.raw_user_meta_data->>'phone', null),
    COALESCE(new.raw_user_meta_data->>'location', null),
    COALESCE(new.raw_user_meta_data->>'bio', null),
    COALESCE(new.raw_user_meta_data->>'skills', null),
    COALESCE(new.raw_user_meta_data->>'experience', null)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
