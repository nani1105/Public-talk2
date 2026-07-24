import { AdminDashboard } from "@/components/AdminDashboard";
import { getLatestNews } from "@/lib/news";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const articles = await getLatestNews();

  return <AdminDashboard initialArticles={articles} />;
}
