"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NEWS_CATEGORIES, type NewsArticle } from "@/types/news";

type Message = { type: "ok" | "err"; text: string } | null;

type DbStatus = {
  connected: boolean;
  configured: boolean;
  message: string;
  supabaseUrl: string | null;
  articleCount: number;
};

async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

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
  const [epaperFile, setEpaperFile] = useState<File | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  const loadData = useCallback(async () => {
    const t = Date.now();
    try {
      const [newsRes, epaperRes, statusRes] = await Promise.all([
        fetch(`/api/admin/news?_t=${t}`),
        fetch(`/api/admin/epaper?_t=${t}`),
        fetch(`/api/admin/status?_t=${t}`),
      ]);
      if (newsRes.ok) setArticles(await newsRes.json());
      if (epaperRes.ok) {
        const data = await epaperRes.json();
        setEpaperUrl(data.url ?? null);
        setEpaperViewerUrl(data.viewerUrl ?? "/api/epaper");
      }
      if (statusRes.ok) {
        setDbStatus(await statusRes.json());
      }
    } catch {
      // Ignore background network errors
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
    if (epaperFile) {
      fd.set("pdf", epaperFile);
    }

    try {
      const res = await fetch("/api/admin/epaper", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setEpaperMsg({ type: "err", text: data.error ?? "Upload failed" });
        return;
      }
      setEpaperMsg({ type: "ok", text: data.message ?? "E-Paper uploaded successfully!" });
      setEpaperUrl(data.url ?? null);
      setEpaperViewerUrl(data.viewerUrl ?? "/api/epaper");
      setEpaperFile(null);
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
    const isDummyEdit = Boolean(editingId && editingId.startsWith("dummy-"));
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
        text: isEdit
          ? isDummyEdit
            ? "Sample article customized and published to live database!"
            : "Article updated successfully"
          : "Article published successfully",
      });
      resetForm();
      await loadData();
    } catch (err) {
      setNewsMsg({ type: "err", text: err instanceof Error ? err.message : "Network error" });
    } finally {
      setNewsLoading(false);
    }
  }

  function alert(msg: Message) {
    if (!msg) return null;
    return (
      <p
        className={`mt-3 border-2 p-3 text-sm font-bold ${
          msg.type === "ok"
            ? "border-green-800 bg-green-50 text-green-900"
            : "border-red-800 bg-red-50 text-red-900"
        }`}
      >
        {msg.text}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-neutral-950">
      <header className="border-b-4 border-neutral-950 bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                STAFF PORTAL
              </span>
              {dbStatus && (
                dbStatus.connected ? (
                  <span className="inline-flex items-center gap-1.5 border border-emerald-800 bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-950">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    Supabase Connected ({dbStatus.articleCount} saved)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 border border-red-800 bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase text-red-950">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    Supabase Disconnected
                  </span>
                )
              )}
            </div>
            <h1 className="font-serif text-3xl font-black md:text-4xl text-neutral-950">
              Public Talk Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="border-2 border-neutral-950 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wider text-neutral-950 hover:bg-neutral-100 shadow-[2px_2px_0_#171717]"
            >
              Live Site ↗
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="border-2 border-neutral-950 bg-neutral-950 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white hover:bg-red-800 shadow-[2px_2px_0_#171717]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {dbStatus && !dbStatus.connected && (
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="border-4 border-red-800 bg-red-50 p-4 text-red-950 shadow-[4px_4px_0_#991b1b]">
            <p className="font-serif text-base font-black">
              ⚠️ Database Connection Warning (Vercel)
            </p>
            <p className="mt-1 text-xs font-bold leading-relaxed">
              {dbStatus.message}
            </p>
            <p className="mt-2 text-xs font-mono bg-white p-2 border border-red-300">
              Check Vercel Dashboard → Project Settings → Environment Variables. Add <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>SUPABASE_SERVICE_ROLE_KEY</strong>, then redeploy.
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* DAILY E-PAPER SECTION */}
        <section className="border-4 border-neutral-950 bg-white p-6 shadow-[8px_8px_0_#171717]">
          <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-3">
            <div>
              <span className="bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                EPAPER DISTRIBUTION
              </span>
              <h2 className="font-serif text-2xl font-black text-neutral-950">
                Daily E-Paper Edition
              </h2>
            </div>
            {epaperUrl && (
              <span className="bg-green-800 px-2.5 py-1 text-xs font-black uppercase text-white">
                ● Live Edition Online
              </span>
            )}
          </div>

          <form onSubmit={handleEpaper} className="mt-5 space-y-4">
            {/* RECTANGULAR DISTINCT FILE DROPZONE BOX FOR EPAPER */}
            <div className="relative border-4 border-dashed border-neutral-950 bg-[#f4efe4] hover:bg-[#eae3d2] transition p-6 text-center shadow-[4px_4px_0_#171717] group cursor-pointer">
              <input
                type="file"
                name="pdf"
                accept=".pdf,application/pdf"
                onChange={(e) => setEpaperFile(e.target.files?.[0] ?? null)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div className="space-y-2 pointer-events-none">
                <div className="mx-auto h-12 w-12 border-2 border-neutral-950 bg-white flex items-center justify-center font-black text-xl shadow-[2px_2px_0_#171717]">
                  📄
                </div>
                <p className="font-serif text-base font-black text-neutral-950">
                  {epaperFile ? epaperFile.name : "CHOOSE PDF E-PAPER FILE"}
                </p>
                <p className="text-xs font-bold uppercase text-neutral-600 tracking-wider">
                  {epaperFile
                    ? `Selected File (${(epaperFile.size / (1024 * 1024)).toFixed(2)} MB)`
                    : "Click or drag replacement PDF edition file here [Max 25MB]"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={epaperLoading}
                className="flex-1 border-2 border-neutral-950 bg-neutral-950 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0_#171717] hover:bg-red-800 transition disabled:opacity-60"
              >
                {epaperLoading ? "Uploading..." : epaperUrl ? "Replace Live E-Paper" : "Upload E-Paper"}
              </button>
              {epaperUrl && (
                <button
                  type="button"
                  onClick={handleDeleteEpaper}
                  disabled={epaperLoading}
                  className="border-2 border-neutral-950 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-red-800 shadow-[4px_4px_0_#171717] hover:bg-red-50 disabled:opacity-60"
                >
                  Delete Live Edition
                </button>
              )}
            </div>
          </form>
          {alert(epaperMsg)}
        </section>

        {/* PUBLISHED ARTICLES LIST */}
        <section className="border-4 border-neutral-950 bg-white p-6 shadow-[8px_8px_0_#171717]">
          <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-3">
            <div>
              <span className="bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                NEWSROOM DESK
              </span>
              <h2 className="font-serif text-2xl font-black text-neutral-950">
                Published Articles
              </h2>
            </div>
            <span className="font-mono text-xs font-black text-neutral-800">
              {articles.length} ARTICLE{articles.length !== 1 ? "S" : ""} TOTAL
            </span>
          </div>

          {articles.length === 0 ? (
            <p className="mt-4 text-sm font-bold text-neutral-600">No articles published yet.</p>
          ) : (
            <ul className="mt-4 divide-y-2 divide-neutral-200">
              {articles.map((article) => {
                const isDummy = article.id.startsWith("dummy-");
                return (
                  <li key={article.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image_url}
                      alt=""
                      className="h-16 w-20 shrink-0 border-2 border-neutral-950 object-cover shadow-[2px_2px_0_#171717]"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
                      }}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-serif text-lg font-black leading-snug text-neutral-950">
                        {article.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="bg-red-800 px-2 py-0.5 uppercase text-white">
                          {article.category}
                        </span>
                        {isDummy ? (
                          <span className="bg-amber-100 border border-amber-800 px-2 py-0.5 text-[10px] font-black uppercase text-amber-950">
                            Starter Template
                          </span>
                        ) : (
                          <span className="bg-emerald-100 border border-emerald-800 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-950">
                            Database Live
                          </span>
                        )}
                        <time className="text-neutral-500">
                          {new Date(article.published_at).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(article)}
                        className="border-2 border-neutral-950 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wider text-neutral-950 hover:bg-neutral-100 shadow-[2px_2px_0_#171717]"
                      >
                        {isDummy ? "Customize" : "Edit Post"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(article.id)}
                        className="border-2 border-neutral-950 bg-red-800 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-950 shadow-[2px_2px_0_#171717]"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* PUBLISH / EDIT ARTICLE FORM */}
        <section className="border-4 border-neutral-950 bg-white p-6 shadow-[8px_8px_0_#171717]">
          <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-3">
            <div>
              <span className="bg-red-800 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                {editingId
                  ? editingId.startsWith("dummy-")
                    ? "STARTER TEMPLATE EDITOR"
                    : "EDITOR MODE"
                  : "NEW STORY"}
              </span>
              <h2 className="font-serif text-2xl font-black text-neutral-950">
                {editingId
                  ? editingId.startsWith("dummy-")
                    ? "Customize & Publish Starter Post"
                    : "Edit News Article"
                  : "Publish News Article"}
              </h2>
              {editingId && editingId.startsWith("dummy-") && (
                <p className="mt-1 text-xs font-bold text-neutral-600">
                  💡 This is a starter template. Saving changes will publish it directly to your Supabase database.
                </p>
              )}
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-neutral-950 bg-neutral-100 px-3 py-1 text-xs font-black uppercase text-neutral-900 hover:bg-neutral-200"
              >
                Cancel Edit ✕
              </button>
            )}
          </div>

          <form onSubmit={handleNews} className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block text-xs font-black uppercase tracking-wider md:col-span-2 space-y-1">
              <span>Headline Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border-2 border-neutral-950 bg-white px-3 py-2.5 outline-none font-serif text-lg font-bold focus:ring-2 focus:ring-red-800"
              />
            </label>

            <label className="block text-xs font-black uppercase tracking-wider space-y-1">
              <span>Section Category</span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as NewsArticle["category"],
                  })
                }
                required
                className="w-full border-2 border-neutral-950 bg-white px-3 py-2.5 outline-none font-bold focus:ring-2 focus:ring-red-800"
              >
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            {/* RECTANGULAR DISTINCT FILE DROPZONE BOX FOR COVER IMAGE */}
            <div className="block text-xs font-black uppercase tracking-wider space-y-1">
              <span>Cover Image {editingId && "(Leave empty to keep current image)"}</span>
              <div className="relative border-2 border-dashed border-neutral-950 bg-[#f4efe4] hover:bg-[#eae3d2] transition p-3 text-center shadow-[3px_3px_0_#171717] cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const rawFile = e.target.files?.[0];
                    if (rawFile) {
                      const compressed = await compressImage(rawFile);
                      setCoverFile(compressed);
                    } else {
                      setCoverFile(null);
                    }
                  }}
                  required={!editingId}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div className="pointer-events-none font-mono text-xs font-bold text-neutral-900">
                  📷 {coverFile ? coverFile.name : "CHOOSE COVER IMAGE FILE"}
                </div>
              </div>
            </div>

            <label className="block text-xs font-black uppercase tracking-wider md:col-span-2 space-y-1">
              <span>Full Story Text</span>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                rows={8}
                className="w-full border-2 border-neutral-950 bg-white px-3 py-2.5 outline-none font-serif text-base font-medium focus:ring-2 focus:ring-red-800"
              />
            </label>

            <button
              type="submit"
              disabled={newsLoading}
              className="md:col-span-2 border-2 border-neutral-950 bg-neutral-950 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0_#171717] hover:bg-red-800 transition disabled:opacity-60"
            >
              {newsLoading
                ? "Saving..."
                : editingId
                  ? editingId.startsWith("dummy-")
                    ? "Save & Publish to Database"
                    : "Update Article"
                  : "Publish Story"}
            </button>
          </form>
          {alert(newsMsg)}
        </section>
      </main>
    </div>
  );
}