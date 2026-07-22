import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSessionFromCookies } from "@/lib/auth";

const MAX_PDF_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("pdf");

    if (!(file instanceof File) || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "A valid PDF file is required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: "PDF must be 25MB or smaller" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dest = path.join(process.cwd(), "public", "epaper.pdf");
    await fs.writeFile(dest, buffer);

    return NextResponse.json({ success: true, message: "E-Paper updated successfully" });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
