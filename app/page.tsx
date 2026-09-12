import { Suspense } from "react";
import Header from "@/app/components/Header";
import HomepageClientWrapper from "@/app/components/HomepageClientWrapper";
import Footer from "@/app/components/Footer";
import { getLatestNews } from "@/lib/news";

export const revalidate = 0;

export const metadata = {
  title: "Public Talk | Independent News Agency",
  description: "Independent news, public records, local reporting, and daily e-paper edition.",
};

export default async function Home() {
  const articles = await getLatestNews();
  const epaperUrl = "/api/epaper";

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-neutral-950">
      <Header />
      <Suspense fallback={<div className="p-8 text-center font-bold">Loading Public Talk...</div>}>
        <HomepageClientWrapper articles={articles} epaperUrl={epaperUrl} />
      </Suspense>
      <Footer />
    </main>
  );
}
