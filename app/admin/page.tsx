"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NEWS_CATEGORIES, type NewsArticle } from "@/types/news";

type Message = { type: "ok" | "err"; text: string } | null;

const emptyForm = {
  title: "",
  category: "Local" as NewsArticle["category"],
  body: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [epaperUrl, setEpaperUrl] = useState<string | null>(null);
  const [epaperViewerUrl, setEpaperViewerUrl] = useState<string | null>(null);
  const [epaperMsg, setEpaperMsg] = useState<Message>(null);
  const [newsMsg, setNewsMsg] = useState<Message>(null);
  const [epaperLoading, setEpaperLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const loadData = useCallback(async () => {
    const [newsRes, epaperRes] = await Promise.all([
      fetch("/api/admin/news"),
      fetch("/api/admin/epaper"),
    ]);
    if (newsRes.ok) setArticles(await newsRes.json());
    if (epaperRes.ok) {
      const data = await epaperRes.json();
      setEpaperUrl(data.url ?? null);
      setEpaperViewerUrl(data.viewerUrl ?? "/api/epaper");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setCoverFile(null);
  }

  function startEdit(article: NewsArticle) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      category: article.category,
      body: article.body,
    });
    setCoverFile(null);
    setNewsMsg(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function handleDeleteArticle(id: string) {
    if (!confirm("Delete this article permanently?")) return;

    const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setNewsMsg({ type: "err", text: data.error ?? "Delete failed" });
      return;
    }
    setNewsMsg({ type: "ok", text: "Article deleted" });
    if (editingId === id) resetForm();
    await loadData();
  }

  async function handleEpaper(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEpaperMsg(null);
    setEpaperLoading(true);

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    try {
      const res = await fetch("/api/admin/epaper", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setEpaperMsg({ type: "err", text: data.error ?? "Upload failed" });
        return;
      }
      setEpaperMsg({ type: "ok", text: data.message ?? "E-Paper uploaded" });
      setEpaperUrl(data.url ?? null);
      setEpaperViewerUrl(data.viewerUrl ?? "/api/epaper");
      formEl.reset();
    } catch {
      setEpaperMsg({ type: "err", text: "Network error" });
    } finally {
      setEpaperLoading(false);
    }
  }

  async function handleDeleteEpaper() {
    if (!confirm("Delete the current e-paper edition?")) return;

    setEpaperMsg(null);
    setEpaperLoading(true);
    try {
      const res = await fetch("/api/admin/epaper", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setEpaperMsg({ type: "err", text: data.error ?? "Delete failed" });
        return;
      }
      setEpaperMsg({ type: "ok", text: data.message ?? "E-Paper deleted" });
      setEpaperUrl(null);
      setEpaperViewerUrl(null);
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

    const fd = new FormData();
    fd.set("title", form.title);
    fd.set("category", form.category);
    fd.set("body", form.body);
    if (coverFile) fd.set("coverImage", coverFile);

    const isEdit = Boolean(editingId);
    if (!isEdit && !coverFile) {
      setNewsMsg({ type: "err", text: "Cover image is required for new articles" });
      setNewsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        isEdit ? `/api/admin/news/${editingId}` : "/api/admin/news",
        { method: isEdit ? "PUT" : "POST", body: fd }
      );
      const data = await res.json();
      if (!res.ok) {
        setNewsMsg({ type: "err", text: data.error ?? "Save failed" });
        return;
      }
      setNewsMsg({
        type: "ok",
        text: isEdit ? "Article updated successfully" : "Article published successfully",
      });
      resetForm();
      await loadData();
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
            <p className="text-sm text-stone-500">Public Talk Admin</p>
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

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold">Daily E-Paper</h2>
          <p className="mt-1 text-sm text-stone-500">
            Upload replaces today&apos;s edition. Delete removes the current PDF.
          </p>

          {epaperUrl ? (
            <p className="mt-3 text-sm text-green-700">
              Current edition is live.{" "}
              <a
                href={epaperViewerUrl ?? epaperUrl ?? "/api/epaper"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View PDF
              </a>
            </p>
          ) : (
            <p className="mt-3 text-sm text-stone-500">No e-paper uploaded yet.</p>
          )}

          <form onSubmit={handleEpaper} className="mt-4">
            <input
              type="file"
              name="pdf"
              accept=".pdf,application/pdf"
              required
              className="block w-full text-sm"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={epaperLoading}
                className="flex-1 rounded bg-stone-900 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {epaperLoading ? "Working…" : epaperUrl ? "Replace E-Paper" : "Upload E-Paper"}
              </button>
              {epaperUrl && (
                <button
                  type="button"
                  onClick={handleDeleteEpaper}
                  disabled={epaperLoading}
                  className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
          {alert(epaperMsg)}
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold">Published Articles</h2>
          <p className="mt-1 text-sm text-stone-500">
            {articles.length} article{articles.length !== 1 ? "s" : ""} total
          </p>

          {articles.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">No articles yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {articles.map((article) => (
                <li key={article.id} className="flex gap-4 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image_url}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug">{article.title}</p>
                    <p className="text-xs text-stone-500">
                      {article.category} ·{" "}
                      {new Date(article.published_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(article)}
                      className="rounded border border-stone-300 px-3 py-1 text-xs font-medium hover:bg-stone-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteArticle(article.id)}
                      className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">
              {editingId ? "Edit Article" : "Publish News Article"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-stone-500 underline"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleNews} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium md:col-span-2">
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 outline-none focus:border-stone-900"
              />
            </label>

            <label className="block text-sm font-medium">
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as NewsArticle["category"],
                  })
                }
                required
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
              Cover Image {editingId && "(leave empty to keep current)"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                required={!editingId}
                className="mt-1 block w-full text-sm"
              />
            </label>

            <label className="block text-sm font-medium md:col-span-2">
              Full Body Text
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
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
              {newsLoading
                ? "Saving…"
                : editingId
                  ? "Update Article"
                  : "Publish Article"}
            </button>
          </form>
          {alert(newsMsg)}
        </section>
      </main>
    </div>
  );
}