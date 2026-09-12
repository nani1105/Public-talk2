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
    <div className="border-4 border-neutral-950 bg-white p-4 shadow-[8px_8px_0_#171717] space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-neutral-950 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
              TODAY'S EDITION
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Print Replica
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-black text-neutral-950">
            Public Talk E-Paper
          </h2>
          <p className="text-[11px] font-bold text-neutral-600">{currentDate}</p>
        </div>

        <Link
          href="/epaper"
          className="inline-flex items-center justify-center border-2 border-neutral-950 bg-red-800 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0_#171717] hover:bg-neutral-950 transition"
        >
          Read E-Paper →
        </Link>
      </div>

      {/* Static Visual Preview Panel — no PDF rendering on homepage for speed */}
      <Link href="/epaper" className="group block">
        <div className="relative flex items-center justify-center bg-[#f7f4ed] border-2 border-neutral-950 overflow-hidden h-48 shadow-[4px_4px_0_#171717]">
          {/* Decorative newspaper-style lines */}
          <div className="absolute inset-0 flex flex-col p-4 gap-2 pointer-events-none opacity-20">
            <div className="h-5 w-3/4 bg-neutral-900 rounded-sm" />
            <div className="h-2 w-full bg-neutral-700 rounded-sm" />
            <div className="h-2 w-5/6 bg-neutral-700 rounded-sm" />
            <div className="h-2 w-full bg-neutral-700 rounded-sm" />
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="space-y-1">
                <div className="h-12 w-full bg-neutral-500 rounded-sm" />
                <div className="h-2 w-full bg-neutral-700 rounded-sm" />
                <div className="h-2 w-4/5 bg-neutral-700 rounded-sm" />
              </div>
              <div className="space-y-1">
                <div className="h-12 w-full bg-neutral-500 rounded-sm" />
                <div className="h-2 w-full bg-neutral-700 rounded-sm" />
                <div className="h-2 w-3/4 bg-neutral-700 rounded-sm" />
              </div>
            </div>
          </div>
          {/* CTA Overlay */}
          <div className="relative z-10 text-center space-y-2 px-4">
            <div className="text-4xl">📰</div>
            <p className="font-serif text-lg font-black text-neutral-900 leading-tight">
              Open Today's Edition
            </p>
            <span className="inline-block border-2 border-neutral-950 bg-neutral-950 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white group-hover:bg-red-800 transition">
              Open E-Paper Reader →
            </span>
          </div>
        </div>
      </Link>

      {/* Download Action */}
      <div className="pt-1 flex justify-between items-center text-xs font-bold text-neutral-700">
        <a
          href={epaperUrl}
          download="Public_Talk_Epaper.pdf"
          className="text-neutral-950 underline hover:text-red-800"
        >
          Download PDF Edition ⤓
        </a>
        <span className="text-[10px] uppercase text-neutral-500 font-mono">High Resolution</span>
      </div>
    </div>
  );
}
