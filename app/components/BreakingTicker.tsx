"use client";

import Link from "next/link";
import type { NewsArticle } from "@/types/news";

type BreakingTickerProps = {
  articles: NewsArticle[];
};

export default function BreakingTicker({ articles }: BreakingTickerProps) {
  if (!articles || articles.length === 0) return null;

  const tickerItems = articles.slice(0, 4);

  return (
    <div className="border-b-2 border-neutral-950 bg-neutral-950 text-white py-1.5 px-4">
      <div className="mx-auto flex max-w-7xl items-center gap-3 text-xs font-bold">
        <span className="shrink-0 bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase text-white animate-pulse">
          BREAKING NEWS
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-flex gap-8 animate-marquee font-serif tracking-wide text-stone-200">
            {tickerItems.map((item, idx) => (
              <span key={item.id || idx} className="inline-flex items-center gap-2">
                <span className="text-red-500">■</span>
                <span className="hover:text-red-400 cursor-pointer font-sans text-xs">
                  {item.title}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
