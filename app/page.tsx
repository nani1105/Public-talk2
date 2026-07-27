import Image from "next/image";
import { getLatestNews } from "@/lib/news";

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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 md:px-8">
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
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[2fr_1fr] md:px-8">
        <section>
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
          <div className="flex h-[70vh] min-h-[520px] items-center justify-center overflow-hidden border-4 border-neutral-950 bg-white shadow-[8px_8px_0_#171717] p-4">
            <object data={epaperUrl} type="application/pdf" className="h-full w-full">
              <div className="flex max-w-md flex-col items-start gap-3 text-left">
                <p className="text-sm font-semibold text-neutral-700">
                  Your browser could not render the PDF inline. Open it directly to view or download it.
                </p>
                <a
                  href={epaperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center border-2 border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800"
                >
                  Open PDF in Browser
                </a>
              </div>
            </object>
          </div>
        </section>

        <aside>
          <div className="mb-4 border-b-2 border-neutral-950 pb-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
              Live Desk
            </p>
            <h2 className="font-serif text-3xl font-black">Latest News</h2>
          </div>
          <div className="space-y-5">
            {articles.length === 0 ? (
              <div className="border-2 border-dashed border-neutral-500 bg-white p-5 text-sm font-semibold text-neutral-600">
                No articles published yet.
              </div>
            ) : (
              articles.map((article) => (
                <article
                  key={article.id}
                  className="border-2 border-neutral-950 bg-[#fbfaf6] shadow-[5px_5px_0_#171717]"
                >
                  {article.image_url ? (
                    <Image
                      src={article.image_url}
                      alt=""
                      width={640}
                      height={360}
                      unoptimized
                      className="h-44 w-full object-cover"
                    />
                  ) : null}
                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
                      <span className="bg-red-800 px-2 py-1 text-white">{article.category}</span>
                      <time className="text-neutral-600">{formatDate(article.published_at)}</time>
                    </div>
                    <h3 className="font-serif text-2xl font-black leading-tight">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">{article.snippet}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
