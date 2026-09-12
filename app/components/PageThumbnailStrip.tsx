"use client";

import { useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";

type PageThumbnailStripProps = {
  url: string;
  numPages: number;
  currentPage: number;
  onSelectPage: (page: number) => void;
};

export default function PageThumbnailStrip({
  url,
  numPages,
  currentPage,
  onSelectPage,
}: PageThumbnailStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  // Scroll active thumbnail into view smoothly when currentPage changes
  useEffect(() => {
    if (activeThumbnailRef.current && containerRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentPage]);

  if (!numPages || numPages <= 0) return null;

  return (
    <div className="w-full md:w-64 lg:w-72 shrink-0 border-4 border-neutral-950 bg-white p-3 shadow-[6px_6px_0_#171717] flex flex-col justify-between">
      <div className="mb-3 flex items-center justify-between border-b-2 border-neutral-950 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase text-white">
            PAGES
          </span>
          <span className="text-xs font-black text-neutral-950 uppercase tracking-wide">
            Select Page
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-red-800">
          {currentPage} / {numPages}
        </span>
      </div>

      <Document file={url} loading={null} error={null}>
        <div
          ref={containerRef}
          className="flex md:flex-col items-center gap-3 overflow-x-auto md:overflow-y-auto max-h-[350px] md:max-h-[750px] p-1 scrollbar-thin scrollbar-thumb-neutral-400"
          style={{ scrollBehavior: "smooth" }}
        >
          {Array.from({ length: numPages }, (_, index) => {
            const pageNum = index + 1;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`thumb_${pageNum}`}
                ref={isActive ? activeThumbnailRef : null}
                type="button"
                onClick={() => onSelectPage(pageNum)}
                className={`group relative flex md:flex-row flex-col items-center justify-between w-full shrink-0 border-2 transition-all p-2 bg-[#f7f4ed] ${
                  isActive
                    ? "border-red-800 ring-2 ring-red-800 scale-[1.02] shadow-[3px_3px_0_#991b1b]"
                    : "border-neutral-950 hover:border-neutral-700 hover:shadow-[3px_3px_0_#171717]"
                }`}
              >
                {/* Visual Miniature PDF Page Render */}
                <div className="h-28 w-20 overflow-hidden bg-white border border-neutral-300 shrink-0 flex items-center justify-center">
                  <Page
                    pageNumber={pageNum}
                    width={75}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>

                {/* Page Number Label */}
                <div
                  className={`mt-1 md:mt-0 w-full md:w-auto px-2.5 py-1 text-center font-mono text-[11px] font-black uppercase ${
                    isActive ? "bg-red-800 text-white" : "bg-neutral-950 text-white group-hover:bg-neutral-800"
                  }`}
                >
                  Pg {String(pageNum).padStart(2, "0")}
                </div>
              </button>
            );
          })}
        </div>
      </Document>
    </div>
  );
}
