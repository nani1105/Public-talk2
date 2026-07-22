import { NextResponse } from "next/server";
import { readNews } from "@/lib/news";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await readNews();
  return NextResponse.json(articles);
}
