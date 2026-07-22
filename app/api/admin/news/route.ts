import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getSessionFromCookies } from "@/lib/auth";
import {
  readNews,
  writeNews,
  uploadImage,
} from "@/lib/news";
import type { NewsCategory } from "@/lib/types";
import { NEWS_CATEGORIES } from "@/lib/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await readNews();
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "") as NewsCategory;
    const body = String(formData.get("body") ?? "").trim();
    const image = formData.get("coverImage");

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    if (!NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (!(image instanceof File) || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "A valid cover image is required" },
        { status: 400 }
      );
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Cover image must be 5MB or smaller" },
        { status: 400 }
      );
    }

    const ext = path.extname(image.name) || ".jpg";
    const filename = `${Date.now()}${ext}`;
    const coverImage = await uploadImage(image, filename);

    const articles = await readNews();
    const article = {
      id: crypto.randomUUID(),
      title,
      category,
      body,
      coverImage,
      publishedAt: new Date().toISOString(),
    };

    articles.unshift(article);
    await writeNews(articles);

    return NextResponse.json({ success: true, article });
  } catch {
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}
