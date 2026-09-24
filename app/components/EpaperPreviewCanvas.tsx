"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

type Props = {
  epaperUrl: string;
};

export default function EpaperPreviewCanvas({ epaperUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(340);
  const [loadError, setLoadError] = useState<boolean>(false);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setContainerWidth(Math.min(width - 8, 440));
        }
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="text-4xl">📰</div>
        <p className="font-serif text-lg font-black text-neutral-900 leading-tight">
          Open Today's Edition
        </p>
        <span className="inline-block border-2 border-neutral-950 bg-red-800 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0_#171717]">
          READ E-PAPER →
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full flex justify-center overflow-hidden py-1 relative">
      {/* PDF DOCUMENT PAGE 1 WITH BLUR FILTER */}
      <div className="filter blur-[2.5px] scale-[1.01] transition-transform duration-300 group-hover:scale-105">
        <Document
          file={epaperUrl}
          onLoadError={(err) => {
            console.error("[EpaperPreviewCanvas] PDF load error:", err);
            setLoadError(true);
          }}
          loading={
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="h-8 w-8 animate-spin border-4 border-neutral-950 border-t-red-800 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Loading E-Paper Preview...
              </span>
            </div>
          }
        >
          <Page
            pageNumber={1}
            width={containerWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-md border border-neutral-300"
          />
        </Document>
      </div>

      {/* BLUR BACKDROP & PROMINENT CENTER "READ E-PAPER" BUTTON */}
      <div className="absolute inset-0 bg-neutral-950/30 backdrop-blur-[3px] flex items-center justify-center p-4 transition-all duration-300 group-hover:bg-neutral-950/40">
        <div className="border-2 border-white bg-red-800 px-6 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0_#171717] group-hover:bg-neutral-950 group-hover:scale-105 transition-all duration-200 flex items-center gap-2">
          <span className="text-base">📰</span>
          <span>READ E-PAPER →</span>
        </div>
      </div>
    </div>
  );
}
