"use client";

import Link from "next/link";
import { useState } from "react";

type NavbarProps = {
  activeCategory?: string | null;
};

export default function Navbar({ activeCategory }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "తాజా వార్తలు", category: "తాజా వార్తలు", href: "/?category=తాజా వార్తలు" },
    { label: "ఆంధ్రప్రదేశ్", category: "ఆంధ్రప్రదేశ్", href: "/?category=ఆంధ్రప్రదేశ్" },
    { label: "తెలంగాణ", category: "తెలంగాణ", href: "/?category=తెలంగాణ" },
    { label: "జాతీయం", category: "జాతీయం", href: "/?category=జాతీయం" },
    { label: "అంతర్జాతీయం", category: "అంతర్జాతీయం", href: "/?category=అంతర్జాతీయం" },
    { label: "బిజినెస్", category: "బిజినెస్", href: "/?category=బిజినెస్" },
    { label: "క్రీడలు", category: "క్రీడలు", href: "/?category=క్రీడలు" },
    { label: "సినిమా", category: "సినిమా", href: "/?category=సినిమా" },
    { label: "ఫీచర్ పేజీలు", category: "ఫీచర్ పేజీలు", href: "/?category=ఫీచర్ పేజీలు" },

    { label: "ఈ-పేపర్", category: null, href: "/epaper", isEpaper: true },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#004080] border-b-2 border-neutral-950 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 md:px-4">
        {/* Desktop Telugu Navbar */}
        <div className="hidden lg:flex items-stretch overflow-x-auto text-sm font-black tracking-wide">
          {/* Home Icon Button */}
          <Link
            href="/"
            className={`flex items-center justify-center px-3.5 py-3 border-r border-[#002a50] transition hover:bg-[#002b55] ${
              !activeCategory ? "bg-[#002548] text-[#ffcc00]" : "text-white"
            }`}
            title="Home / హోమ్"
          >
            <span className="text-base">🏠</span>
          </Link>

          {navItems.map((item) => {
            if (item.isEpaper) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-1.5 bg-red-700 px-4 py-3 font-black text-white hover:bg-red-800 transition border-r border-[#002a50]"
                >
                  <span>📄 {item.label}</span>
                </Link>
              );
            }

            const isSelected = activeCategory?.toLowerCase() === item.category?.toLowerCase();

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-3.5 py-3 transition border-r border-[#002a50] whitespace-nowrap ${
                  isSelected
                    ? "bg-[#00284d] text-[#ffcc00] font-black underline underline-offset-4 decoration-2"
                    : "text-white hover:bg-[#003163] hover:text-[#ffea80]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Medium Screen Responsive Bar */}
        <div className="hidden md:flex lg:hidden flex-wrap items-center gap-1 py-2 text-xs font-black">
          <Link
            href="/"
            className={`px-2.5 py-1.5 rounded transition ${!activeCategory ? "bg-amber-400 text-neutral-950 font-black" : "text-white hover:bg-blue-900"}`}
          >
            🏠
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-2 py-1.5 transition ${
                item.isEpaper
                  ? "bg-red-700 text-white font-bold"
                  : activeCategory?.toLowerCase() === item.category?.toLowerCase()
                  ? "bg-amber-400 text-neutral-950 font-black"
                  : "text-white hover:bg-blue-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Header Control */}
        <div className="flex md:hidden items-center justify-between w-full py-2 px-2">
          <Link href="/" className="text-white font-black text-sm flex items-center gap-1">
            <span>🏠 హోమ్</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/epaper" className="bg-red-700 px-3 py-1 text-xs font-black text-white rounded">
              ఈ-పేపర్ 📄
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border border-white bg-blue-900 px-3 py-1 text-xs font-black text-white"
            >
              {mobileMenuOpen ? "ముయ్యి ✕" : "మెనూ ☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#002a50] bg-[#002f5e] px-4 py-3 grid grid-cols-2 gap-2 text-xs font-black">
          {navItems.map((item) => {
            const isSelected = activeCategory?.toLowerCase() === item.category?.toLowerCase();

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block p-2.5 rounded border text-center transition ${
                  item.isEpaper
                    ? "bg-red-700 text-white col-span-2 font-bold"
                    : isSelected
                    ? "bg-amber-400 text-neutral-950 border-amber-400 font-black"
                    : "border-blue-700 bg-[#003870] text-white hover:bg-blue-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
