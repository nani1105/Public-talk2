import Image from "next/image";
import { getLatestNews } from "@/lib/news";
import EpaperViewer from "@/app/components/EpaperViewer";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));

export default async function Home() {
  const articles = await getLatestNews();
  const epaperUrl = "/api/epaper";

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-neutral-950">
      <header className="border-b-4 border-neutral-950 bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-red-800">
                Independent News Agency
              </p>
              <h1 className="mt-2 font-serif text-5xl font-black leading-none md:text-7xl">
                Public Talk
              </h1>
            </div>
            <div className="max-w-sm border-l-4 border-neutral-950 pl-4 text-sm font-semibold leading-6">
              Daily reporting, public records, local context, and a fresh e-paper edition.
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-neutral-950 pt-4 text-sm font-semibold uppercase tracking-[0.2em]">
            <span>Breaking coverage</span>
            <span>Local voices</span>
            <span>Public records</span>
            <span>Daily e-paper</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
          <section className="space-y-6">
            <div className="border-4 border-neutral-950 bg-white p-5 shadow-[10px_10px_0_#171717] md:p-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-950 pb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    Today&apos;s Edition
                  </p>
                  <h2 className="font-serif text-3xl font-black">Daily E-Paper</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={epaperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center border-2 border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800"
                  >
                    Open PDF
                  </a>
                  <a
                    href={epaperUrl}
                    download="epaper.pdf"
                    className="inline-flex items-center justify-center border-2 border-neutral-950 bg-white px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-stone-100"
                  >
                    Download PDF
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-neutral-200 bg-[#f7f4ed] p-4 md:p-6">
                <EpaperViewer url={epaperUrl} />
              </div>
            </div>

            <div className="border-4 border-neutral-950 bg-[#fbfaf6] p-5 shadow-[8px_8px_0_#171717] md:p-6">
              <div className="mb-4 border-b-2 border-neutral-950 pb-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                  Live Desk
                </p>
                <h2 className="font-serif text-3xl font-black">Latest News</h2>
              </div>
              <div className="space-y-4">
                {articles.length === 0 ? (
                  <div className="border-2 border-dashed border-neutral-500 bg-white p-5 text-sm font-semibold text-neutral-600">
                    No articles published yet.
                  </div>
                ) : (
                  articles.slice(0, 4).map((article) => (
                    <article
                      key={article.id}
                      className="grid gap-4 border-b border-neutral-300 pb-4 last:border-b-0 last:pb-0 md:grid-cols-[140px_1fr]"
                    >
                      {article.image_url ? (
                        <Image
                          src={article.image_url}
                          alt=""
                          width={640}
                          height={360}
                          unoptimized
                          className="h-28 w-full rounded object-cover md:h-24"
                        />
                      ) : (
                        <div className="h-28 rounded bg-neutral-200 md:h-24" />
                      )}
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
                          <span className="bg-red-800 px-2 py-1 text-white">{article.category}</span>
                          <time className="text-neutral-600">{formatDate(article.published_at)}</time>
                        </div>
                        <h3 className="font-serif text-xl font-black leading-tight">
                          {article.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-700">{article.snippet}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="border-4 border-neutral-950 bg-white p-5 shadow-[8px_8px_0_#171717]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                Featured
              </p>
              <h2 className="mt-2 font-serif text-2xl font-black">This Week</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
                <p>Public records, local governance, and community reporting in one place.</p>
                <p>Readers can browse the latest stories or open the daily edition for a traditional newspaper experience.</p>
              </div>
            </div>

            <div className="border-4 border-neutral-950 bg-[#171717] p-5 text-white shadow-[8px_8px_0_#171717]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">
                Reader Notes
              </p>
              <p className="mt-3 font-serif text-2xl font-black leading-tight">
                Fresh reporting, clear context, and a dependable daily edition.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
