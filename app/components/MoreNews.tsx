"use client";

import Link from "next/link";
import type { NewsArticle } from "@/types/news";

type MoreNewsProps = {
  articles: NewsArticle[];
};

export default function MoreNews({ articles }: MoreNewsProps) {
  return (
    <section className="mt-8 border-t-4 border-neutral-950 pt-6 space-y-6">
      {/* SECTION HEADER MATCHING REFERENCE IMAGE */}
      <div className="text-center space-y-1">
        <h2 className="font-serif text-2xl md:text-3xl font-black text-neutral-950 tracking-wide">
          More News from PUBLIC TALK MEDIA
        </h2>
        <div className="w-16 h-1 bg-red-700 mx-auto rounded-full mt-1"></div>
      </div>

      {articles.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-400 bg-white p-6 text-center text-sm font-semibold text-neutral-600">
          No additional articles published yet. Stay tuned for fresh news updates!
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 6).map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group flex items-center gap-3 border-l-4 border-red-700 bg-white p-3 shadow-md border-y border-r border-neutral-200 rounded-r-lg hover:bg-neutral-50 transition duration-200"
            >
              {/* Left Thumbnail */}
              {article.image_url ? (
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image_url}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                </div>
              ) : (
                <div className="h-16 w-20 shrink-0 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-400 text-center px-1">
                  Public Talk
                </div>
              )}

              {/* Right Title & Category */}
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                  {article.category}
                </span>
                <h3 className="font-serif text-sm font-bold leading-snug text-neutral-950 group-hover:text-red-900 transition line-clamp-2">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
