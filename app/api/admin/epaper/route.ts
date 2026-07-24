import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      filename?: string;
      contentType?: string;
      size?: number;
    };

    if (!body.filename?.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "A PDF filename is required." }, { status: 400 });
    }

    if (body.contentType && body.contentType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    }

    if (!body.size || body.size <= 0) {
      return NextResponse.json({ error: "The PDF file is empty." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const bucket = supabase.storage.from(env.epaperBucket());
    const epaperPath = env.epaperPath();

    const { error: removeError } = await bucket.remove([epaperPath]);

    if (removeError) {
      console.error(removeError);
    }

    const { data, error: signedUrlError } = await bucket.createSignedUploadUrl(epaperPath, {
      upsert: false
    });

    if (signedUrlError) {
      return NextResponse.json({ error: signedUrlError.message }, { status: 500 });
    }

    return NextResponse.json({
      bucket: env.epaperBucket(),
      path: data.path,
      token: data.token
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to prepare e-paper upload." }, { status: 500 });
  }
}
