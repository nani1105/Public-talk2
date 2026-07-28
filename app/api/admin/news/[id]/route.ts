import { NextResponse } from "next/server";
import { NEWS_CATEGORIES, type NewsCategory } from "@/types/news";
import { env } from "@/lib/env";
import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const makeSnippet = (body: string) => {
  const compact = body.replace(/\s+/g, " ").trim();
  return compact.length > 150 ? `${compact.slice(0, 147)}...` : compact;
};

const getExtension = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? `.${extension}` : "";
};

const getCoverImage = (formData: FormData) => {
  const image = formData.get("image") ?? formData.get("coverImage");
  return image instanceof File ? image : null;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Article id is required." }, { status: 400 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim() as NewsCategory;
    const body = String(formData.get("body") ?? "").trim();
    const image = getCoverImage(formData);

    if (!title || !body || !NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Title, category, and body are required." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: existingArticle, error: findError } = await supabase
      .from("news")
      .select("image_path, image_url")
      .eq("id", id)
      .single();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 404 });
    }

    let imagePath = existingArticle?.image_path ?? "";
    let imageUrl = existingArticle?.image_url ?? "";

    if (image) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json({ error: "Cover file must be an image." }, { status: 400 });
      }

      imagePath = `${Date.now()}-${crypto.randomUUID()}${getExtension(image.name)}`;
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

      imageUrl = getPublicFileUrl(env.newsImageBucket(), imagePath);
    }

    const { data, error: updateError } = await supabase
      .from("news")
      .update({
        title,
        category,
        body,
        snippet: makeSnippet(body),
        image_url: imageUrl,
        image_path: imagePath
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update article." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Article id is required." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: article, error: findError } = await supabase
      .from("news")
      .select("image_path")
      .eq("id", id)
      .single();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from("news").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (article?.image_path) {
      const { error: storageError } = await supabase.storage
        .from(env.newsImageBucket())
        .remove([article.image_path]);

      if (storageError) {
        console.error(storageError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete article." }, { status: 500 });
  }
}
