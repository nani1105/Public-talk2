"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import PageThumbnailStrip from "./PageThumbnailStrip";

// Standard react-pdf layer styles
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker URL using local worker file
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

type EpaperViewerProps = {
  url: string;
  showThumbnails?: boolean;
};

export default function EpaperViewer({ url, showThumbnails = true }: EpaperViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);
  const [baseWidth, setBaseWidth] = useState<number>(950);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Drag-to-pan & touch gesture state
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Responsive container width calculation (fit screen width cleanly on mobile)
  const updateBaseWidth = useCallback(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    if (viewerContainerRef.current) {
      const containerW = viewerContainerRef.current.clientWidth;
      const availableW = isMobile ? Math.max(260, containerW - 12) : Math.max(280, containerW - 300);
      setBaseWidth(Math.min(availableW, 1100));
    } else if (typeof window !== "undefined") {
      const screenW = window.innerWidth;
      const availableW = isMobile ? screenW - 16 : screenW - 300;
      setBaseWidth(Math.min(availableW, 1100));
    }

    if (isMobile) {
      setScale(1.0);
    }
  }, []);

  useEffect(() => {
    updateBaseWidth();
    window.addEventListener("resize", updateBaseWidth);
    return () => window.removeEventListener("resize", updateBaseWidth);
  }, [updateBaseWidth]);

  // Page navigation
  const changePage = (offset: number) => {
    setPageNumber((prev) => {
      const newPage = prev + offset;
      return numPages ? Math.min(Math.max(newPage, 1), numPages) : prev;
    });
    setPanPosition({ x: 0, y: 0 });
  };

  const goToPage = (page: number) => {
    if (numPages && page >= 1 && page <= numPages) {
      setPageNumber(page);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  // Zoom controls
  const handleZoomIn = () => setScale((s) => Math.min(Number((s + 0.2).toFixed(1)), 3.0));
  const handleZoomOut = () => setScale((s) => Math.max(Number((s - 0.2).toFixed(1)), 0.6));
  const handleResetZoom = () => {
    setScale(1.1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Gesture Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPanPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Wheel Zoom Listener
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) handleZoomIn();
      else handleZoomOut();
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Share functionality
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Public Talk Daily E-Paper",
          text: `Check out today's e-paper edition page ${pageNumber}!`,
          url: shareUrl,
        });
      } catch {
        copyLink(shareUrl);
      }
    } else {
      copyLink(shareUrl);
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const computedWidth = Math.round(baseWidth * scale);

  return (
    <div
      ref={viewerContainerRef}
      className={`flex flex-col items-center w-full bg-[#f7f4ed] ${
        isFullscreen ? "fixed inset-0 z-50 p-4 overflow-y-auto bg-[#171717]" : "space-y-4"
      }`}
    >
      {/* PROFESSIONAL TOOLBAR */}
      <div className="hidden md:block w-full border-4 border-neutral-950 bg-white p-3 shadow-[6px_6px_0_#171717]">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-neutral-950">
          {/* Left: Page Nav & Indicator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageNumber <= 1 || !numPages}
              onClick={() => changePage(-1)}
              className="border-2 border-neutral-950 bg-[#171717] px-3 py-1.5 font-black uppercase text-white shadow-[2px_2px_0_#171717] disabled:opacity-30 hover:bg-red-800 transition active:translate-x-0.5 active:translate-y-0.5"
              title="Previous Page"
            >
              ‹ Prev
            </button>

            <div className="flex items-center gap-1.5 border-2 border-neutral-950 bg-[#f7f4ed] px-3 py-1 font-mono font-black">
              <span>Page</span>
              <input
                type="number"
                min={1}
                max={numPages || 1}
                value={pageNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) goToPage(val);
                }}
                className="w-10 text-center font-bold outline-none bg-white border border-neutral-400"
              />
              <span>of {numPages ?? "..."}</span>
            </div>

            <button
              type="button"
              disabled={!numPages || pageNumber >= numPages}
              onClick={() => changePage(1)}
              className="border-2 border-neutral-950 bg-[#171717] px-3 py-1.5 font-black uppercase text-white shadow-[2px_2px_0_#171717] disabled:opacity-30 hover:bg-red-800 transition active:translate-x-0.5 active:translate-y-0.5"
              title="Next Page"
            >
              Next ›
            </button>
          </div>

          {/* Center: Zoom Controls */}
          <div className="flex items-center gap-1.5 border-2 border-neutral-950 bg-white p-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.6}
              className="border border-neutral-300 bg-neutral-100 px-2 py-1 hover:bg-neutral-200 disabled:opacity-30"
              title="Zoom Out"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 font-mono hover:underline"
              title="Reset Zoom & Pan"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
              className="border border-neutral-300 bg-neutral-100 px-2 py-1 hover:bg-neutral-200 disabled:opacity-30"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={updateBaseWidth}
              className="ml-1 border border-neutral-950 bg-neutral-900 px-2 py-1 text-[11px] uppercase font-bold text-white hover:bg-red-800"
              title="Fit Page Width"
            >
              Fit Width
            </button>
          </div>

          {/* Right: Actions (Fullscreen, Download, Share) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="border-2 border-neutral-950 bg-white px-3 py-1.5 uppercase font-black hover:bg-neutral-100 shadow-[2px_2px_0_#171717]"
            >
              {isFullscreen ? "Exit Fullscreen ⤚" : "Fullscreen ⤢"}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="border-2 border-neutral-950 bg-white px-3 py-1.5 uppercase font-black hover:bg-neutral-100 shadow-[2px_2px_0_#171717]"
            >
              {copiedShare ? "Link Copied! ✓" : "Share 🔗"}
            </button>

            <a
              href={url}
              download="Public_Talk_Epaper.pdf"
              className="border-2 border-neutral-950 bg-red-800 px-3 py-1.5 uppercase font-black text-white hover:bg-neutral-950 shadow-[2px_2px_0_#171717] transition"
            >
              Download PDF ⤓
            </a>
          </div>
        </div>
      </div>

      {/* 2-COLUMN READER CONTAINER: MAIN VIEWER ON LEFT, PAGE SLIDER PANEL ON RIGHT */}
      <div className="w-full flex flex-col md:flex-row gap-4 items-start">
        {/* PDF DOCUMENT DISPLAY AREA WITH MOUSE DRAG & TOUCH PAN GESTURES */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className={`relative flex-1 w-full flex justify-center items-start overflow-hidden min-h-[500px] border-4 border-neutral-950 bg-[#e8e3d8] p-2 md:p-4 shadow-[8px_8px_0_#171717] select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* FLOATING SEMI-TRANSPARENT MIDDLE LEFT & RIGHT PAGE NAVIGATION BUTTONS */}
          {numPages && numPages > 1 && (
            <>
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={(e) => {
                  e.stopPropagation();
                  changePage(-1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/50 hover:bg-black/80 text-white text-2xl font-black shadow-2xl backdrop-blur-md border border-white/40 disabled:opacity-0 transition active:scale-90 cursor-pointer"
                title="Previous Page (గత పేజీ)"
              >
                ‹
              </button>

              <button
                type="button"
                disabled={pageNumber >= numPages}
                onClick={(e) => {
                  e.stopPropagation();
                  changePage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/50 hover:bg-black/80 text-white text-2xl font-black shadow-2xl backdrop-blur-md border border-white/40 disabled:opacity-0 transition active:scale-90 cursor-pointer"
                title="Next Page (తరువాతి పేజీ)"
              >
                ›
              </button>
            </>
          )}
          <Document
            key={`pdf_doc_${retryKey}`}
            file={url}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setPageNumber(1);
              setLoadError(false);
            }}
            onLoadError={(err) => {
              console.error("[EpaperViewer] Failed to load PDF:", err);
              setLoadError(true);
            }}
            loading={
              <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <div className="h-10 w-10 animate-spin border-4 border-neutral-950 border-t-red-800 rounded-full" />
                <p className="font-serif text-lg font-bold text-neutral-800">
                  Loading today's edition...
                </p>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                  Public Talk E-Paper Reader
                </p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md">
                <div className="border-4 border-red-800 bg-red-50 p-4 text-red-800 font-serif text-2xl font-black">
                  Edition Unavailable
                </div>
                <p className="text-sm font-bold text-neutral-800">
                  Today's edition hasn't been published yet or could not be loaded.
                </p>
                <button
                  type="button"
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="border-2 border-neutral-950 bg-neutral-950 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-red-800 transition shadow-[4px_4px_0_#991b1b]"
                >
                  Retry Loading
                </button>
              </div>
            }
          >
            {!loadError && (
              <div
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                }}
              >
                <Page
                  key={`page_${pageNumber}_scale_${scale}`}
                  pageNumber={pageNumber}
                  width={computedWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-2xl border-2 border-neutral-950"
                />
              </div>
            )}
          </Document>
        </div>

        {/* RIGHT SIDEBAR: PAGE THUMBNAILS PANEL */}
        {showThumbnails && numPages && numPages > 0 && !loadError && (
          <PageThumbnailStrip
            url={url}
            numPages={numPages}
            currentPage={pageNumber}
            onSelectPage={goToPage}
          />
        )}
      </div>
    </div>
  );
}