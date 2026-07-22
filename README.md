# Public Talk — News Agency

A self-contained Next.js news agency site with an e-paper viewer and JWT-protected admin publishing portal. No external database — articles are stored in `data/news.json`.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then edit credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-long-random-secret-at-least-32-chars
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Public homepage — e-paper reader + news feed |
| `/login` | Admin login |
| `/admin` | Protected dashboard (PDF upload + news publishing) |

## Data storage

- **Articles:** `data/news.json`
- **Cover images:** `public/uploads/`
- **E-paper:** `public/epaper.pdf` (overwritten on each upload)

## Default admin login

Use the credentials from `.env.local` (default username: `admin`).

## Production notes

This app writes to the local filesystem. Deploy on a persistent host (VPS, Docker, Railway with a volume) — not on ephemeral serverless platforms like Vercel without external storage.
"# Public-Talk" 
