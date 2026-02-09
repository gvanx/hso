export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ShoppingCart, DollarSign, Package } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalPhones },
    { count: availablePhones },
    { count: soldPhones },
    { count: totalOrders },
    { data: successOrders },
  ] = await Promise.all([
    supabase.from("phones").select("*", { count: "exact", head: true }),
    supabase
      .from("phones")
      .select("*", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("phones")
      .select("*", { count: "exact", head: true })
      .eq("status", "sold"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("amount_cents")
      .in("payment_status", ["success", "manual"]),
  ]);

  const totalRevenue =
    successOrders?.reduce((sum, o) => sum + o.amount_cents, 0) || 0;

  const stats = [
    {
      title: "Total Phones",
      value: totalPhones || 0,
      icon: Smartphone,
      description: "In inventory",
    },
    {
      title: "Available",
      value: availablePhones || 0,
      icon: Package,
      description: "Ready to sell",
    },
    {
      title: "Sold",
      value: soldPhones || 0,
      icon: ShoppingCart,
      description: "Phones sold",
    },
    {
      title: "Revenue",
      value: `XCG ${(totalRevenue / 100).toFixed(2)}`,
      icon: DollarSign,
      description: "Total revenue",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
