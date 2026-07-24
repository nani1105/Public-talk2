# The Daily Ledger

A Vercel-ready Next.js news agency website with:

- Public e-paper reader
- Live latest-news feed
- Protected admin publishing portal
- JWT cookie authentication
- Supabase Postgres for articles
- Supabase Storage for article images and the daily e-paper PDF

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. In Supabase SQL Editor, run `supabase-schema.sql`.

4. Create two public Storage buckets:

- `news-images`
- `epapers`

5. Copy `.env.example` to `.env.local` and fill in:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

6. Start the app:

```bash
npm run dev
```

## Vercel Deployment

Add the same environment variables in Vercel Project Settings. Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client components; this app only reads it inside server routes and server utilities.

The admin portal is available at `/admin`. Uploading a new e-paper overwrites `daily/epaper.pdf` in the `epapers` bucket.
"# Public-talk2" 
"# Public-talk2" 
"# Public-talk2" 
