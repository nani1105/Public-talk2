"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const EpaperPreviewCanvas = dynamic(() => import("./EpaperPreviewCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="h-8 w-8 animate-spin border-4 border-neutral-950 border-t-red-800 rounded-full" />
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
        Loading E-Paper Preview...
      </span>
    </div>
  ),
});

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

      {/* EPAPER FIRST PAGE PREVIEW RECTANGLE */}
      <Link href="/epaper" className="group block" title="Click to view full e-paper reader">
        <div className="relative flex items-center justify-center bg-[#f7f4ed] border-2 border-neutral-950 overflow-hidden min-h-[260px] max-h-[440px] shadow-[4px_4px_0_#171717] transition-all group-hover:border-red-800">
          <EpaperPreviewCanvas epaperUrl={epaperUrl} />
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
