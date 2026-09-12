import { NextResponse } from "next/server";
import { createServiceClient, getPublicFileUrl } from "@/lib/supabase";
import { env } from "@/lib/env";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PDF_HEADERS = {
  "Content-Type": "application/pdf",
  "Content-Disposition": 'inline; filename="epaper.pdf"',
  "Cache-Control": "public, max-age=0, must-revalidate",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function GET() {
  const url = env.supabaseUrl();
  const isRealSupabase = Boolean(url && !url.includes("example.supabase.co") && !url.includes("dummy"));

  // If real Supabase is configured, try fetching from Supabase Storage first
  if (isRealSupabase) {
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase.storage
        .from(env.epaperBucket())
        .download(env.epaperPath());

      if (data && !error) {
        const arrayBuffer = await data.arrayBuffer();
        return new NextResponse(new Uint8Array(arrayBuffer), { status: 200, headers: PDF_HEADERS });
      }
    } catch (err) {
      console.error("[epaper] Supabase download error:", err);
    }

    try {
      const publicUrl = getPublicFileUrl(env.epaperBucket(), env.epaperPath());
      const response = await fetch(publicUrl, { cache: "no-store" });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return new NextResponse(new Uint8Array(arrayBuffer), { status: 200, headers: PDF_HEADERS });
      }
    } catch (err) {
      console.error("[epaper] Supabase public fetch error:", err);
    }
  }

  // Local fallback: serve public/epaper.pdf safely as Uint8Array
  try {
    const localPath = path.join(process.cwd(), "public", "epaper.pdf");
    if (fs.existsSync(localPath)) {
      const buffer = await fs.promises.readFile(localPath);
      const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      return new NextResponse(uint8Array, { status: 200, headers: PDF_HEADERS });
    }
  } catch (err) {
    console.error("[epaper] Local file fallback error:", err);
  }

  return NextResponse.json(
    { error: "E-paper not found. Upload a PDF from the admin portal." },
    { status: 404 }
  );
}
