import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { NewsArticle } from "@/types/news";

type Database = {
  public: {
    Tables: {
      news: {
        Row: NewsArticle;
        Insert: Omit<NewsArticle, "id" | "published_at"> & {
          id?: string;
          published_at?: string;
        };
        Update: Partial<NewsArticle>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const createServiceClient = () => {
  return createClient<Database>(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export const getPublicFileUrl = (bucket: string, path: string) => {
  const supabase = createServiceClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};
