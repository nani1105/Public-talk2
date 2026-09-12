"use client";

import { useRef, useEffect, useState } from "react";
import { Document, Page } from "react-pdf";

type PageThumbnailStripProps = {
  url: string;
  numPages: number;
  currentPage: number;
  onSelectPage: (page: number) => void;
};

/** Renders a single thumbnail lazily via IntersectionObserver */
function LazyThumb({
  url,
  pageNum,
  isActive,
  onSelect,
  btnRef,
}: {
  url: string;
  pageNum: number;
  isActive: boolean;
  onSelect: () => void;
  btnRef?: React.Ref<HTMLButtonElement>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(isActive); // active page always loads immediately

  useEffect(() => {
    if (visible) return;
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onSelect}
      className={`group flex flex-col items-center cursor-pointer transition-all p-1 ${
        isActive ? "scale-[1.03] opacity-100" : "opacity-75 hover:opacity-100"
      }`}
    >
      <div
        ref={wrapRef}
        className={`overflow-hidden bg-white transition-all ${
          isActive
            ? "border-2 border-red-800 shadow-md ring-2 ring-red-800/30"
            : "border border-neutral-300 group-hover:border-neutral-700 shadow-sm"
        }`}
        style={{ width: 110, minHeight: 150 }}
      >
        {visible ? (
          <Document file={url} loading={null} error={null}>
            <Page
              pageNumber={pageNum}
              width={110}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        ) : (
          /* Skeleton placeholder while off-screen */
          <div className="w-[110px] h-[150px] bg-neutral-100 animate-pulse" />
        )}
      </div>

      <span
        className={`mt-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
          isActive ? "text-red-800" : "text-neutral-500 group-hover:text-neutral-900"
        }`}
      >
        Page {pageNum}
      </span>
    </button>
  );
}

export default function PageThumbnailStrip({
  url,
  numPages,
  currentPage,
  onSelectPage,
}: PageThumbnailStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  // Scroll active thumbnail into view smoothly
  useEffect(() => {
    if (activeThumbnailRef.current && containerRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentPage]);

  if (!numPages || numPages <= 0) return null;

  return (
    <div className="hidden md:flex w-56 lg:w-64 shrink-0 flex-col p-2">
      <div className="mb-3 flex items-center justify-between border-b border-neutral-300 pb-2 px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-800">
          Pages
        </span>
        <span className="text-[10px] font-mono font-bold text-red-800">
          {currentPage} / {numPages}
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex flex-col items-center gap-3 overflow-y-auto max-h-[760px] p-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {Array.from({ length: numPages }, (_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === currentPage;
          return (
            <LazyThumb
              key={pageNum}
              url={url}
              pageNum={pageNum}
              isActive={isActive}
              onSelect={() => onSelectPage(pageNum)}
              btnRef={isActive ? activeThumbnailRef : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
