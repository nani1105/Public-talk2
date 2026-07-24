# Public Talk — News Agency

Next.js news site with e-paper viewer and JWT-protected admin portal.

## Local development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Vercel deployment (required setup)

Vercel uses a **read-only filesystem**, so uploads use **Vercel Blob**.

### 1. Connect Blob storage

1. Vercel project → **Storage** → **Blob** → connect store to this project
2. Prefer **OIDC** (default for new connections). Vercel adds `BLOB_STORE_ID` automatically.

### 2. Environment variables

In **Settings → Environment Variables** (Production):

| Variable | Required |
|----------|----------|
| `ADMIN_USERNAME` | Yes |
| `ADMIN_PASSWORD` | Yes |
| `JWT_SECRET` | Yes (32+ random chars) |
| `BLOB_STORE_ID` | Auto-set when Blob is linked |
| `BLOB_READ_WRITE_TOKEN` | Optional — only for local CLI or non-Vercel hosts |

### 3. OIDC upgrade (recommended)

If Vercel shows *“All connected projects use OIDC”*:

1. **Redeploy** the project first (so builds pick up `BLOB_STORE_ID`)
2. Confirm uploads work on `/admin` after redeploy
3. **Revoke** `BLOB_READ_WRITE_TOKEN` in the Blob store if you don’t use it outside Vercel

The `@vercel/blob` SDK uses OIDC automatically on Vercel (`BLOB_STORE_ID` + short-lived token at runtime). You do **not** need `BLOB_READ_WRITE_TOKEN` on Vercel after OIDC is active.

### 4. Local dev with Blob (optional)

```bash
vercel link
vercel env pull .env.local
npm run dev
```

Without Blob env vars, the app falls back to local files (`data/news.json`, `public/`).

## Environment variables

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-long-random-secret-at-least-32-chars
# On Vercel (OIDC): BLOB_STORE_ID is auto-set — no token required
# Local dev: vercel env pull, or set BLOB_READ_WRITE_TOKEN
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Public homepage — e-paper + news feed |
| `/login` | Admin login |
| `/admin` | Dashboard — upload/update/delete e-paper & articles |

## Admin features

- Upload, replace, or **delete** the daily e-paper PDF
- Publish, **edit**, or **delete** news articles
- Cover images stored in Vercel Blob (production) or `public/uploads/` (local)

## Storage

| Data | Local dev | Vercel |
|------|-----------|--------|
| Articles | `data/news.json` | Blob `news-data.json` |
| E-paper | `public/epaper.pdf` | Blob `epaper.pdf` |
| Images | `public/uploads/` | Blob `uploads/*` |
