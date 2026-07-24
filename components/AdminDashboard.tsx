"use client";

import { FormEvent, useState } from "react";
import { NEWS_CATEGORIES } from "@/types/news";

type Feedback = {
  type: "success" | "error";
  text: string;
};

export function AdminDashboard() {
  const [epaperFeedback, setEpaperFeedback] = useState<Feedback | null>(null);
  const [newsFeedback, setNewsFeedback] = useState<Feedback | null>(null);
  const [isUploadingEpaper, setIsUploadingEpaper] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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
    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setNewsFeedback({ type: "error", text: data?.error ?? "Publishing failed." });
      return;
    }

    form.reset();
    setNewsFeedback({ type: "success", text: "Article published successfully." });
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
