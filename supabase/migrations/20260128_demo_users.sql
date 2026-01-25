-- Demo Admin Credentials for Addis GigFind
-- Run this SQL in Supabase SQL Editor to create admin users

-- Create admin user profile (user must sign up first with this email)
INSERT INTO public.profiles (id, full_name, role, verification_status, is_banned)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'System Administrator',
  'admin',
  'verified',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Create regulator user profile (user must sign up first with this email)
INSERT INTO public.profiles (id, full_name, role, verification_status, is_banned)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'Government Regulator',
  'regulator',
  'verified',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Create demo client profile (user must sign up first with this email)
INSERT INTO public.profiles (id, full_name, role, verification_status, is_banned)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Demo Client',
  'client',
  'verified',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Create demo freelancer profile (user must sign up first with this email)
INSERT INTO public.profiles (id, full_name, role, verification_status, is_banned, bio, skills)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'Demo Freelancer',
  'freelancer',
  'verified',
  false,
  'Experienced web developer with 5+ years of experience.',
  'React, Node.js, TypeScript, PostgreSQL'
)
ON CONFLICT (id) DO NOTHING;

SELECT 'Demo profiles created successfully!' as status;
