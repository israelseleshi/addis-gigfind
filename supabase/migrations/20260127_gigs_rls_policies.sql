-- Migration: Add RLS policies for gigs table
-- Created: 2026-01-27

-- Enable RLS on gigs table
alter table gigs enable row level security;

-- Policy: Clients can view their own gigs
create policy "Clients can view their own gigs" on gigs
  for select using (auth.uid() = client_id);

-- Policy: Clients can insert their own gigs
create policy "Clients can insert their own gigs" on gigs
  for insert with check (auth.uid() = client_id);

-- Policy: Clients can update their own gigs
create policy "Clients can update their own gigs" on gigs
  for update using (auth.uid() = client_id);

-- Policy: Clients can delete their own gigs
create policy "Clients can delete their own gigs" on gigs
  for delete using (auth.uid() = client_id);

-- Policy: All authenticated users can view open gigs
create policy "All authenticated users can view open gigs" on gigs
  for select using (status = 'open' and auth.role() = 'authenticated');

-- Policy: Freelancers can view open gigs
create policy "Freelancers can view open gigs" on gigs
  for select using (
    status = 'open' and 
    auth.role() = 'authenticated' and
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'freelancer'
    )
  );
