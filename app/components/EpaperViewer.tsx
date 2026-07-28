"use client";

import { useEffect, useState } from "react";

type EpaperViewerProps = {
  url: string;
};

/**
 * Reliable, free, mobile-friendly PDF viewer.
 *
 * Uses an <iframe> pointing at our own /api/epaper route, which serves the
 * PDF bytes with `Content-Disposition: inline`. Same-origin inline PDFs render
 * reliably in mobile browsers (iOS Safari uses its native Quick Look viewer,
 * Android Chrome uses the built-in PDF renderer). No external CDN worker,
 * no JS bundle, no fake-worker errors.
 *
 * A lightweight availability check pings the URL first so we can show a
 * friendly empty state instead of a blank iframe when no edition exists yet.
 */
export default function EpaperViewer({ url }: EpaperViewerProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading");

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
    <div className="w-full overflow-hidden rounded-2xl border-2 border-neutral-200 bg-[#f7f4ed] p-1 sm:p-3">
      <iframe
        src={url}
        title="Daily E-Paper"
        className="h-[70vh] min-h-[520px] w-full rounded-xl border-0 bg-white"
        loading="lazy"
        allow="fullscreen"
      />
    </div>
  );
}
