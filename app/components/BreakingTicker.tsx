"use client";

import Link from "next/link";
import type { NewsArticle } from "@/types/news";

type BreakingTickerProps = {
  articles: NewsArticle[];
};

export default function BreakingTicker({ articles }: BreakingTickerProps) {
  if (!articles || articles.length === 0) return null;

  const tickerItems = articles.slice(0, 5);
  // Duplicate array for seamless infinite marquee loop
  const loopItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="border-b-2 border-neutral-950 bg-neutral-950 text-white py-2 px-4 overflow-hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 text-xs font-bold">
        <div className="shrink-0 flex items-center gap-1.5 bg-red-800 px-2.5 py-1 text-[10px] font-black uppercase text-white tracking-widest shadow-[2px_2px_0_#ffffff]">
          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
          <span>BREAKING NEWS</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="animate-marquee inline-flex gap-8 font-serif tracking-wide text-stone-200">
            {loopItems.map((item, idx) => (
              <Link
                key={`${item.id}_${idx}`}
                href={`/article/${item.id}`}
                className="inline-flex items-center gap-2 hover:text-red-400 transition font-sans text-xs"
              >
                <span className="text-red-500 font-bold">■</span>
                <span className="font-semibold underline-offset-4 hover:underline">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
