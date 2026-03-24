-- Create client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  industry TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create freelancer_profiles table
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  skills TEXT[],
  experience_level TEXT,
  hourly_rate NUMERIC,
  portfolio_url TEXT,
  languages TEXT[],
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_profiles
CREATE POLICY "Users can view own client profile" ON client_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own client profile" ON client_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own client profile" ON client_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS policies for freelancer_profiles
CREATE POLICY "Users can view own freelancer profile" ON freelancer_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own freelancer profile" ON freelancer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own freelancer profile" ON freelancer_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add is_onboarding_complete to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_onboarding_complete BOOLEAN DEFAULT FALSE;
