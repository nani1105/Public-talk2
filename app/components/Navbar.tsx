"use client";

import Link from "next/link";
import { useState } from "react";

type NavbarProps = {
  activeCategory?: string | null;
};

export default function Navbar({ activeCategory }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "BREAKING COVERAGE", category: "World", href: "/?category=World" },
    { label: "LOCAL VOICES", category: "Local", href: "/?category=Local" },
    { label: "PUBLIC RECORDS", category: "Politics", href: "/?category=Politics" },
    { label: "LATEST NEWS", category: null, href: "/" },
    { label: "DAILY E-PAPER", category: null, href: "/epaper", badge: "PDF", isEpaper: true },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b-2 border-neutral-950 bg-[#fbfaf6]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-8">
        {/* Desktop Links */}
        <div className="hidden md:flex flex-wrap items-center gap-1 lg:gap-3 text-xs font-black uppercase tracking-[0.18em]">
          {navItems.map((item) => {
            if (item.isEpaper) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-1 bg-red-800 px-3.5 py-2 text-white transition hover:bg-neutral-950 shadow-[2px_2px_0_#171717]"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-white px-1.5 py-0.5 text-[9px] font-black text-red-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            const isSelected = item.category
              ? activeCategory?.toLowerCase() === item.category.toLowerCase()
              : !activeCategory;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 transition border-2 ${
                  isSelected
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-transparent text-neutral-900 hover:border-neutral-950 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Title & Menu Button */}
        <div className="flex md:hidden items-center justify-between w-full">
          <Link href="/epaper" className="bg-red-800 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
            Today's E-Paper →
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-2 border-neutral-950 bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-neutral-950 shadow-[2px_2px_0_#171717]"
          >
            {mobileMenuOpen ? "Close ✕" : "Menu ☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-neutral-950 bg-[#f7f4ed] px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isSelected = item.category
              ? activeCategory?.toLowerCase() === item.category.toLowerCase()
              : !activeCategory;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full p-2.5 text-xs font-black uppercase tracking-wider border-2 ${
                  item.isEpaper
                    ? "bg-red-800 text-center text-white border-neutral-950 shadow-[2px_2px_0_#171717]"
                    : isSelected
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-300 bg-white text-neutral-900"
                }`}
              >
                {item.label} {item.badge ? `(${item.badge})` : ""}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
