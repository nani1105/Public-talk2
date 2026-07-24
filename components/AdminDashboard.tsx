"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { NEWS_CATEGORIES, type NewsArticle } from "@/types/news";

type Feedback = {
  type: "success" | "error";
  text: string;
};

type AdminDashboardProps = {
  initialArticles: NewsArticle[];
};

export function AdminDashboard({ initialArticles }: AdminDashboardProps) {
  const [epaperFeedback, setEpaperFeedback] = useState<Feedback | null>(null);
  const [newsFeedback, setNewsFeedback] = useState<Feedback | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<Feedback | null>(null);
  const [articles, setArticles] = useState(initialArticles);
  const [isUploadingEpaper, setIsUploadingEpaper] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);

  const uploadEpaper = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setEpaperFeedback(null);
    setIsUploadingEpaper(true);

    const response = await fetch("/api/admin/epaper", {
      method: "POST",
      body: new FormData(form)
    });

    setIsUploadingEpaper(false);
    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setEpaperFeedback({ type: "error", text: data?.error ?? "PDF upload failed." });
      return;
    }

    form.reset();
    setEpaperFeedback({ type: "success", text: "Daily e-paper updated successfully." });
  };

  const publishNews = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setNewsFeedback(null);
    setIsPublishing(true);

    const response = await fetch("/api/admin/news", {
      method: "POST",
      body: new FormData(form)
    });

    setIsPublishing(false);
    const data = (await response.json().catch(() => null)) as
      | { article?: NewsArticle; error?: string }
      | null;

    if (!response.ok) {
      setNewsFeedback({ type: "error", text: data?.error ?? "Publishing failed." });
      return;
    }

    form.reset();
    if (data?.article) {
      setArticles((currentArticles) => [data.article as NewsArticle, ...currentArticles]);
    }
    setNewsFeedback({ type: "success", text: "Article published successfully." });
  };

  const deleteArticle = async (articleId: string) => {
    const shouldDelete = window.confirm("Remove this post permanently?");

    if (!shouldDelete) {
      return;
    }

    setDeleteFeedback(null);
    setDeletingArticleId(articleId);

    const response = await fetch(`/api/admin/news/${articleId}`, {
      method: "DELETE"
    });

    setDeletingArticleId(null);
    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setDeleteFeedback({ type: "error", text: data?.error ?? "Unable to remove post." });
      return;
    }

    setArticles((currentArticles) => currentArticles.filter((article) => article.id !== articleId));
    setDeleteFeedback({ type: "success", text: "Post removed successfully." });
  };

  return (
    <main className="min-h-screen bg-[#f7f4ed] px-5 py-8 text-neutral-950 md:px-8">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b-4 border-neutral-950 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-800">
            Protected Portal
          </p>
          <h1 className="font-serif text-4xl font-black md:text-5xl">Publishing Desk</h1>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button className="border-2 border-neutral-950 bg-neutral-950 px-4 py-2 font-bold text-white transition hover:bg-red-800">
            Logout
          </button>
        </form>
      </header>

      <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="border-4 border-neutral-950 bg-[#fbfaf6] p-6 shadow-[8px_8px_0_#171717]">
          <h2 className="font-serif text-3xl font-black">Daily E-Paper</h2>
          <form onSubmit={uploadEpaper} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-bold">PDF Edition</span>
              <input
                name="epaper"
                type="file"
                accept="application/pdf,.pdf"
                required
                className="mt-2 w-full border-2 border-neutral-950 bg-white p-3"
              />
            </label>
            {epaperFeedback ? <FeedbackMessage feedback={epaperFeedback} /> : null}
            <button
              disabled={isUploadingEpaper}
              className="w-full border-2 border-neutral-950 bg-neutral-950 px-4 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingEpaper ? "Uploading..." : "Upload E-Paper"}
            </button>
          </form>
        </section>

        <section className="border-4 border-neutral-950 bg-[#fbfaf6] p-6 shadow-[8px_8px_0_#171717]">
          <h2 className="font-serif text-3xl font-black">Publish Article</h2>
          <form onSubmit={publishNews} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-bold">Title</span>
              <input
                name="title"
                required
                className="mt-2 w-full border-2 border-neutral-950 bg-white px-3 py-3 outline-none focus:ring-4 focus:ring-red-800/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold">Category</span>
              <select
                name="category"
                required
                className="mt-2 w-full border-2 border-neutral-950 bg-white px-3 py-3 outline-none focus:ring-4 focus:ring-red-800/20"
              >
                {NEWS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold">Full Body Text</span>
              <textarea
                name="body"
                required
                rows={8}
                className="mt-2 w-full resize-y border-2 border-neutral-950 bg-white px-3 py-3 outline-none focus:ring-4 focus:ring-red-800/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold">Cover Image</span>
              <input
                name="image"
                type="file"
                accept="image/*"
                required
                className="mt-2 w-full border-2 border-neutral-950 bg-white p-3"
              />
            </label>
            {newsFeedback ? <FeedbackMessage feedback={newsFeedback} /> : null}
            <button
              disabled={isPublishing}
              className="w-full border-2 border-neutral-950 bg-neutral-950 px-4 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing ? "Publishing..." : "Publish News"}
            </button>
          </form>
        </section>
      </div>

      <section className="mx-auto mt-8 max-w-6xl border-4 border-neutral-950 bg-[#fbfaf6] p-6 shadow-[8px_8px_0_#171717]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-neutral-950 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-800">
              Published Archive
            </p>
            <h2 className="font-serif text-3xl font-black">Manage Posts</h2>
          </div>
          <span className="text-sm font-bold text-neutral-600">{articles.length} posts</span>
        </div>

        {deleteFeedback ? (
          <div className="mt-5">
            <FeedbackMessage feedback={deleteFeedback} />
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {articles.length === 0 ? (
            <p className="border-2 border-dashed border-neutral-500 bg-white p-4 text-sm font-semibold text-neutral-600">
              No posts available to remove.
            </p>
          ) : (
            articles.map((article) => (
              <article
                key={article.id}
                className="grid gap-4 border-2 border-neutral-950 bg-white p-4 md:grid-cols-[96px_1fr_auto]"
              >
                {article.image_url ? (
                  <Image
                    src={article.image_url}
                    alt=""
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 border-2 border-neutral-950 object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 border-2 border-dashed border-neutral-400 bg-neutral-100" />
                )}
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
                    <span className="bg-red-800 px-2 py-1 text-white">{article.category}</span>
                    <time className="text-neutral-500">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }).format(new Date(article.published_at))}
                    </time>
                  </div>
                  <h3 className="font-serif text-2xl font-black leading-tight">{article.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-700">{article.snippet}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteArticle(article.id)}
                  disabled={deletingArticleId === article.id}
                  className="h-11 border-2 border-red-800 px-4 text-sm font-bold text-red-900 transition hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 md:self-center"
                >
                  {deletingArticleId === article.id ? "Removing..." : "Remove"}
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  const classes =
    feedback.type === "success"
      ? "border-green-800 bg-green-50 text-green-900"
      : "border-red-800 bg-red-50 text-red-900";

  return <p className={`border-2 px-3 py-2 text-sm font-semibold ${classes}`}>{feedback.text}</p>;
}
