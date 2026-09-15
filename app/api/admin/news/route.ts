import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { NEWS_CATEGORIES, type NewsCategory, type NewsArticle } from "@/types/news";
import { env } from "@/lib/env";
import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";
import { getLatestNews, getLocalArticles, saveLocalArticles, saveUploadedImage } from "@/lib/news";

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

const getCoverImage = (formData: FormData) => {
  const image = formData.get("image") ?? formData.get("coverImage");
  return image instanceof File && image.size > 0 ? image : null;
};

export async function GET() {
  try {
    const articles = await getLatestNews();
    return NextResponse.json(articles);
  } catch (error) {
    console.error("[GET news]", error);
    return NextResponse.json({ error: "Unable to load articles." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim() as NewsCategory;
    const body = String(formData.get("body") ?? "").trim();
    const image = getCoverImage(formData);

    if (!title || !body || !NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Title, category, and body are required." }, { status: 400 });
    }

    if (!image) {
      return NextResponse.json({ error: "A cover image is required." }, { status: 400 });
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Cover file must be an image." }, { status: 400 });
    }

    const url = env.supabaseUrl();
    const isRealSupabase = Boolean(url && !url.includes("example.supabase.co") && !url.includes("dummy"));

    console.log("[POST news] isRealSupabase:", isRealSupabase, "url:", url?.slice(0, 30));

    let article: NewsArticle | null = null;
    let supabaseError: string | null = null;

    if (isRealSupabase) {
      try {
        const supabase = createServiceClient();
        const imagePath = `${Date.now()}-${crypto.randomUUID()}${getExtension(image.name)}`;

        console.log("[POST news] Uploading image to bucket:", env.newsImageBucket(), "path:", imagePath);

        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { error: uploadError } = await supabase.storage
          .from(env.newsImageBucket())
          .upload(imagePath, buffer, {
            contentType: image.type || "image/jpeg",
            upsert: false,
            cacheControl: "31536000"
          });

        if (uploadError) {
          supabaseError = `Storage upload failed: ${uploadError.message}`;
          console.error("[POST news] Storage upload error:", uploadError);
        } else {
          const imageUrl = getPublicFileUrl(env.newsImageBucket(), imagePath);
          console.log("[POST news] Image uploaded, URL:", imageUrl?.slice(0, 60));

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
            supabaseError = `DB insert failed: ${insertError.message} [code: ${insertError.code}]`;
            console.error("[POST news] DB insert error:", insertError);
          } else if (data) {
            console.log("[POST news] Article saved to Supabase, id:", data.id);
            article = data;
          }
        }
      } catch (err) {
        supabaseError = `Exception: ${err instanceof Error ? err.message : String(err)}`;
        console.error("[POST news] Supabase exception:", err);
      }
    }

    // If Supabase failed, return the specific error instead of silently falling back
    if (!article && isRealSupabase && supabaseError) {
      return NextResponse.json(
        { error: `Supabase error — ${supabaseError}. Check Vercel logs for details.` },
        { status: 500 }
      );
    }

    // Local fallback (only used when Supabase is not configured)
    if (!article) {
      const localImageUrl = await saveUploadedImage(image);

      const newArticle: NewsArticle = {
        id: `post-${Date.now()}`,
        title,
        category,
        body,
        snippet: makeSnippet(body),
        image_url: localImageUrl,
        image_path: "",
        published_at: new Date().toISOString(),
      };

      const existingLocal = await getLocalArticles();
      await saveLocalArticles([newArticle, ...existingLocal]);
      article = newArticle;
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch {
      // Ignore revalidate outside request context
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("[POST news] Unhandled error:", error);
    return NextResponse.json({ error: "Unable to publish article." }, { status: 500 });
  }
}