"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="border-b-4 border-neutral-950 bg-[#fbfaf6]">
      {/* Top Utility Bar */}
      <div className="border-b border-neutral-300 bg-[#f4efe4] px-4 py-1.5 text-xs font-semibold text-neutral-700">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-block bg-red-800 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Live Edition
            </span>
            <time className="tracking-wide">{formattedDate}</time>
          </div>
          <div className="flex items-center gap-4 text-neutral-800">
            <span>Edition: <strong className="text-neutral-950">Daily National</strong></span>
            <Link
              href="/admin"
              className="text-red-900 font-bold hover:underline"
            >
              Staff Portal ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Main Masthead Container */}
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Main Title & Tagline */}
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-800">
              Independent News Agency
            </p>
            <Link href="/" className="inline-block group">
              <h1 className="font-serif text-5xl font-black leading-none text-neutral-950 transition-colors group-hover:text-red-900 sm:text-6xl md:text-7xl lg:text-8xl">
                Public Talk
              </h1>
            </Link>
          </div>

          {/* Newspaper Editorial Sidebox */}
          <div className="flex flex-col justify-between border-l-4 border-neutral-950 pl-4 py-1 text-sm font-semibold text-neutral-800 max-w-xs">
            <div className="space-y-1">
              <Link
                href="/epaper"
                className="inline-flex items-center justify-center gap-1 bg-red-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-900 transition shadow-[2px_2px_0_#171717]"
              >
                <span>Read E-Paper</span>
                <span>→</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="border border-neutral-950 bg-white px-2.5 py-1 text-xs font-bold uppercase text-neutral-900 hover:bg-neutral-100"
              >
                {showSearch ? "Close Search" : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar expandable */}
        {showSearch && (
          <div className="mt-2 border-2 border-neutral-950 bg-white p-2 shadow-[4px_4px_0_#171717]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Search articles, topics, public records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-medium text-neutral-900 outline-none"
              />
              <button
                type="submit"
                className="bg-neutral-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-800 transition"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
