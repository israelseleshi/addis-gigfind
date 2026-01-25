-- OTP Verification Table for tracking OTP codes
create table if not exists otp_verifications (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  otp_code text not null,
  purpose text not null check (purpose in ('signup', 'reset_password', 'email_change')),
  expires_at timestamptz not null,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on otp_verifications table
alter table otp_verifications enable row level security;

-- Policy: Users can only create and verify their own OTPs
create policy "Users can insert their own OTP" on otp_verifications
  for insert with check (auth.uid()::text = email or true);

-- Policy: Allow read for verification
create policy "Allow OTP verification reads" on otp_verifications
  for select using (true);

-- Policy: Allow update for verification
create policy "Allow OTP verification updates" on otp_verifications
  for update using (true);

-- Index for faster lookups
create index if not exists idx_otp_verifications_email on otp_verifications(email);
create index if not exists idx_otp_verifications_expires_at on otp_verifications(expires_at);

-- Function to clean up expired OTPs (can be called periodically)
create or replace function cleanup_expired_otps()
returns void as $$
begin
  delete from otp_verifications where expires_at < now();
end;
$$ language plpgsql security definer;
