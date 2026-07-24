import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("epaper");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const bucket = supabase.storage.from(env.epaperBucket());
    const epaperPath = env.epaperPath();

    const { error: removeError } = await bucket.remove([epaperPath]);

    if (removeError) {
      console.error(removeError);
    }

    const { error: uploadError } = await bucket.upload(epaperPath, file, {
        contentType: "application/pdf",
        upsert: false,
        cacheControl: "60"
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to upload e-paper." }, { status: 500 });
  }
}
