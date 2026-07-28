import { NextResponse } from "next/server";
import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PDF_HEADERS = {
  "Content-Type": "application/pdf",
  "Content-Disposition": 'inline; filename="epaper.pdf"',
  "Cache-Control": "public, max-age=0, must-revalidate",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function GET() {
  const supabase = createServiceClient();

  // Attempt 1: download via Supabase service client
  try {
    const { data, error } = await supabase.storage
      .from(env.epaperBucket())
      .download(env.epaperPath());

    if (error) {
      console.error("[epaper] supabase download error:", error.message);
    }

    if (data && !error) {
      const bytes = await data.arrayBuffer();
      return new NextResponse(bytes, { status: 200, headers: PDF_HEADERS });
    }
  } catch (err) {
    console.error("[epaper] service client threw:", err);
  }

  // Attempt 2: fetch the public URL directly
  try {
    const publicUrl = getPublicFileUrl(env.epaperBucket(), env.epaperPath());
    const response = await fetch(publicUrl, { cache: "no-store" });

    if (response.ok) {
      const bytes = await response.arrayBuffer();
      return new NextResponse(bytes, { status: 200, headers: PDF_HEADERS });
    }

    console.error("[epaper] public fetch failed:", response.status, publicUrl);
  } catch (err) {
    console.error("[epaper] public fetch threw:", err);
  }

  return NextResponse.json(
    { error: "E-paper not found. Upload a PDF from the admin portal." },
    { status: 404 }
  );
}
