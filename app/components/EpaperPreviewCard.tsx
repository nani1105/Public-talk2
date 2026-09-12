"use client";

import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";

// Configure worker URL using local worker file
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

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
          <p className="text-[11px] font-bold text-neutral-600">
            {currentDate}
          </p>
        </div>

        <Link
          href="/epaper"
          className="inline-flex items-center justify-center border-2 border-neutral-950 bg-red-800 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0_#171717] hover:bg-neutral-950 transition"
        >
          Read E-Paper →
        </Link>
      </div>

      {/* Large Live Cover Preview Render inside Compact Container */}
      <Link href="/epaper" className="group block relative border-2 border-neutral-950 bg-[#f7f4ed] p-3 shadow-[4px_4px_0_#171717]">
        <div className="flex justify-center overflow-hidden bg-white border-2 border-neutral-950 shadow-md">
          <Document file={epaperUrl} loading={<div className="p-8 text-xs font-bold text-neutral-500">Loading cover...</div>} error={null}>
            <Page
              pageNumber={1}
              width={340}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="transition-transform duration-300 group-hover:scale-102"
            />
          </Document>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-black text-neutral-950 border-t border-neutral-300 pt-2">
          <span>PAGE 01 COVER PREVIEW</span>
          <span className="text-red-800 group-hover:underline">OPEN READER →</span>
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
