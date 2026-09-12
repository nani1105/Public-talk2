"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t-4 border-neutral-950 bg-[#171717] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-800 pb-8">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              Independent News Agency
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-black tracking-tight text-white">
              Public Talk
            </h2>
            <p className="text-xs text-neutral-400 max-w-md font-medium leading-relaxed">
              Unbiased news reporting, local investigation, public records, and high-fidelity digital e-paper publishing.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
            <Link href="/" className="hover:text-red-400 transition">
              Main Website
            </Link>
            <span>·</span>
            <Link href="/epaper" className="hover:text-red-400 transition">
              Daily E-Paper
            </Link>
            <span>·</span>
            <Link href="/admin" className="hover:text-red-400 transition">
              Admin Portal
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between text-xs font-semibold text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Public Talk News Agency. All rights reserved.</p>
          <p className="uppercase tracking-widest text-[10px] text-neutral-400">
            Editorial Integrity · Public Record · Independent Journalism
          </p>
        </div>
      </div>
    </footer>
  );
}
