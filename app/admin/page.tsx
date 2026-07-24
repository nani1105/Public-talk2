import { AdminDashboard } from "@/components/AdminDashboard";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminDashboard />;
}
