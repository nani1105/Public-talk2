"use client";

import Link from "next/link";
import type { NewsArticle } from "@/types/news";

type MoreNewsProps = {
  articles: NewsArticle[];
};

const formatDate = (date: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

export default function MoreNews({ articles }: MoreNewsProps) {
  return (
    <section className="mt-12 border-t-4 border-neutral-950 pt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-950 pb-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-800">
            Digital Edition Recommendations
          </p>
          <h2 className="font-serif text-3xl font-black text-neutral-950">
            More From Public Talk
          </h2>
        </div>
        <Link
          href="/"
          className="border-2 border-neutral-950 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-neutral-100 shadow-[2px_2px_0_#171717]"
        >
          View Main Website ↗
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-400 bg-white p-6 text-center text-sm font-semibold text-neutral-600">
          No additional articles published yet. Stay tuned for fresh news updates!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 6).map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group flex flex-col justify-between border-2 border-neutral-950 bg-white p-4 shadow-[4px_4px_0_#171717] hover:-translate-y-1 transition duration-200"
            >
              <div className="space-y-3">
                {article.image_url ? (
                  <div className="h-36 w-full overflow-hidden border border-neutral-300">
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
                  <div className="h-36 w-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-400">
                    Public Talk Archive
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="bg-red-800 px-2 py-0.5 uppercase text-white">
                    {article.category}
                  </span>
                  <time className="text-neutral-500">{formatDate(article.published_at)}</time>
                </div>

                <h3 className="font-serif text-lg font-black leading-snug text-neutral-950 group-hover:text-red-900 transition">
                  {article.title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200 text-xs font-bold text-red-900 flex items-center justify-between">
                <span>FULL STORY</span>
                <span>Read Article →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
