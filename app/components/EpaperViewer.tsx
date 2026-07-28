"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Import standard react-pdf styles for correct text & annotation rendering
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure pdfjs worker source using CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type EpaperViewerProps = {
  url: string;
};

export default function EpaperViewer({ url }: EpaperViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading");
  const [containerWidth, setContainerWidth] = useState<number>(600);

  // Measure screen width for responsive mobile rendering
  useEffect(() => {
    const updateWidth = () => {
      const padding = 32; // Screen side paddings
      const calculatedWidth = Math.min(window.innerWidth - padding, 800);
      setContainerWidth(calculatedWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Pre-check if the file exists at the given endpoint
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetch(url, { method: "GET", cache: "no-store" })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 404 || !res.ok) {
          setStatus("empty");
          return;
        }
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("empty");
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center rounded-2xl border-2 border-neutral-200 bg-[#f7f4ed] p-3">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
          <p className="text-sm font-semibold">Loading e-paper…</p>
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-[#f7f4ed] p-6">
        <div className="text-center">
          <p className="font-serif text-xl font-black text-neutral-800">
            No e-paper published yet
          </p>
          <p className="mt-2 text-sm font-medium text-neutral-500">
            The next edition will appear here automatically once it is uploaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-h-[80vh] overflow-y-auto rounded-2xl border-2 border-neutral-200 bg-[#f7f4ed] p-2 sm:p-4">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="p-4 text-sm font-semibold text-neutral-600">
            Rendering pages...
          </div>
        }
        error={
          <div className="p-4 text-sm font-semibold text-red-600">
            Failed to load PDF document.
          </div>
        }
      >
        {numPages &&
          Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={containerWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mb-4 shadow-md rounded-lg overflow-hidden bg-white"
            />
          ))}
      </Document>
    </div>
  );
}