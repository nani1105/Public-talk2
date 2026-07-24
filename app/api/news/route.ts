import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/news";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await getLatestNews();
  return NextResponse.json({ articles });
}
