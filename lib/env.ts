const getEnv = (name: string, fallback = ""): string => {
  const value = process.env[name];
  return (value ?? fallback).trim();
};

export const env = {
  adminUsername: () => getEnv("ADMIN_USERNAME", "admin"),
  adminPassword: () => getEnv("ADMIN_PASSWORD", "publictalk"),
  jwtSecret: () => getEnv("JWT_SECRET", "development-secret"),
  supabaseUrl: () => getEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co"),
  supabaseAnonKey: () => getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "dummy-anon-key"),
  supabaseServiceRoleKey: () => getEnv("SUPABASE_SERVICE_ROLE_KEY", "dummy-service-role-key"),
  newsImageBucket: () => getEnv("SUPABASE_NEWS_IMAGE_BUCKET", "news-images"),
  epaperBucket: () => getEnv("SUPABASE_EPAPER_BUCKET", "epapers"),
  epaperPath: () => getEnv("SUPABASE_EPAPER_PATH", "daily/epaper.pdf")
};
