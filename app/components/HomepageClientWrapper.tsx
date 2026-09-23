"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import BreakingTicker from "./BreakingTicker";
import NewsHero from "./NewsHero";
import LatestNewsGrid from "./LatestNewsGrid";
import EpaperPreviewCard from "./EpaperPreviewCard";
import type { NewsArticle } from "@/types/news";

type HomepageClientWrapperProps = {
  articles: NewsArticle[];
  epaperUrl: string;
};

export default function HomepageClientWrapper({
  articles,
  epaperUrl,
}: HomepageClientWrapperProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const topStory = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : articles;

  return (
    <>
      <BreakingTicker articles={articles} />
      <Navbar activeCategory={selectedCategory} />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-10">
        {/* Main Grid: Left Column (Stories & News), Right Column (Today's E-Paper Showcase & Notes) */}
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr] items-start">
          {/* Main Column */}
          <div className="space-y-8">
            {/* Top Story / Hero Carousel */}
            <NewsHero article={topStory} articles={articles} />

            {/* Latest News Grid */}
            <LatestNewsGrid
              articles={remainingArticles}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Side Column */}
          <aside className="space-y-8 sticky top-16">
            {/* Today's E-Paper Showcase Card */}
            <EpaperPreviewCard epaperUrl={epaperUrl} />

            {/* Featured Editorial Section */}
            <div className="border-4 border-neutral-950 bg-white p-5 shadow-[8px_8px_0_#171717] space-y-3">
              <span className="bg-red-800 px-2 py-0.5 text-xs font-black uppercase tracking-widest text-white">
                Featured
              </span>
              <h2 className="font-serif text-2xl font-black text-neutral-950">
                Public Records & Investigations
              </h2>
              <p className="text-xs leading-relaxed font-serif text-neutral-800">
                Public Talk monitors local government actions, court filings, public record requests, and community developments across our distribution region.
              </p>
              <div className="border-t border-neutral-300 pt-3 text-xs font-bold text-neutral-600">
                Independent Editorial Standards
              </div>
            </div>

            {/* Reader Note */}
            <div className="border-4 border-neutral-950 bg-[#171717] p-5 text-white shadow-[8px_8px_0_#171717] space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-400">
                Reader Note
              </p>
              <p className="font-serif text-xl font-black leading-snug">
                "Fresh reporting, clear context, and a dependable daily edition."
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
