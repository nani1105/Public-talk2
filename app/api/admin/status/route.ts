import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = env.supabaseUrl();
  const key = env.supabaseServiceRoleKey();
  const isConfigured = Boolean(
    url &&
    !url.includes("example.supabase.co") &&
    key &&
    !key.includes("dummy")
  );

  if (!isConfigured) {
    return NextResponse.json({
      connected: false,
      configured: false,
      message: "Supabase environment variables are missing or default in Vercel settings.",
      supabaseUrl: url || null,
      articleCount: 0,
    });
  }

  try {
    const supabase = createServiceClient();
    const { count, error } = await supabase
      .from("news")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({
        connected: false,
        configured: true,
        message: `Database error: ${error.message} (${error.code || "unknown"})`,
        supabaseUrl: url,
        articleCount: 0,
      });
    }

    return NextResponse.json({
      connected: true,
      configured: true,
      message: "Connected to Supabase database successfully.",
      supabaseUrl: url,
      articleCount: count ?? 0,
    });
  } catch (err) {
    return NextResponse.json({
      connected: false,
      configured: true,
      message: `Connection exception: ${err instanceof Error ? err.message : String(err)}`,
      supabaseUrl: url,
      articleCount: 0,
    });
  }
}
