export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/DashboardContent";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ data: orders }, { data: phones }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, phone:phones(*)")
      .order("created_at", { ascending: false }),
    supabase
      .from("phones")
      .select("*")
      .not("reference", "like", "TEST-%")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <DashboardContent orders={orders || []} phones={phones || []} />
  );
}
