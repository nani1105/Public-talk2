"use client";

import { useState } from "react";
import Link from "next/link";
import type { NewsArticle } from "@/types/news";

type NewsHeroProps = {
  article?: NewsArticle | null;
  articles?: NewsArticle[];
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

export default function NewsHero({ article, articles = [] }: NewsHeroProps) {
  const heroList = articles.length > 0 ? articles.slice(0, 5) : article ? [article] : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeArticle = heroList[currentIndex] || heroList[0] || null;

  if (!activeArticle) {
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
        </p>
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? heroList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === heroList.length - 1 ? 0 : prev + 1));
  };

  return (
    <article className="border-4 border-neutral-950 bg-white p-3 md:p-6 shadow-[8px_8px_0_#171717] space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-2">
        <div className="flex items-center gap-2">
          <span className="bg-[#004080] px-3 py-0.5 text-xs font-black uppercase tracking-wider text-white">
            {activeArticle.category}
          </span>
          <span className="text-xs font-black text-red-800 uppercase tracking-wider">
            ముఖ్య అంశాలు (Top Story)
          </span>
        </div>
        <time className="text-[11px] font-bold text-neutral-500">
          {formatDate(activeArticle.published_at)}
        </time>
      </div>

      {/* Hero Image Container with 1/N Badge & Left/Right Overlay Arrows (Eenadu Mobile Style) */}
      <div className="relative border-2 border-neutral-950 overflow-hidden bg-black shadow-[4px_4px_0_#171717] group">
        <Link href={`/article/${activeArticle.id}`} className="block relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeArticle.image_url}
            alt={activeArticle.title}
            loading="eager"
            className="h-56 sm:h-72 md:h-96 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80";
            }}
          />
        </Link>

        {/* 1/N Page Badge */}
        {heroList.length > 1 && (
          <div className="absolute top-2 right-2 bg-red-800/90 text-white font-mono text-xs font-black px-2 py-0.5 rounded shadow z-20">
            {currentIndex + 1}/{heroList.length}
          </div>
        )}

        {/* Semi-transparent Left & Right Navigation Arrows */}
        {heroList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-red-800/70 hover:bg-red-800 text-white text-2xl font-black shadow-lg backdrop-blur-sm transition active:scale-90"
              title="Previous Story"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-red-800/70 hover:bg-red-800 text-white text-2xl font-black shadow-lg backdrop-blur-sm transition active:scale-90"
              title="Next Story"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Red/Bold Telugu Headline Below Image */}
      <div className="space-y-2 pt-1">
        <Link href={`/article/${activeArticle.id}`} className="group block">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-black leading-snug text-red-800 group-hover:text-neutral-950 transition">
            '{activeArticle.title}'
          </h2>
        </Link>
        <p className="font-serif text-sm md:text-base leading-relaxed text-neutral-800 line-clamp-2">
          {activeArticle.snippet || activeArticle.body}
        </p>
      </div>
    </article>
  );
}
