"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { NEWS_CATEGORIES } from "@/lib/types";

type Message = { type: "ok" | "err"; text: string } | null;

export default function AdminPage() {
  const router = useRouter();
  const [epaperMsg, setEpaperMsg] = useState<Message>(null);
  const [newsMsg, setNewsMsg] = useState<Message>(null);
  const [epaperLoading, setEpaperLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleEpaper(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEpaperMsg(null);
    setEpaperLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/admin/epaper", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setEpaperMsg({ type: "err", text: data.error ?? "Upload failed" });
        return;
      }
      setEpaperMsg({ type: "ok", text: data.message ?? "E-Paper uploaded" });
      form.reset();
    } catch {
      setEpaperMsg({ type: "err", text: "Network error" });
    } finally {
      setEpaperLoading(false);
    }
  }

  async function handleNews(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewsMsg(null);
    setNewsLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/admin/news", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setNewsMsg({ type: "err", text: data.error ?? "Publish failed" });
        return;
      }
      setNewsMsg({ type: "ok", text: "Article published successfully" });
      form.reset();
    } catch {
      setNewsMsg({ type: "err", text: "Network error" });
    } finally {
      setNewsLoading(false);
    }
  }

  function alert(msg: Message) {
    if (!msg) return null;
    return (
      <p
        className={`mt-3 rounded px-3 py-2 text-sm ${
          msg.type === "ok"
            ? "border border-green-200 bg-green-50 text-green-800"
            : "border border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {msg.text}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="font-serif text-2xl font-black">Publishing Portal</h1>
            <p className="text-sm text-stone-500"> Public Talk Admin</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded border border-stone-900 px-4 py-2 text-sm font-medium hover:bg-stone-900 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold">Daily E-Paper</h2>
          <p className="mt-1 text-sm text-stone-500">
            Upload replaces today&apos;s edition instantly.
          </p>

          <form onSubmit={handleEpaper} className="mt-4">
            <input
              type="file"
              name="pdf"
              accept=".pdf,application/pdf"
              required
              className="block w-full text-sm"
            />
            <button
              type="submit"
              disabled={epaperLoading}
              className="mt-4 w-full rounded bg-stone-900 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {epaperLoading ? "Uploading…" : "Upload E-Paper"}
            </button>
          </form>
          {alert(epaperMsg)}
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="font-serif text-xl font-bold">Publish News Article</h2>

          <form onSubmit={handleNews} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium md:col-span-2">
              Title
              <input
                name="title"
                required
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 outline-none focus:border-stone-900"
              />
            </label>

            <label className="block text-sm font-medium">
              Category
              <select
                name="category"
                required
                defaultValue="Local"
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 outline-none focus:border-stone-900"
              >
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Cover Image
              <input
                type="file"
                name="coverImage"
                accept="image/*"
                required
                className="mt-1 block w-full text-sm"
              />
            </label>

            <label className="block text-sm font-medium md:col-span-2">
              Full Body Text
              <textarea
                name="body"
                required
                rows={8}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 outline-none focus:border-stone-900"
              />
            </label>

            <button
              type="submit"
              disabled={newsLoading}
              className="md:col-span-2 rounded bg-stone-900 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {newsLoading ? "Publishing…" : "Publish Article"}
            </button>
          </form>
          {alert(newsMsg)}
        </section>
      </main>
    </div>
  );
}
