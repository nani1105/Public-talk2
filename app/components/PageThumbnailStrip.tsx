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
    <div className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col justify-between p-2">
      <div className="mb-3 flex items-center justify-between border-b border-neutral-300 pb-2 px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-800">
          Pages Preview
        </span>
        <span className="text-[10px] font-mono font-bold text-red-800">
          {currentPage} / {numPages}
        </span>
      </div>

      <Document file={url} loading={null} error={null}>
        <div
          ref={containerRef}
          className="flex flex-col items-center gap-3 overflow-y-auto max-h-[780px] p-1 scrollbar-thin scrollbar-thumb-neutral-400"
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
                className={`group flex flex-col items-center cursor-pointer transition-all p-1 rounded ${
                  isActive ? "scale-[1.03] opacity-100" : "opacity-80 hover:opacity-100"
                }`}
              >
                {/* Clean Miniature Page Render - Outer heavy rectangle removed */}
                <div
                  className={`overflow-hidden bg-white transition-all ${
                    isActive
                      ? "border-2 border-red-800 shadow-md ring-2 ring-red-800/30"
                      : "border border-neutral-300 group-hover:border-neutral-700 shadow-sm"
                  }`}
                >
                  <Page
                    pageNumber={pageNum}
                    width={110}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>

                {/* Page Number Label in Small Font */}
                <span
                  className={`mt-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? "text-red-800 font-black" : "text-neutral-600 group-hover:text-neutral-900"
                  }`}
                >
                  Page {pageNum}
                </span>
              </button>
            );
          })}
        </div>
      </Document>
    </div>
  );
}
