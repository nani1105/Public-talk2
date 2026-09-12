"use client";

import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/types/news";

type LatestNewsGridProps = {
  articles: NewsArticle[];
  selectedCategory?: string | null;
  onSelectCategory?: (cat: string | null) => void;
};

const formatDate = (date: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

export default function LatestNewsGrid({
  articles,
  selectedCategory,
  onSelectCategory,
}: LatestNewsGridProps) {
  const filtered = selectedCategory
    ? articles.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase())
    : articles;

  return (
    <div className="border-4 border-neutral-950 bg-[#fbfaf6] p-5 shadow-[8px_8px_0_#171717] md:p-6 space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-950 pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-800">
            Live Desk
          </p>
          <h2 className="font-serif text-3xl font-black text-neutral-950">
            Latest News {selectedCategory ? `· ${selectedCategory}` : ""}
          </h2>
        </div>

        {selectedCategory && (
          <Link
            href="/"
            className="border-2 border-neutral-950 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-100 shadow-[2px_2px_0_#171717]"
          >
            Show All News ✕
          </Link>
        )}
      </div>

      {/* Articles Grid */}
      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-400 bg-white p-8 text-center">
          <p className="font-serif text-lg font-bold text-neutral-700">
            No articles found in this section.
          </p>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            Check back later for fresh updates from our newsroom.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col justify-between border-2 border-neutral-950 bg-white p-4 shadow-[4px_4px_0_#171717] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#171717]"
            >
              <div className="space-y-3">
                {article.image_url ? (
                  <Link href={`/article/${article.id}`} className="block relative h-40 w-full overflow-hidden border border-neutral-900 bg-neutral-100">
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      width={640}
                      height={360}
                      unoptimized
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                ) : (
                  <div className="flex h-32 w-full items-center justify-center border border-dashed border-neutral-300 bg-neutral-50 text-xs font-bold text-neutral-400">
                    Public Talk Archive Image
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <span className="bg-red-800 px-2 py-0.5 uppercase tracking-wide text-white">
                    {article.category}
                  </span>
                  <time className="text-neutral-500">{formatDate(article.published_at)}</time>
                </div>

                <Link href={`/article/${article.id}`} className="block">
                  <h3 className="font-serif text-xl font-black leading-tight text-neutral-950 group-hover:text-red-900 transition">
                    {article.title}
                  </h3>
                </Link>

                <p className="text-xs leading-relaxed text-neutral-700 line-clamp-3">
                  {article.snippet || article.body}
                </p>
              </div>

              <div className="mt-4 border-t border-neutral-200 pt-3 flex justify-between items-center text-xs font-bold text-neutral-900">
                <span>PUBLIC TALK REPORT</span>
                <Link href={`/article/${article.id}`} className="text-red-800 group-hover:underline">
                  Read Story →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
