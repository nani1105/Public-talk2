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
    const { id: rawId } = await context.params;
    const id = decodeURIComponent(rawId ?? "").trim();

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

    // 1. Fetch existing article details from local fallback & Supabase to preserve current image if no new file uploaded
    const localArticles = await getLocalArticles();
    const existingLocal = localArticles.find(
      (a) => a.id === id || a.title.trim().toLowerCase() === title.toLowerCase()
    );

    if (isRealSupabase) {
      try {
        const supabase = createServiceClient();
        let existingSupabase: NewsArticle | null = null;

        if (isUuid(id)) {
          const { data } = await supabase
            .from("news")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          if (data) existingSupabase = data;
        }

        if (!existingSupabase && title) {
          const { data } = await supabase
            .from("news")
            .select("*")
            .eq("title", title)
            .maybeSingle();
          if (data) existingSupabase = data;
        }

        const targetId = existingSupabase?.id ?? (isUuid(id) ? id : crypto.randomUUID());
        let imageUrl = existingSupabase?.image_url || existingLocal?.image_url || "";
        let imagePath = existingSupabase?.image_path || existingLocal?.image_path || "";

        // If a new image was uploaded in the edit form, process it
        if (image) {
          const newImagePath = `${Date.now()}-${crypto.randomUUID()}${getExtension(image.name)}`;
          const arrayBuffer = await image.arrayBuffer();

          const { error: uploadError } = await supabase.storage
            .from(env.newsImageBucket())
            .upload(newImagePath, arrayBuffer, {
              contentType: image.type || "image/jpeg",
              upsert: true,
              cacheControl: "31536000",
            });

          if (!uploadError) {
            imageUrl = getPublicFileUrl(env.newsImageBucket(), newImagePath);
            imagePath = newImagePath;
            console.log("[PUT news] Updated image on Supabase Storage:", imageUrl?.slice(0, 60));
          } else {
            console.warn("[PUT news] Storage upload error, falling back to Base64 Data URL:", uploadError.message);
            imageUrl = await saveUploadedImage(image);
            imagePath = "";
          }
        }

        // Final fallback if image is still missing
        if (!imageUrl) {
          imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
        }

        const { data: upsertData, error: upsertError } = await supabase
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
        } else if (upsertData) {
          updatedArticle = upsertData;
        }
      } catch (err) {
        supabaseError = err instanceof Error ? err.message : String(err);
        console.error("[PUT news] Supabase update exception:", err);
      }
    }

    // 2. Local fallback update (when Supabase is disabled or fails)
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
      if (isRealSupabase && supabaseError) {
        return NextResponse.json(
          { error: `Database update failed: ${supabaseError}` },
          { status: 500 }
        );
      }

      let imageUrl = existingLocal?.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
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

    // 3. Revalidate Next.js cache so changes immediately appear on deployment
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
      revalidatePath(`/article/${id}`);
      if (updatedArticle.id !== id) {
        revalidatePath(`/article/${updatedArticle.id}`);
      }
    } catch (e) {
      console.warn("[PUT news] revalidatePath error:", e);
    }

    return NextResponse.json({ article: updatedArticle });
  } catch (error) {
    console.error("[PUT news] Unhandled error:", error);
    return NextResponse.json({ error: "Unable to update article." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = decodeURIComponent(rawId ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "Article id is required." }, { status: 400 });
    }

    const url = env.supabaseUrl();
    const isRealSupabase = Boolean(url && !url.includes("example.supabase.co") && !url.includes("dummy"));

    let deletedInSupabase = false;
    let supabaseError: string | null = null;

    if (isRealSupabase) {
      try {
        const supabase = createServiceClient();

        // 1. If id is a valid UUID, delete directly by ID
        if (isUuid(id)) {
          const { error, count } = await supabase.from("news").delete().eq("id", id);
          if (error) {
            supabaseError = error.message;
            console.error("[DELETE news] Supabase delete by ID error:", error);
          } else {
            deletedInSupabase = true;
            console.log("[DELETE news] Deleted by UUID id:", id, "count:", count);
          }
        }

        // 2. If not deleted by UUID (or id is non-UUID string), match by title or search DB
        if (!deletedInSupabase) {
          const localArticles = await getLocalArticles();
          const targetLocal = localArticles.find((a) => a.id === id);
          const searchTitle = targetLocal?.title || id;

          const { error: titleDeleteError } = await supabase
            .from("news")
            .delete()
            .eq("title", searchTitle);

          if (titleDeleteError) {
            supabaseError = titleDeleteError.message;
            console.error("[DELETE news] Delete by title error:", titleDeleteError);
          } else {
            deletedInSupabase = true;
            console.log("[DELETE news] Deleted by title:", searchTitle);
          }
        }
      } catch (err) {
        supabaseError = err instanceof Error ? err.message : String(err);
        console.error("[DELETE news] Supabase delete exception:", err);
      }
    }

    // Local fallback delete (removes from public/articles.json if writable)
    const localArticles = await getLocalArticles();
    const filtered = localArticles.filter((a) => a.id !== id);
    if (filtered.length !== localArticles.length) {
      await saveLocalArticles(filtered);
    }

    if (isRealSupabase && supabaseError && !deletedInSupabase) {
      return NextResponse.json(
        { error: `Database delete failed: ${supabaseError}` },
        { status: 500 }
      );
    }

    // Revalidate Next.js static / server caches so Vercel pages refresh immediately
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
      revalidatePath(`/article/${id}`);
    } catch (e) {
      console.warn("[DELETE news] revalidatePath error:", e);
    }

    return NextResponse.json({ ok: true, message: "Article deleted successfully." });
  } catch (error) {
    console.error("[DELETE news] Unhandled error:", error);
    return NextResponse.json({ error: "Unable to delete article." }, { status: 500 });
  }
}
