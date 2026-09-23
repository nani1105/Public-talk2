import type { Metadata } from "next";
import { Suspense } from "react";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Public Talk | Independent News Agency",
    template: "%s | Public Talk",
  },
  description: "Independent news agency delivering daily reporting, local voices, public records, and interactive digital e-paper editions.",
  openGraph: {
    title: "Public Talk | Independent News Agency",
    description: "Independent news agency delivering daily reporting, local voices, public records, and interactive digital e-paper editions.",
    siteName: "Public Talk",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-red-800 selection:text-white pb-14 md:pb-0">
        {children}
        <Suspense fallback={null}>
          <MobileBottomNav />
        </Suspense>
      </body>
    </html>
  );
}
