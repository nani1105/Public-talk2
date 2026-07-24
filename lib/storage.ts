import { promises as fs } from "fs";
import path from "path";
import { del, head, put } from "@vercel/blob";
import type { NewsArticle } from "./types";

const NEWS_BLOB_KEY = "news-data.json";
const EPAPER_BLOB_KEY = "epaper.pdf";
const DEFAULT_NEWS_PAYLOAD = JSON.stringify([], null, 2);

const NEWS_PATH = path.join(process.cwd(), "data", "news.json");
const EPAPER_PATH = path.join(process.cwd(), "public", "epaper.pdf");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** True when Vercel Blob is available (OIDC on Vercel or read-write token locally). */
export function usesBlobStorage() {
  return Boolean(
    process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN
  );
}

async function ensureDefaultNewsBlob() {
  if (!usesBlobStorage()) return;

  try {
    await head(NEWS_BLOB_KEY);
  } catch {
    await put(NEWS_BLOB_KEY, DEFAULT_NEWS_PAYLOAD, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
  }
}

async function readNewsFromBlob(): Promise<NewsArticle[]> {
  try {
    await ensureDefaultNewsBlob();
    const meta = await head(NEWS_BLOB_KEY);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return [];
    const parsed: unknown = await res.json();
    return Array.isArray(parsed) ? (parsed as NewsArticle[]) : [];
  } catch {
    return [];
  }
}

async function writeNewsToBlob(articles: NewsArticle[]) {
  await put(NEWS_BLOB_KEY, JSON.stringify(articles, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });
}

async function readNewsFromFile(): Promise<NewsArticle[]> {
  try {
    const raw = await fs.readFile(NEWS_PATH, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NewsArticle[]) : [];
  } catch {
    return [];
  }
}

async function writeNewsToFile(articles: NewsArticle[]) {
  await fs.mkdir(path.dirname(NEWS_PATH), { recursive: true });
  await fs.writeFile(NEWS_PATH, JSON.stringify(articles, null, 2), "utf-8");
}

export async function readNews(): Promise<NewsArticle[]> {
  if (usesBlobStorage()) {
    return readNewsFromBlob();
  }
  return readNewsFromFile();
}

export async function writeNews(articles: NewsArticle[]) {
  if (usesBlobStorage()) {
    await writeNewsToBlob(articles);
    return;
  }
  await writeNewsToFile(articles);
}

export async function uploadImage(file: File, filename: string): Promise<string> {
  if (usesBlobStorage()) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function uploadEpaper(file: File): Promise<string> {
  if (usesBlobStorage()) {
    const blob = await put(EPAPER_BLOB_KEY, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/pdf",
      allowOverwrite: true,
    });
    return blob.url;
  }

  await fs.mkdir(path.dirname(EPAPER_PATH), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(EPAPER_PATH, buffer);
  return "/epaper.pdf";
}

export async function getEpaperUrl(): Promise<string | null> {
  if (usesBlobStorage()) {
    try {
      const meta = await head(EPAPER_BLOB_KEY);
      return meta.url;
    } catch {
      return null;
    }
  }

  try {
    await fs.access(EPAPER_PATH);
    return "/epaper.pdf";
  } catch {
    return null;
  }
}

export async function deleteEpaper(): Promise<void> {
  if (usesBlobStorage()) {
    try {
      const meta = await head(EPAPER_BLOB_KEY);
      await del(meta.url);
    } catch {
      // already deleted
    }
    return;
  }

  try {
    await fs.unlink(EPAPER_PATH);
  } catch {
    // already deleted
  }
}

export async function deleteCoverImage(coverImage: string): Promise<void> {
  if (coverImage.startsWith("http")) {
    try {
      await del(coverImage);
    } catch {
      // ignore
    }
    return;
  }

  if (coverImage.startsWith("/uploads/")) {
    try {
      await fs.unlink(path.join(process.cwd(), "public", coverImage));
    } catch {
      // ignore
    }
  }
}
