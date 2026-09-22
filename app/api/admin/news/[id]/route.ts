import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { NEWS_CATEGORIES, type NewsCategory, type NewsArticle } from "@/types/news";
import { env } from "@/lib/env";
import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";
import { getLocalArticles, saveLocalArticles, saveUploadedImage, isUuid } from "@/lib/news";

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
    let supabaseError: string | null = null;

    if (isRealSupabase) {
      try {
        const supabase = createServiceClient();
        let existingImagePath = "";
        let existingImageUrl = "";

        // Only query Supabase by ID if the ID is a valid UUID
        if (isUuid(id)) {
          const { data: existingArticle } = await supabase
            .from("news")
            .select("image_path, image_url")
            .eq("id", id)
            .maybeSingle();

          if (existingArticle) {
            existingImagePath = existingArticle.image_path ?? "";
            existingImageUrl = existingArticle.image_url ?? "";
          }
        }

        let imagePath = existingImagePath;
        let imageUrl = existingImageUrl;

        if (image) {
          imagePath = `${Date.now()}-${crypto.randomUUID()}${getExtension(image.name)}`;
          const arrayBuffer = await image.arrayBuffer();
          const { error: uploadError } = await supabase.storage
            .from(env.newsImageBucket())
            .upload(imagePath, arrayBuffer, {
              contentType: image.type || "image/jpeg",
              upsert: false,
              cacheControl: "31536000",
            });

          if (!uploadError) {
            imageUrl = getPublicFileUrl(env.newsImageBucket(), imagePath);
          } else {
            console.error("[PUT news] Storage upload error:", uploadError);
          }
        }

        if (!imageUrl) {
          imageUrl = await saveUploadedImage(image ?? new File([], "fallback.jpg"));
        }

        const targetId = isUuid(id) ? id : crypto.randomUUID();

        const { data, error: upsertError } = await supabase
          .from("news")
          .upsert(
            {
              id: targetId,
              title,
              category,
              body,
              snippet: makeSnippet(body),
              image_url: imageUrl,
              image_path: imagePath,
            },
            { onConflict: "id" }
          )
          .select("*")
          .single();

        if (upsertError) {
          supabaseError = upsertError.message;
          console.error("[PUT news] Supabase upsert error:", upsertError);
        } else if (data) {
          updatedArticle = data;
        }
      } catch (err) {
        supabaseError = err instanceof Error ? err.message : String(err);
        console.warn("[PUT news] Supabase update exception:", err);
      }
    }

    // Local fallback update
    const localArticles = await getLocalArticles();
    const idx = localArticles.findIndex((a) => a.id === id || a.title.trim().toLowerCase() === title.toLowerCase());
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
      if (!updatedArticle) updatedArticle = localArticles[idx];
    }

    if (!updatedArticle) {
      let imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
      if (image) {
        imageUrl = await saveUploadedImage(image);
      }

      updatedArticle = {
        id: isUuid(id) ? id : crypto.randomUUID(),
        title,
        category,
        body,
        snippet: makeSnippet(body),
        image_url: imageUrl,
        image_path: "",
        published_at: new Date().toISOString(),
      };
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
      revalidatePath(`/article/${id}`);
    } catch (e) {
      console.warn("[PUT news] revalidatePath error:", e);
    }

    return NextResponse.json({ article: updatedArticle });
  } catch (error) {
    console.error("[PUT news] error:", error);
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

    // Find local article if present to match by title if ID is non-UUID
    const localArticles = await getLocalArticles();
    const targetLocal = localArticles.find((a) => a.id === id);

    if (isRealSupabase) {
      try {
        const supabase = createServiceClient();
        if (isUuid(id)) {
          const { error } = await supabase.from("news").delete().eq("id", id);
          if (error) console.error("[DELETE news] Supabase delete error:", error);
        } else if (targetLocal?.title) {
          const { error } = await supabase.from("news").delete().eq("title", targetLocal.title);
          if (error) console.error("[DELETE news] Supabase delete by title error:", error);
        }
      } catch (err) {
        console.warn("[DELETE news] Supabase delete exception:", err);
      }
    }

    // Local fallback delete
    const filtered = localArticles.filter((a) => a.id !== id && a.title !== targetLocal?.title);
    if (filtered.length !== localArticles.length) {
      await saveLocalArticles(filtered);
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
      revalidatePath(`/article/${id}`);
    } catch (e) {
      console.warn("[DELETE news] revalidatePath error:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE news] error:", error);
    return NextResponse.json({ error: "Unable to delete article." }, { status: 500 });
  }
}
