-- MIVA Memes: private anonymous inbox
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  message text not null default '',
  image_path text,
  created_at timestamptz not null default now(),
  constraint message_or_image check (length(trim(message)) > 0 or image_path is not null),
  constraint message_length check (char_length(message) <= 2000)
);

alter table public.submissions enable row level security;

-- Anonymous visitors may submit, but cannot read or change any submission.
drop policy if exists "Anyone can submit anonymously" on public.submissions;
create policy "Anyone can submit anonymously"
on public.submissions for insert to anon
with check (
  char_length(message) <= 2000
  and (length(trim(message)) > 0 or image_path is not null)
);

-- Only a trusted admin set in app_metadata can read/manage the inbox.
drop policy if exists "Admins can read submissions" on public.submissions;
create policy "Admins can read submissions"
on public.submissions for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete submissions" on public.submissions;
create policy "Admins can delete submissions"
on public.submissions for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Private image bucket. Anonymous uploads only; admin-only reads/deletes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Anonymous can upload submission images" on storage.objects;
create policy "Anonymous can upload submission images"
on storage.objects for insert to anon
with check (bucket_id = 'submissions');

drop policy if exists "Admins can view submission images" on storage.objects;
create policy "Admins can view submission images"
on storage.objects for select to authenticated
using (bucket_id = 'submissions' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete submission images" on storage.objects;
create policy "Admins can delete submission images"
on storage.objects for delete to authenticated
using (bucket_id = 'submissions' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
