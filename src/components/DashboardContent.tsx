"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPhoneTable } from "@/components/AdminPhoneTable";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import {
  Smartphone,
  ShoppingCart,
  DollarSign,
  Package,
} from "lucide-react";
import type { Phone, Order } from "@/lib/types";

type DateRange = "today" | "7d" | "30d" | "all";

interface DashboardContentProps {
  orders: Order[];
  phones: Phone[];
}

function getDateThreshold(range: DateRange): Date | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = range === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

export function DashboardContent({ orders, phones }: DashboardContentProps) {
  const [range, setRange] = useState<DateRange>("all");

  const threshold = useMemo(() => getDateThreshold(range), [range]);

  const filteredOrders = useMemo(() => {
    if (!threshold) return orders;
    return orders.filter((o) => new Date(o.created_at) >= threshold);
  }, [orders, threshold]);

  const filteredPhones = useMemo(() => {
    if (!threshold) return phones;
    return phones.filter((p) => new Date(p.created_at) >= threshold);
  }, [phones, threshold]);

  const successOrders = useMemo(
    () =>
      filteredOrders.filter((o) =>
        ["success", "manual"].includes(o.payment_status)
      ),
    [filteredOrders]
  );

  const totalRevenue = useMemo(
    () => successOrders.reduce((sum, o) => sum + o.amount_cents, 0),
    [successOrders]
  );

  // Chart data
  const chartData = useMemo(() => {
    if (range === "today") {
      return [
        {
          date: "Today",
          revenue: totalRevenue / 100,
          orders: successOrders.length,
        },
      ];
    }

    const days = range === "7d" ? 7 : range === "30d" ? 30 : null;
    const bucketMap = new Map<string, { revenue: number; orders: number }>();

    if (days) {
      // Pre-fill buckets for the date range
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        bucketMap.set(key, { revenue: 0, orders: 0 });
      }
    }

    for (const order of successOrders) {
      const key = order.created_at.slice(0, 10);
      const bucket = bucketMap.get(key) || { revenue: 0, orders: 0 };
      bucket.revenue += order.amount_cents / 100;
      bucket.orders += 1;
      bucketMap.set(key, bucket);
    }

    // Sort by date
    const sorted = Array.from(bucketMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    return sorted.map(([date, data]) => ({
      date: formatDate(date),
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    }));
  }, [range, successOrders, totalRevenue]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const stats = [
    {
      title: "Total Phones",
      value: filteredPhones.length,
      icon: Smartphone,
      description: "In inventory",
    },
    {
      title: "Available",
      value: filteredPhones.filter((p) => p.status === "available").length,
      icon: Package,
      description: "Ready to sell",
    },
    {
      title: "Sold",
      value: successOrders.length,
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

  const ranges: { label: string; value: DateRange }[] = [
    { label: "Today", value: "today" },
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
    { label: "All time", value: "all" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {ranges.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
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

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `XCG ${Number(value).toFixed(2)}`,
                        "Revenue",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value) => [value, "Orders"]}
                    />
                    <Bar
                      dataKey="orders"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Orders */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Recent Orders</h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {order.phone?.model || order.phone_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{order.buyer_name}</TableCell>
                  <TableCell>{formatCurrency(order.amount_cents)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(order.payment_status)}
                    >
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatShortDate(order.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phones */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Phones</h2>
      <AdminPhoneTable phones={phones} />
    </div>
  );
}
