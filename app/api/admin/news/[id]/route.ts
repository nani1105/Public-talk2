import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Article id is required." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: article, error: findError } = await supabase
      .from("news")
      .select("image_path")
      .eq("id", id)
      .single();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from("news").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (article?.image_path) {
      const { error: storageError } = await supabase.storage
        .from(env.newsImageBucket())
        .remove([article.image_path]);

      if (storageError) {
        console.error(storageError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete article." }, { status: 500 });
  }
}
