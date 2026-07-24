const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  adminUsername: () => requireEnv("ADMIN_USERNAME"),
  adminPassword: () => requireEnv("ADMIN_PASSWORD"),
  jwtSecret: () => requireEnv("JWT_SECRET"),
  supabaseUrl: () => requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  newsImageBucket: () => process.env.SUPABASE_NEWS_IMAGE_BUCKET ?? "news-images",
  epaperBucket: () => process.env.SUPABASE_EPAPER_BUCKET ?? "epapers",
  epaperPath: () => process.env.SUPABASE_EPAPER_PATH ?? "daily/epaper.pdf"
};
