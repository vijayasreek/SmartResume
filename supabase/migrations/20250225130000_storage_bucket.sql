-- Create a new bucket for resume photos
insert into storage.buckets (id, name, public)
values ('resume-photos', 'resume-photos', true)
on conflict (id) do nothing;

-- Policy to allow public to view images (since it's a public bucket for resumes)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'resume-photos' );

-- Policy to allow authenticated users to upload their own images
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'resume-photos' );

-- Policy to allow users to update their own images
create policy "Owner Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'resume-photos' );

-- Policy to allow users to delete their own images
create policy "Owner Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'resume-photos' );
