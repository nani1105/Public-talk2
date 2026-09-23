import Link from "next/link";
import { getLatestNews } from "@/lib/news";
import BreakingTicker from "@/app/components/BreakingTicker";
import EpaperViewerWrapper from "@/app/components/EpaperViewerWrapper";
import MoreNews from "@/app/components/MoreNews";
import Footer from "@/app/components/Footer";

export const revalidate = 30;

export const metadata = {
  title: "Public Talk Daily E-Paper | Today's Edition",
  description: "Browse today's official digital newspaper edition of Public Talk.",
};

export default async function EpaperPage() {
  const articles = await getLatestNews();
  const epaperUrl = "/api/epaper";

  const editionDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-neutral-950">
      {/* SLIDING BREAKING NEWS TICKER */}
      <BreakingTicker articles={articles} />

      {/* EPAPER HEADER */}
      <header className="border-b-4 border-neutral-950 bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-red-800">
                Daily Digital Reader
              </p>
              <h1 className="font-serif text-4xl font-black md:text-6xl text-neutral-950">
                Public Talk E-Paper
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right text-xs font-bold uppercase text-neutral-700">
                <div>Published Daily</div>
                <div className="text-neutral-950">{editionDate}</div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 border-2 border-neutral-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-neutral-950 shadow-[4px_4px_0_#171717] hover:bg-neutral-100 transition"
              >
                <span>Main Website</span>
                <span>↗</span>
              </Link>
            </div>
          </div>

          {/* Edition Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-neutral-950 pt-4 text-xs font-black uppercase tracking-[0.18em]">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="border-2 border-transparent px-3 py-1.5 text-neutral-700 hover:border-neutral-950 hover:bg-white transition"
              >
                HOME
              </Link>
              <span className="border-2 border-neutral-950 bg-neutral-950 px-3 py-1.5 text-white">
                MAIN EDITION
              </span>
              <span
                className="border-2 border-neutral-300 px-3 py-1.5 text-neutral-400 cursor-not-allowed"
                title="Single edition format current active"
              >
                TABLOID
              </span>
              <a
                href="#archive"
                className="border-2 border-neutral-950 bg-white px-3 py-1.5 text-neutral-950 hover:bg-neutral-100 transition shadow-[2px_2px_0_#171717]"
              >
                ARCHIVE
              </a>
            </div>

            <div className="text-xs font-mono font-bold text-red-800">
              ● Official Digital Publication
            </div>
          </div>
        </div>
      </header>

      {/* MAIN READER CONTAINER */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-8">
        {/* Edition Summary Bar */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-4 border-2 border-neutral-950 bg-white p-4 shadow-[6px_6px_0_#171717]">
          <div>
            <span className="bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase text-white">
              Current Live Issue
            </span>
            <h2 className="font-serif text-2xl font-black text-neutral-950 mt-1">
              National Daily Print Replica
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={epaperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-neutral-950 bg-neutral-950 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-red-800 transition"
            >
              Open Native PDF ↗
            </a>
            <a
              href={epaperUrl}
              download="Public_Talk_Daily_Edition.pdf"
              className="border-2 border-neutral-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-neutral-950 hover:bg-neutral-100 transition shadow-[2px_2px_0_#171717]"
            >
              Download PDF ⤓
            </a>
          </div>
        </div>

        {/* REACT EPAPER VIEWER & THUMBNAILS */}
        <EpaperViewerWrapper url={epaperUrl} showThumbnails={true} />

        {/* EDITION ARCHIVE SECTION */}
        <section id="archive" className="border-4 border-neutral-950 bg-white p-6 shadow-[8px_8px_0_#171717] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-950 pb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-800">
                Digital Library
              </p>
              <h2 className="font-serif text-2xl font-black text-neutral-950">
                Previous Editions & Archive
              </h2>
            </div>
            <span className="text-xs font-bold uppercase text-neutral-500">
              Updated Daily
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="border-2 border-neutral-950 bg-[#f7f4ed] p-4 shadow-[4px_4px_0_#171717] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-red-800">
                <span>TODAY'S EDITION</span>
                <span>LIVE</span>
              </div>
              <p className="font-serif text-lg font-black text-neutral-950">{editionDate}</p>
              <p className="text-xs font-medium text-neutral-600">Daily Newspaper · Main Edition</p>
              <a
                href={epaperUrl}
                className="inline-block pt-2 text-xs font-black uppercase text-neutral-950 hover:text-red-800 underline"
              >
                Read Edition →
              </a>
            </div>

            <div className="border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 space-y-2">
              <span className="text-xs font-bold text-neutral-400 uppercase">Archive Note</span>
              <p className="font-serif text-sm font-bold text-neutral-600">
                New editions are archived automatically upon daily admin publishing.
              </p>
            </div>
          </div>
        </section>

        {/* MORE NEWS FROM PUBLIC TALK */}
        <MoreNews articles={articles} />
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
