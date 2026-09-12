"use client";

import Link from "next/link";

type EpaperPreviewCardProps = {
  epaperUrl: string;
};

export default function EpaperPreviewCard({ epaperUrl }: EpaperPreviewCardProps) {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
  }).format(new Date());

  return (
    <div className="border-4 border-neutral-950 bg-white p-5 shadow-[10px_10px_0_#171717] md:p-7 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-neutral-950 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-800 px-2 py-0.5 text-xs font-black uppercase tracking-widest text-white">
              TODAY'S EDITION
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Daily Newspaper
            </span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-black text-neutral-950 md:text-4xl">
            Public Talk Daily E-Paper
          </h2>
          <p className="mt-1 text-xs font-bold text-neutral-600 tracking-wide">
            {currentDate}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/epaper"
            className="inline-flex items-center justify-center border-2 border-neutral-950 bg-red-800 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0_#171717] transition hover:bg-neutral-950 hover:translate-x-0.5 hover:translate-y-0.5"
          >
            READ TODAY'S PAPER →
          </Link>
          <a
            href={epaperUrl}
            download="Public_Talk_Epaper.pdf"
            className="inline-flex items-center justify-center border-2 border-neutral-950 bg-white px-4 py-2.5 text-sm font-black uppercase tracking-wider text-neutral-950 shadow-[4px_4px_0_#171717] transition hover:bg-neutral-100"
          >
            DOWNLOAD PDF ⤓
          </a>
        </div>
      </div>

      {/* Interactive E-Paper Showcase Banner */}
      <div className="relative border-2 border-neutral-950 bg-[#f7f4ed] p-6 shadow-[6px_6px_0_#171717] text-center space-y-4">
        <div className="mx-auto max-w-xl space-y-2">
          <p className="font-serif text-xl font-bold text-neutral-900">
            Read the full print edition page-by-page online.
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
            Features high-resolution page rendering, responsive zooming, interactive thumbnail strip, and offline PDF archiving.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/epaper"
            className="inline-block border-2 border-neutral-950 bg-neutral-950 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-red-800 transition"
          >
            Open Interactive E-Paper Viewer →
          </Link>
        </div>
      </div>
    </div>
  );
}
