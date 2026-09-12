import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Navbar from "@/app/components/Navbar";
import BreakingTicker from "@/app/components/BreakingTicker";
import Footer from "@/app/components/Footer";
import { getLatestNews } from "@/lib/news";

export const revalidate = 0;

type ArticlePageProps = {
  params: Promise<{ id: string }>;
};

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

export async function generateMetadata({ params }: ArticlePageProps) {
  const { id } = await params;
  const articles = await getLatestNews();
  const article = articles.find((a) => a.id === id);

  if (!article) {
    return {
      title: "Article Not Found | Public Talk",
    };
  }

  return {
    title: `${article.title} | Public Talk`,
    description: article.snippet || article.body.slice(0, 160),
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const articles = await getLatestNews();
  const article = articles.find((a) => a.id === id);

  if (!article) {
    notFound();
  }

  const relatedArticles = articles.filter((a) => a.id !== id).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-neutral-950">
      <Header />
      <BreakingTicker articles={articles} />
      <Navbar activeCategory={article.category} />

      <article className="mx-auto max-w-4xl px-4 py-8 md:px-8 space-y-8">
        {/* Navigation Back Link */}
        <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 border-2 border-neutral-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-neutral-950 shadow-[4px_4px_0_#171717] hover:bg-neutral-100 transition"
          >
            <span>← Back to Main Website</span>
          </Link>
          <div className="text-xs font-bold uppercase tracking-wider text-red-800">
            Public Talk Editorial Coverage
          </div>
        </div>

        {/* Story Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-red-800 px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-[2px_2px_0_#171717]">
              {article.category}
            </span>
            <time className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Published {formatDate(article.published_at)}
            </time>
          </div>

          <h1 className="font-serif text-4xl font-black leading-tight text-neutral-950 sm:text-5xl md:text-6xl">
            {article.title}
          </h1>

          <div className="flex items-center justify-between border-t-2 border-b-2 border-neutral-950 py-3 text-xs font-bold uppercase tracking-widest text-neutral-700">
            <span>By Public Talk Newsroom Desk</span>
            <span>Independent Public Record</span>
          </div>
        </div>

        {/* Hero Cover Image */}
        {article.image_url ? (
          <div className="relative border-4 border-neutral-950 bg-white shadow-[10px_10px_0_#171717] overflow-hidden">
            <Image
              src={article.image_url}
              alt={article.title}
              width={1200}
              height={675}
              unoptimized
              className="h-80 w-full object-cover sm:h-96 md:h-[450px]"
            />
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center border-4 border-dashed border-neutral-400 bg-white p-8 text-center text-sm font-bold text-neutral-500 shadow-[8px_8px_0_#171717]">
            [ Public Talk Newsroom Editorial Archive Image ]
          </div>
        )}

        {/* Story Body Paragraphs with whitespace-pre-line to preserve all line breaks & paragraphs */}
        <div className="border-4 border-neutral-950 bg-white p-6 shadow-[10px_10px_0_#171717] md:p-10 space-y-6">
          <p className="font-serif text-xl font-bold leading-relaxed text-neutral-900 border-l-4 border-red-800 pl-4 italic">
            "{article.snippet || article.body.slice(0, 180)}"
          </p>

          <div className="font-serif text-lg leading-relaxed text-neutral-800 whitespace-pre-line space-y-4">
            {article.body}
          </div>

          <div className="pt-6 border-t-2 border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider text-neutral-600">
            <span>Verified Reporting · Public Talk Agency</span>
            <Link href="/epaper" className="text-red-800 hover:underline">
              Read Print Replica in Today's E-Paper →
            </Link>
          </div>
        </div>

        {/* RELATED STORIES SECTION */}
        {relatedArticles.length > 0 && (
          <section className="border-4 border-neutral-950 bg-[#fbfaf6] p-6 shadow-[8px_8px_0_#171717] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-3">
              <div>
                <span className="bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                  RECOMMENDED
                </span>
                <h2 className="font-serif text-2xl font-black text-neutral-950">
                  Related Stories
                </h2>
              </div>
              <Link href="/" className="text-xs font-bold uppercase text-red-800 hover:underline">
                All News →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/article/${rel.id}`}
                  className="group flex flex-col justify-between border-2 border-neutral-950 bg-white p-4 shadow-[4px_4px_0_#171717] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_#171717]"
                >
                  <div className="space-y-3">
                    {rel.image_url ? (
                      <div className="h-32 w-full overflow-hidden border border-neutral-300">
                        <Image
                          src={rel.image_url}
                          alt={rel.title}
                          width={400}
                          height={225}
                          unoptimized
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="bg-red-800 px-2 py-0.5 text-[10px] uppercase text-white">
                        {rel.category}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-black leading-snug text-neutral-950 group-hover:text-red-900">
                      {rel.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-200 text-xs font-bold text-red-800">
                    Read Story →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </main>
  );
}
