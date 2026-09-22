import { NextResponse } from "next/server";
import { syncLocalArticlesToSupabase } from "@/lib/news";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncLocalArticlesToSupabase();
    
    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin");
    } catch (e) {
      console.warn("[POST sync] revalidatePath warning:", e);
    }

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      message: result.synced > 0
        ? `Successfully synced ${result.synced} local article(s) to Supabase Cloud Database.`
        : result.errors.length > 0
        ? `Sync warning: ${result.errors.join("; ")}`
        : "All articles are already synchronized with Supabase.",
    });
  } catch (error) {
    console.error("[POST sync] error:", error);
    return NextResponse.json(
      { error: "Failed to sync local articles to Supabase." },
      { status: 500 }
    );
  }
}
