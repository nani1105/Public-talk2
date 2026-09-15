import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { NEWS_CATEGORIES, type NewsCategory, type NewsArticle } from "@/types/news";
import { env } from "@/lib/env";
import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";
import { getLatestNews, getLocalArticles, saveLocalArticles, saveUploadedImage } from "@/lib/news";

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

const isUuid = (str: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
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
      const supabase = createServiceClient();

      // Case 1: Real Supabase article with a valid UUID
      if (isUuid(id)) {
        const updatePayload: Record<string, any> = {
          title,
          category,
          body,
          snippet: makeSnippet(body),
        };

        if (image) {
          try {
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const imagePath = `${Date.now()}-${crypto.randomUUID()}${getExtension(image.name)}`;

            const { error: uploadError } = await supabase.storage
              .from(env.newsImageBucket())
              .upload(imagePath, buffer, {
                contentType: image.type || "image/jpeg",
                upsert: false,
                cacheControl: "31536000",
              });

            if (uploadError) {
              console.error("[PUT news] Storage upload error:", uploadError);
              return NextResponse.json(
                { error: `Storage upload failed: ${uploadError.message}` },
                { status: 500 }
              );
            }

            updatePayload.image_path = imagePath;
            updatePayload.image_url = getPublicFileUrl(env.newsImageBucket(), imagePath);
          } catch (err) {
            console.error("[PUT news] Image processing error:", err);
            return NextResponse.json(
              { error: `Image upload exception: ${err instanceof Error ? err.message : String(err)}` },
              { status: 500 }
            );
          }
        }

        const { data, error: updateError } = await supabase
          .from("news")
          .update(updatePayload)
          .eq("id", id)
          .select("*")
          .single();

        if (updateError) {
          console.error("[PUT news] DB update error:", updateError);
          return NextResponse.json(
            { error: `Database update failed: ${updateError.message} (code: ${updateError.code})` },
            { status: 500 }
          );
        }

        if (data) {
          updatedArticle = data;
        }
      } else {
        // Case 2: Starter/Dummy article (ID like "dummy-1")
        // User is customizing a sample post -> Save as a real article in Supabase!
        let imageUrl = "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80";
        let imagePath = "";

        if (image) {
          try {
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            imagePath = `${Date.now()}-${crypto.randomUUID()}${getExtension(image.name)}`;

            const { error: uploadError } = await supabase.storage
              .from(env.newsImageBucket())
              .upload(imagePath, buffer, {
                contentType: image.type || "image/jpeg",
                upsert: false,
                cacheControl: "31536000",
              });

            if (uploadError) {
              return NextResponse.json(
                { error: `Storage upload failed: ${uploadError.message}` },
                { status: 500 }
              );
            }

            imageUrl = getPublicFileUrl(env.newsImageBucket(), imagePath);
          } catch (err) {
            return NextResponse.json(
              { error: `Image upload exception: ${err instanceof Error ? err.message : String(err)}` },
              { status: 500 }
            );
          }
        } else {
          // Retain the template image
          const allArticles = await getLatestNews();
          const existing = allArticles.find((a) => a.id === id);
          if (existing?.image_url) {
            imageUrl = existing.image_url;
          }
        }

        const { data, error: insertError } = await supabase
          .from("news")
          .insert({
            title,
            category,
            body,
            snippet: makeSnippet(body),
            image_url: imageUrl,
            image_path: imagePath,
          })
          .select("*")
          .single();

        if (insertError) {
          console.error("[PUT news] DB insert for template article error:", insertError);
          return NextResponse.json(
            { error: `Failed to publish template article: ${insertError.message} (code: ${insertError.code})` },
            { status: 500 }
          );
        }

        if (data) {
          updatedArticle = data;
        }
      }
    }

    // Local fallback update if Supabase is not configured
    if (!updatedArticle) {
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

    try {
      revalidatePath("/");
      revalidatePath("/admin");
      if (updatedArticle?.id) {
        revalidatePath(`/article/${updatedArticle.id}`);
      }
    } catch {
      // Ignore revalidate error outside request context
    }

    return NextResponse.json({ article: updatedArticle });
  } catch (error) {
    console.error("[PUT news] Unhandled error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update article." },
      { status: 500 }
    );
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

    if (isRealSupabase && isUuid(id)) {
      const supabase = createServiceClient();
      try {
        const { data: existing } = await supabase
          .from("news")
          .select("image_path")
          .eq("id", id)
          .maybeSingle();

        if (existing?.image_path) {
          await supabase.storage.from(env.newsImageBucket()).remove([existing.image_path]);
        }
      } catch {
        // Non-critical image cleanup failure
      }

      const { error: deleteError } = await supabase.from("news").delete().eq("id", id);
      if (deleteError) {
        console.error("[DELETE news] DB delete error:", deleteError);
        return NextResponse.json(
          { error: `Failed to delete from database: ${deleteError.message}` },
          { status: 500 }
        );
      }
    }

    // Local fallback delete
    const localArticles = await getLocalArticles();
    const filtered = localArticles.filter((a) => a.id !== id);
    if (filtered.length !== localArticles.length) {
      await saveLocalArticles(filtered);
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch {
      // Ignore revalidate error outside request context
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE news] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete article." },
      { status: 500 }
    );
  }
}