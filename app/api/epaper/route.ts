import { NextResponse } from "next/server";
import { getEpaperUrl } from "@/lib/news";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const url = await getEpaperUrl();
  if (!url) {
    return NextResponse.json({ url: null }, { status: 404 });
  }
  return NextResponse.json({ url });
}
