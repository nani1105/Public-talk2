import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { uploadEpaper, getEpaperUrl, deleteEpaper } from "@/lib/news";

const MAX_PDF_BYTES = 25 * 1024 * 1024;

export async function GET() {
  const url = await getEpaperUrl();
  return NextResponse.json({ url });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("pdf");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A valid PDF file is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "PDF must be 25MB or smaller" }, { status: 400 });
    }

    const url = await uploadEpaper(file);

    return NextResponse.json({
      success: true,
      message: "E-Paper updated successfully",
      url,
      viewerUrl: "/api/epaper",
    });
  } catch (error) {
    console.error("[admin/epaper] upload failed", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteEpaper();
    return NextResponse.json({ success: true, message: "E-Paper deleted" });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}