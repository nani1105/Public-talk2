import { NextResponse } from "next/server";
import { NEWS_CATEGORIES, type NewsCategory } from "@/types/news";
import { env } from "@/lib/env";
import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const makeSnippet = (body: string) => {
  const compact = body.replace(/\s+/g, " ").trim();
  return compact.length > 150 ? `${compact.slice(0, 147)}...` : compact;
};

const getExtension = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? `.${extension}` : "";
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim() as NewsCategory;
    const body = String(formData.get("body") ?? "").trim();
    const image = formData.get("image");

    if (!title || !body || !NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Title, category, and body are required." }, { status: 400 });
    }

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "A cover image is required." }, { status: 400 });
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Cover file must be an image." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const imagePath = `${Date.now()}-${crypto.randomUUID()}${getExtension(image.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(env.newsImageBucket())
      .upload(imagePath, image, {
        contentType: image.type,
        upsert: false,
        cacheControl: "31536000"
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const imageUrl = getPublicFileUrl(env.newsImageBucket(), imagePath);
    const { data, error: insertError } = await supabase
      .from("news")
      .insert({
        title,
        category,
        body,
        snippet: makeSnippet(body),
        image_url: imageUrl,
        image_path: imagePath
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ article: data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to publish article." }, { status: 500 });
  }
}
