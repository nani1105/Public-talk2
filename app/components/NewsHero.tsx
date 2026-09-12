"use client";

import Image from "next/image";
import type { NewsArticle } from "@/types/news";

type NewsHeroProps = {
  article?: NewsArticle | null;
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

export default function NewsHero({ article }: NewsHeroProps) {
  if (!article) {
    return (
      <div className="border-4 border-neutral-950 bg-white p-6 shadow-[10px_10px_0_#171717] md:p-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-red-800 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-white">
            Editorial Front
          </span>
          <span className="text-xs font-bold uppercase text-neutral-500">Public Record</span>
        </div>
        <h2 className="font-serif text-3xl font-black leading-tight md:text-5xl text-neutral-950">
          Independent Public Reporting & Daily E-Paper Edition
        </h2>
        <p className="mt-4 text-base leading-relaxed text-neutral-700 max-w-2xl font-serif">
          Welcome to Public Talk. We cover local news, governance, public affairs, and daily community issues.
          Browse our latest stories below or open today’s complete PDF e-paper edition.
        </p>
      </div>
    );
  }

  return (
    <article className="border-4 border-neutral-950 bg-white p-5 shadow-[10px_10px_0_#171717] md:p-7 space-y-5">
      {/* Category & Date Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-neutral-950 pb-3">
        <div className="flex items-center gap-2">
          <span className="bg-red-800 px-2.5 py-1 text-xs font-black uppercase tracking-widest text-white">
            {article.category}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-red-900">
            Top Story
          </span>
        </div>
        <time className="text-xs font-bold uppercase tracking-wide text-neutral-600">
          {formatDate(article.published_at)}
        </time>
      </div>

      {/* Hero Content */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl font-black leading-tight text-neutral-950 md:text-4xl lg:text-5xl hover:text-red-900 transition">
            {article.title}
          </h2>
          <p className="font-serif text-base leading-relaxed text-neutral-800 md:text-lg">
            {article.snippet || article.body.slice(0, 240) + "..."}
          </p>
          <div className="pt-2 border-t border-neutral-200 text-xs font-bold uppercase tracking-widest text-neutral-500">
            By Public Talk Editorial Desk
          </div>
        </div>

        {article.image_url ? (
          <div className="relative border-2 border-neutral-950 overflow-hidden shadow-[4px_4px_0_#171717]">
            <Image
              src={article.image_url}
              alt={article.title}
              width={800}
              height={500}
              unoptimized
              className="h-64 w-full object-cover md:h-80 transition-transform duration-500 hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-64 md:h-80 w-full items-center justify-center border-2 border-dashed border-neutral-400 bg-[#f7f4ed] p-6 text-center text-sm font-bold text-neutral-500">
            [ Editorial Archive Image ]
          </div>
        )}
      </div>
    </article>
  );
}
