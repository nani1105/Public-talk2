"use client";

import Link from "next/link";

export default function Footer() {
  const getShareUrl = () => {
    if (typeof window !== "undefined") return window.location.href;
    return "https://epaper.publictalk.in";
  };

  return (
    <footer className="mt-12 border-t-4 border-neutral-950 bg-[#1e232a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6 text-center">
        {/* SOCIAL SHARE BUTTONS ROW */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded bg-[#3b5998] text-white hover:opacity-90 transition font-bold text-base shadow"
            title="Share on Facebook"
          >
            f
          </a>
          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded bg-black text-white hover:opacity-90 transition font-bold text-xs shadow border border-neutral-700"
            title="Share on Twitter"
          >
            𝕏
          </a>
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareUrl())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded bg-[#25D366] text-white hover:opacity-90 transition font-bold text-base shadow"
            title="Share on WhatsApp"
          >
            💬
          </a>
          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded bg-[#0088cc] text-white hover:opacity-90 transition font-bold text-base shadow"
            title="Share on Telegram"
          >
            ✈
          </a>
          {/* Email */}
          <a
            href={`mailto:?subject=Public Talk E-Paper&body=${encodeURIComponent(getShareUrl())}`}
            className="flex h-9 w-9 items-center justify-center rounded bg-[#ea4335] text-white hover:opacity-90 transition font-bold text-base shadow"
            title="Share via Email"
          >
            ✉
          </a>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-wider text-neutral-400 pt-2">
          <Link href="/" className="hover:text-white transition">
            Main Website
          </Link>
          <span>·</span>
          <Link href="/epaper" className="hover:text-white transition">
            Daily E-Paper
          </Link>
          <span>·</span>
          <Link href="/admin" className="hover:text-white transition">
            Admin Portal
          </Link>
        </div>

        {/* COPYRIGHT & CREDITS */}
        <div className="pt-4 border-t border-neutral-800 space-y-1 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} epaper.publictalk.in . All rights reserved.</p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
            Public Talk Media Group · Official Digital Publication
          </p>
        </div>
      </div>
    </footer>
  );
}
