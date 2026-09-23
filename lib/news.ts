import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";
import { env } from "@/lib/env";
import type { NewsArticle } from "@/types/news";
import fs from "fs";
import path from "path";

const DUMMY_ARTICLES: NewsArticle[] = [
  {
    id: "dummy-1",
    title: "City Council Approves New Infrastructure & Public Transit Modernization Plan",
    category: "Politics",
    snippet: "The municipal assembly voted unanimously to allocate fresh funding for road reconstruction, green transit corridors, and public facility upgrades across central districts.",
    body: "In a landmark legislative session, the City Council today officially passed the 2026 Urban Modernization & Transit Improvement Bill. The comprehensive package earmarks resources for repaving major thoroughfares, expanding electric bus routes, and renovating historical public squares. Civic leaders highlighted that the project will generate hundreds of regional jobs while significantly cutting commute times.",
    image_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    image_path: "",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "dummy-2",
    title: "Annual Agricultural Fair Highlights Local Farmers & Sustainable Innovation",
    category: "Local",
    snippet: "Over fifty regional producers showcased organic harvests, water-saving irrigation tech, and artisanal food products at the annual state exhibition grounds.",
    body: "The annual Public Talk Agricultural & Produce Exhibition opened to record turnout today. Local farming cooperatives presented breakthrough solar-powered drip irrigation systems alongside premium organic produce. Event organizers emphasized the importance of empowering smallholder farmers and securing local food supply chains.",
    image_url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    image_path: "",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "dummy-3",
    title: "Regional Tech Summit Focuses on Artificial Intelligence & Cyber Defense",
    category: "Business",
    snippet: "Industry leaders, startup founders, and policy experts gathered to address responsible AI deployment, cybersecurity standards, and tech employment growth.",
    body: "Technology executives and policy makers convened for the opening keynote of the Regional Tech & Innovation Summit. Panelists discussed emerging frameworks for data privacy, cloud resilience, and supporting local tech incubators. The summit also unveiled a new youth vocational training initiative.",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    image_path: "",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "dummy-4",
    title: "District Championship Finals Draw Record Crowds in High-Stakes Opener",
    category: "Sports",
    snippet: "The underdog team secured a dramatic victory in the final minutes of extra time, thrilling thousands of spectators at the central stadium.",
    body: "Fans filled the county arena to capacity as the seasonal championship final reached an exhilarating finish. The home team mounted a remarkable fourth-quarter comeback, sealing a 3-2 victory with a last-minute goal. Coach lauded the squad's resilience and disciplined teamwork.",
    image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    image_path: "",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "dummy-5",
    title: "Global Energy Forum Signs Accord on Clean Power Expansion & Grid Storage",
    category: "World",
    snippet: "International delegates committed to joint investments in renewable storage technologies and cross-border clean energy transmission lines.",
    body: "Representatives from over thirty nations concluded the international energy summit by signing a pact to accelerate battery storage manufacturing and grid interconnection. The agreement aims to stabilize regional energy grids while reducing reliance on fossil fuels.",
    image_url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
    image_path: "",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
  },
  {
    id: "dummy-6",
    title: "Public Health Department Opens New Multi-Specialty Clinic in East District",
    category: "Local",
    snippet: "The modern healthcare facility will provide accessible diagnostic services, pediatric care, and wellness consultations to over 40,000 residents.",
    body: "Community members joined public health officials today for the official ribbon-cutting ceremony of the East District Health Center. Equipped with state-of-the-art diagnostic tools, an emergency triage unit, and maternal health services, the facility marks a major milestone in local healthcare infrastructure.",
    image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    image_path: "",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

export const saveUploadedImage = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/jpeg";

    // Also attempt saving to disk if writable (for local dev)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        await fs.promises.mkdir(uploadsDir, { recursive: true });
      }
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const filePath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(filePath, buffer);
    } catch {
      // Ignore disk write failures on serverless (Vercel)
    }

    // Return Base64 Data URL for 100% Vercel Serverless compatibility
    const base64 = buffer.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch (err) {
    console.error("[saveUploadedImage] error:", err);
    return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
  }
};

export const getLocalArticles = async (): Promise<NewsArticle[]> => {
  try {
    const filePath = path.join(process.cwd(), "public", "articles.json");
    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, "utf-8");
      if (content && content.trim()) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.error("[getLocalArticles] error:", err);
  }
  return [];
};

export const saveLocalArticles = async (articles: NewsArticle[]) => {
  try {
    const filePath = path.join(process.cwd(), "public", "articles.json");
    await fs.promises.writeFile(filePath, JSON.stringify(articles, null, 2), "utf-8");
  } catch (err) {
    console.error("[saveLocalArticles] error:", err);
  }
};

