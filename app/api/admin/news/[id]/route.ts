import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getSessionFromCookies } from "@/lib/auth";
import {
  readNews,
  writeNews,
  uploadImage,
  deleteCoverImage,
} from "@/lib/news";
import type { NewsCategory } from "@/lib/types";
import { NEWS_CATEGORIES } from "@/lib/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

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

    const articles = await readNews();
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const existing = articles[index];
    let coverImage = existing.coverImage;

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Cover image must be a valid image file" },
          { status: 400 }
        );
      }
      if (image.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Cover image must be 5MB or smaller" },
          { status: 400 }
        );
      }

      await deleteCoverImage(existing.coverImage);
      const ext = path.extname(image.name) || ".jpg";
      const filename = `${Date.now()}${ext}`;
      coverImage = await uploadImage(image, filename);
    }

    const updated = {
      ...existing,
      title,
      category,
      body,
      coverImage,
    };

    articles[index] = updated;
    await writeNews(articles);

    return NextResponse.json({ success: true, article: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const articles = await readNews();
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const [removed] = articles.splice(index, 1);
    await deleteCoverImage(removed.coverImage);
    await writeNews(articles);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
