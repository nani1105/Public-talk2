"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  // Only show on public pages, not inside admin
  if (pathname.startsWith("/admin")) return null;

  const tabs = [
    {
      label: "హోమ్",
      subLabel: "Home",
      icon: "🏠",
      href: "/",
      isActive: pathname === "/" && !currentCategory,
    },
    {
      label: "తాజా",
      subLabel: "Latest",
      icon: "📰",
      href: "/?category=తాజా వార్తలు",
      isActive: currentCategory === "తాజా వార్తలు",
    },
    {
      label: "విభాగాలు",
      subLabel: "Sections",
      icon: "🌐",
      href: "/?category=ఆంధ్రప్రదేశ్",
      isActive: Boolean(currentCategory && currentCategory !== "తాజా వార్తలు"),
    },
    {
      label: "ట్రెండింగ్",
      subLabel: "Trending",
      icon: "📈",
      href: "/?category=జాతీయం",
      isActive: currentCategory === "జాతీయం",
    },
    {
      label: "ఈ-పేపర్",
      subLabel: "E-Paper",
      icon: "📑",
      href: "/epaper",
      isActive: pathname.startsWith("/epaper"),
      isSpecial: true,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#004080] border-t-2 border-neutral-900 text-white shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around py-1 px-1">
        {tabs.map((tab) => {
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-center transition active:scale-95 ${
                tab.isActive
                  ? "text-[#ffcc00] font-black"
                  : tab.isSpecial
                  ? "text-red-400 font-black"
                  : "text-neutral-200 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="text-[10px] font-bold leading-tight mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
