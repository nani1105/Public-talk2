import { readNews, getEpaperUrl } from "@/lib/news";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function snippet(text: string, max = 140) {
  return text.length <= max ? text : `${text.slice(0, max).trim()}…`;
}

export default async function HomePage() {
  const [articles, epaperUrl] = await Promise.all([readNews(), getEpaperUrl()]);

  return (
    <div className="min-h-screen">
      <header className="border-b-4 border-stone-900 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Est. 2026 · Independent Journalism
          </p>
          <h1 className="font-serif mt-2 text-5xl font-black tracking-tight md:text-6xl">
            Public Talk
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Today&apos;s E-Paper</h2>
            {epaperUrl && (
              <a
                href={epaperUrl}
                download="epaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-stone-900 px-4 py-2 text-sm font-medium transition hover:bg-stone-900 hover:text-white"
              >
                Download PDF
              </a>
            )}
          </div>
          <div className="overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm">
            {epaperUrl ? (
              <iframe
                src={epaperUrl}
                title="Daily E-Paper"
                className="h-[80vh] w-full"
              />
            ) : (
              <div className="flex h-[40vh] items-center justify-center text-stone-500">
                No e-paper uploaded yet.
              </div>
            )}
          </div>
        </section>

        <aside>
          <h2 className="font-serif mb-4 text-2xl font-bold">Latest News</h2>
          <div className="space-y-6">
            {articles.length === 0 && (
              <p className="text-stone-500">No articles published yet.</p>
            )}
            {articles.map((article) => (
              <article
                key={article.id}
                className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded bg-stone-900 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                      {article.category}
                    </span>
                    <time className="text-xs text-stone-500">
                      {formatDate(article.publishedAt)}
                    </time>
                  </div>
                  <h3 className="font-serif text-lg font-bold leading-snug">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {snippet(article.body)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} Public Talk. All rights reserved.
      </footer>
    </div>
  );
}
