import { promises as fs } from "fs";
import path from "path";
import type { NewsArticle } from "./types";

const NEWS_PATH = path.join(process.cwd(), "data", "news.json");

export async function readNews(): Promise<NewsArticle[]> {
  try {
    const raw = await fs.readFile(NEWS_PATH, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NewsArticle[]) : [];
  } catch {
    return [];
  }
}

export async function writeNews(articles: NewsArticle[]) {
  await fs.mkdir(path.dirname(NEWS_PATH), { recursive: true });
  await fs.writeFile(NEWS_PATH, JSON.stringify(articles, null, 2), "utf-8");
}
