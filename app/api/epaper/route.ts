import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { env } from "@/lib/env";

export async function GET() {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase.storage
      .from(env.epaperBucket())
      .download(env.epaperPath());

    if (error || !data) {
      throw error ?? new Error("E-paper not found");
    }

    const bytes = await data.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="epaper.pdf"',
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/${env.epaperBucket()}/${env.epaperPath()}`;
    const response = await fetch(publicUrl, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json({ error: "E-paper not found" }, { status: 404 });
    }

    const bytes = await response.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/pdf",
        "Content-Disposition": 'inline; filename="epaper.pdf"',
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
