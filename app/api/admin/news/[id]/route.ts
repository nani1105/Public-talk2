import { NextResponse } from "next/server";
import { NEWS_CATEGORIES, type NewsCategory, type NewsArticle } from "@/types/news";
import { env } from "@/lib/env";
import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";
import { getLocalArticles, saveLocalArticles, saveUploadedImage } from "@/lib/news";

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
  return image instanceof File && image.size > 0 ? image : null;
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

    const url = env.supabaseUrl();
    const isRealSupabase = Boolean(url && !url.includes("example.supabase.co") && !url.includes("dummy"));
    let updatedArticle: NewsArticle | null = null;

    if (isRealSupabase) {
      try {
        const supabase = createServiceClient();
        const { data: existingArticle } = await supabase
          .from("news")
          .select("image_path, image_url")
          .eq("id", id)
          .single();

        let imagePath = existingArticle?.image_path ?? "";
        let imageUrl = existingArticle?.image_url ?? "";

        if (image) {
          imagePath = `${Date.now()}-${crypto.randomUUID()}${getExtension(image.name)}`;
          const { error: uploadError } = await supabase.storage
            .from(env.newsImageBucket())
            .upload(imagePath, image, {
              contentType: image.type,
              upsert: false,
              cacheControl: "31536000"
            });

          if (!uploadError) {
            imageUrl = getPublicFileUrl(env.newsImageBucket(), imagePath);
          }
        }

        const { data } = await supabase
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

        if (data) {
          updatedArticle = data;
        }
      } catch (err) {
        console.warn("[PUT news] Supabase update error:", err);
      }
    }

    // Local fallback update
    const localArticles = await getLocalArticles();
    const idx = localArticles.findIndex((a) => a.id === id);
    if (idx !== -1) {
      let imageUrl = localArticles[idx].image_url;
      if (image) {
        imageUrl = await saveUploadedImage(image);
      }

      localArticles[idx] = {
        ...localArticles[idx],
        title,
        category,
        body,
        snippet: makeSnippet(body),
        image_url: imageUrl,
      };
      await saveLocalArticles(localArticles);
      updatedArticle = localArticles[idx];
    }

    if (!updatedArticle) {
      let imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
      if (image) {
        imageUrl = await saveUploadedImage(image);
      }

      updatedArticle = {
        id,
        title,
        category,
        body,
        snippet: makeSnippet(body),
        image_url: imageUrl,
        image_path: "",
        published_at: new Date().toISOString(),
      };
    }

    return NextResponse.json({ article: updatedArticle });
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

    const url = env.supabaseUrl();
    const isRealSupabase = Boolean(url && !url.includes("example.supabase.co") && !url.includes("dummy"));

    if (isRealSupabase) {
      try {
        const supabase = createServiceClient();
        await supabase.from("news").delete().eq("id", id);
      } catch (err) {
        console.warn("[DELETE news] Supabase delete error:", err);
      }
    }

    // Local fallback delete
    const localArticles = await getLocalArticles();
    const filtered = localArticles.filter((a) => a.id !== id);
    if (filtered.length !== localArticles.length) {
      await saveLocalArticles(filtered);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete article." }, { status: 500 });
  }
}
