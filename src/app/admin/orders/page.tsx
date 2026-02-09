export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/components/OrdersTable";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, phone:phones(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <OrdersTable orders={orders || []} />
    </div>
  );
}