export const isUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const syncLocalArticlesToSupabase = async (): Promise<{ synced: number; errors: string[] }> => {
  const url = env.supabaseUrl();
  const isRealSupabase = Boolean(url && !url.includes("example.supabase.co") && !url.includes("dummy"));
  if (!isRealSupabase) {
    return { synced: 0, errors: ["Supabase credentials are not configured."] };
  }

  const localArticles = await getLocalArticles();
  if (localArticles.length === 0) {
    return { synced: 0, errors: [] };
  }

  const errors: string[] = [];
  let synced = 0;

  try {
    const supabase = createServiceClient();
    const { data: existingDbArticles } = await supabase.from("news").select("id, title");
    const existingTitles = new Set((existingDbArticles || []).map((a) => a.title.trim().toLowerCase()));

    for (const article of localArticles) {
      if (existingTitles.has(article.title.trim().toLowerCase())) {
        console.log(`[syncLocalArticlesToSupabase] Article "${article.title}" already exists in DB.`);
        continue;
      }

      let imageUrl = article.image_url || "";
      if (!imageUrl || imageUrl.startsWith("/uploads/")) {
        imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
      }

      const newId = isUuid(article.id) ? article.id : crypto.randomUUID();

      const { error: insertError } = await supabase.from("news").insert({
        id: newId,
        title: article.title,
        category: article.category,
        body: article.body,
        snippet: article.snippet || article.body.slice(0, 140),
        image_url: imageUrl,
        image_path: article.image_path || "",
        published_at: article.published_at || new Date().toISOString(),
      });

      if (insertError) {
        console.error(`[syncLocalArticlesToSupabase] Failed to migrate "${article.title}":`, insertError.message);
        errors.push(`"${article.title}": ${insertError.message}`);
      } else {
        synced++;
        console.log(`[syncLocalArticlesToSupabase] Migrated "${article.title}" with ID ${newId}`);
      }
    }
  } catch (err) {
    console.error("[syncLocalArticlesToSupabase] Error:", err);
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return { synced, errors };
};

export const getLatestNews = async (): Promise<NewsArticle[]> => {
  const url = env.supabaseUrl();
  const isRealSupabase = Boolean(url && !url.includes("example.supabase.co") && !url.includes("dummy"));

  console.log("[getLatestNews] isRealSupabase:", isRealSupabase, "url:", url?.slice(0, 30));

  if (isRealSupabase) {
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("[getLatestNews] Supabase error:", error.message, "code:", error.code, "details:", error.details);
      } else if (data && data.length > 0) {
        console.log("[getLatestNews] Loaded", data.length, "articles from Supabase");
        return data;
      } else {
        console.log("[getLatestNews] Supabase returned 0 articles. Attempting auto-sync of local articles...");
        await syncLocalArticlesToSupabase();
        const { data: recheckData } = await supabase
          .from("news")
          .select("*")
          .order("published_at", { ascending: false });
        if (recheckData && recheckData.length > 0) {
          return recheckData;
        }
      }
    } catch (err) {
      console.error("[getLatestNews] exception:", err);
    }
  }

  // Local fallback (only used when Supabase is disabled or not configured)
  const localArticles = await getLocalArticles();
  if (localArticles.length > 0) {
    return localArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }

  // Fallback to rich dummy articles if no published articles exist
  return DUMMY_ARTICLES;
};

export const uploadEpaper = async (file: File): Promise<string> => {
  try {
    const supabase = createServiceClient();
    const storagePath = env.epaperPath();
    const { error } = await supabase.storage.from(env.epaperBucket()).upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "31536000",
    });

    if (!error) {
      return getPublicFileUrl(env.epaperBucket(), storagePath);
    }

    console.warn("[uploadEpaper] Supabase storage upload error, saving locally:", error.message);
  } catch (err) {
    console.warn("[uploadEpaper] Supabase upload failed, saving locally:", err);
  }

  // Fallback: save PDF directly to local public/epaper.pdf
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const localFilePath = path.join(process.cwd(), "public", "epaper.pdf");
    await fs.promises.writeFile(localFilePath, buffer);
  } catch {
    // Ignore serverless disk write error
  }

  return "/api/epaper";
};

export const getEpaperUrl = () => {
  const url = getPublicFileUrl(env.epaperBucket(), env.epaperPath());
  return `${url}?v=${Date.now()}`;
};

export const deleteEpaper = async (): Promise<void> => {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.storage.from(env.epaperBucket()).remove([env.epaperPath()]);
    if (error) {
      console.warn("[deleteEpaper] Supabase delete error:", error.message);
    }
  } catch (err) {
    console.warn("[deleteEpaper] Supabase delete exception:", err);
  }

  // Also remove local file if present
  try {
    const localFilePath = path.join(process.cwd(), "public", "epaper.pdf");
    if (fs.existsSync(localFilePath)) {
      await fs.promises.unlink(localFilePath);
    }
  } catch (err) {
    console.error("[deleteEpaper] local delete error:", err);
  }
};
