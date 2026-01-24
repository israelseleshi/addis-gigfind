-- Migration: Create ENUM types and profile trigger
-- Created: 2026-01-24

-- Create ENUM types
CREATE TYPE public.user_role AS ENUM ('client', 'freelancer', 'admin', 'regulator');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE public.gig_status AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Create function to auto-create profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
