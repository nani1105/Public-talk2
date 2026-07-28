"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Import standard react-pdf styles for correct layer rendering
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF worker using CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type EpaperViewerProps = {
  url: string;
};

export default function EpaperViewer({ url }: EpaperViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  // Responsive width calculation for mobile screens
  useEffect(() => {
    const updateWidth = () => {
      const padding = 32;
      const calculatedWidth = Math.min(window.innerWidth - padding, 800);
      setContainerWidth(calculatedWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Handle page navigation
  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset;
      return numPages ? Math.min(Math.max(newPage, 1), numPages) : prevPageNumber;
    });
  };

  return (
    <div className="flex flex-col items-center w-full rounded-2xl border-2 border-neutral-200 bg-[#f7f4ed] p-2 sm:p-4">
      {/* Navigation Toolbar */}
      {numPages && (
        <div className="mb-4 flex items-center justify-between w-full max-w-md bg-white p-2 rounded-xl border border-neutral-300 shadow-sm">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
            className="px-4 py-1.5 text-sm font-bold bg-neutral-900 text-white rounded-lg disabled:opacity-30 hover:bg-red-800 transition active:scale-95"
          >
            ← Prev
          </button>
          
          <span className="text-sm font-bold text-neutral-800 select-none">
            Page {pageNumber} of {numPages}
          </span>

          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => changePage(1)}
            className="px-4 py-1.5 text-sm font-bold bg-neutral-900 text-white rounded-lg disabled:opacity-30 hover:bg-red-800 transition active:scale-95"
          >
            Next →
          </button>
        </div>
      )}

      {/* PDF Document Container */}
      <div className="flex justify-center w-full overflow-x-auto min-h-[450px]">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setPageNumber(1);
          }}
          loading={
            <div className="flex items-center justify-center p-12 text-sm font-semibold text-neutral-600">
              Loading e-paper...
            </div>
          }
          error={
            <div className="flex items-center justify-center p-12 text-sm font-semibold text-red-600">
              Failed to load e-paper edition.
            </div>
          }
        >
          <Page
            key={`page_${pageNumber}`}
            pageNumber={pageNumber}
            width={containerWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg rounded-lg overflow-hidden bg-white"
          />
        </Document>
      </div>
    </div>
  );
}