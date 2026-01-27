-- Create storage bucket for verification documents
-- Run this in Supabase Dashboard → Storage → Create new bucket

-- Or use SQL:
insert into storage.buckets (id, name, public) values ('verification-docs', 'verification-docs', false);

-- Set up storage policies
create policy "Allow authenticated users to upload verification docs"
on storage.objects for insert
with check (
  bucket_id = 'verification-docs' and
  auth.role() = 'authenticated'
);

create policy "Allow users to view their own verification docs"
on storage.objects for select
using (
  bucket_id = 'verification-docs' and
  (storage.foldername(name))[1] = auth.uid()::text
);
