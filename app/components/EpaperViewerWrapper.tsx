"use client";

import dynamic from "next/dynamic";

// EpaperViewer uses react-pdf which requires browser DOM APIs (DOMMatrix, canvas, etc.)
// It must NEVER render on the server — ssr: false prevents the prerender crash.
const EpaperViewer = dynamic(() => import("./EpaperViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[600px] border-4 border-neutral-950 bg-[#e8e3d8] p-8 shadow-[8px_8px_0_#171717] space-y-4 w-full">
      <div className="h-10 w-10 animate-spin border-4 border-neutral-950 border-t-red-800 rounded-full" />
      <p className="font-serif text-lg font-bold text-neutral-800">
        Loading today&apos;s edition...
      </p>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
        Public Talk E-Paper Reader
      </p>
    </div>
  ),
});

type Props = {
  url: string;
  showThumbnails?: boolean;
};

export default function EpaperViewerWrapper({ url, showThumbnails = true }: Props) {
  return <EpaperViewer url={url} showThumbnails={showThumbnails} />;
}
