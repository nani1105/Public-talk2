import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";
import { env } from "@/lib/env";
import type { NewsArticle } from "@/types/news";

export const getLatestNews = async (): Promise<NewsArticle[]> => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
};

export const getEpaperUrl = () => {
  const url = getPublicFileUrl(env.epaperBucket(), env.epaperPath());
  return `${url}?v=${Date.now()}`;
};
