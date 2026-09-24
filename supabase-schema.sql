-- 1. Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- 2. Drop old restrictive category check constraint if it exists
alter table if exists public.news drop constraint if exists news_category_check;

-- 3. Create or update public.news table (supporting all Telugu & English categories)
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  body text not null,
  snippet text not null,
  image_url text not null,
  image_path text not null,
  published_at timestamptz not null default now()
);

-- 4. Index for fast querying & sorting by published date
create index if not exists news_published_at_idx on public.news (published_at desc);

-- 5. Enable Row Level Security (RLS)
alter table public.news enable row level security;

-- 6. Row Level Security Policies (Read, Insert, Update, Delete)
drop policy if exists "Public can read news" on public.news;
create policy "Public can read news"
on public.news
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert news" on public.news;
create policy "Public can insert news"
on public.news
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can update news" on public.news;
create policy "Public can update news"
on public.news
for update
to anon, authenticated
using (true);

drop policy if exists "Public can delete news" on public.news;
create policy "Public can delete news"
on public.news
for delete
to anon, authenticated
using (true);

-- 7. Supabase Storage Buckets Setup:
-- Create two public buckets in Supabase Dashboard -> Storage:
--   a. news-images (for article cover photos)
--   b. epapers     (for daily e-paper PDF files)
-- Make sure both buckets have "Public" access checked so images and PDFs render on the site.
