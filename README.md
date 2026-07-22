# Public Talk — News Agency

Next.js news site with e-paper viewer and JWT-protected admin portal.

## Local development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Vercel deployment (required setup)

Vercel uses a **read-only filesystem**, so uploads must use **Vercel Blob**:

1. Open your Vercel project → **Storage** → **Create Database / Store** → **Blob**
2. Connect the Blob store to your project (adds `BLOB_READ_WRITE_TOKEN` automatically)
3. In **Settings → Environment Variables**, add:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET` (32+ random characters)
4. Redeploy

Without Blob storage, file uploads and the e-paper will not persist and `/epaper.pdf` will 404.

## Environment variables

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-long-random-secret-at-least-32-chars
BLOB_READ_WRITE_TOKEN=   # auto-set by Vercel when Blob is linked
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
