create extension if not exists "pgcrypto";

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Politics', 'Local', 'Sports', 'World', 'Business')),
  body text not null,
  snippet text not null,
  image_url text not null,
  image_path text not null,
  published_at timestamptz not null default now()
);

create index if not exists news_published_at_idx on public.news (published_at desc);

alter table public.news enable row level security;

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

-- Create these public buckets in Supabase Storage:
-- 1. news-images
-- 2. epapers
--
-- The app writes with the service-role key (or anon key with policies) from server routes.
-- Public read access is expected so the homepage can embed images and the PDF.

