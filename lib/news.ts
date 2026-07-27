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

export const uploadEpaper = async (file: File): Promise<string> => {
  const supabase = createServiceClient();
  const path = env.epaperPath();
  const { error } = await supabase.storage.from(env.epaperBucket()).upload(path, file, {
    contentType: "application/pdf",
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) {
    throw error;
  }

  return getPublicFileUrl(env.epaperBucket(), path);
};

export const getEpaperUrl = () => {
  const url = getPublicFileUrl(env.epaperBucket(), env.epaperPath());
  return `${url}?v=${Date.now()}`;
};

export const deleteEpaper = async (): Promise<void> => {
  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(env.epaperBucket()).remove([env.epaperPath()]);

  if (error) {
    throw error;
  }
};
