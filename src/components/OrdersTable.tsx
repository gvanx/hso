"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import type { Order } from "@/lib/types";
import { CheckCircle, Loader2 } from "lucide-react";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [marking, setMarking] = useState<string | null>(null);

  async function handleManualSold(order: Order) {
    if (
      !confirm(
        `Mark this order as manually sold? Phone: ${order.phone?.model || order.phone_id}`
      )
    )
      return;

    setMarking(order.id);

    try {
      const res = await fetch(`/api/admin/phones/${order.phone_id}/sold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as sold");
      }

      toast.success("Phone marked as sold");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setMarking(null);
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-muted-foreground"
              >
                No orders yet.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  {order.id.slice(0, 8)}
                </TableCell>
                <TableCell>{order.phone?.model || "-"}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.buyer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.buyer_email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      order.fulfillment_type === "delivery"
                        ? "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400"
                        : ""
                    }
                  >
                    {order.fulfillment_type === "delivery" ? "Delivery" : "Pickup"}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(order.amount_cents)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(order.payment_status)}
                  >
                    {order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {order.payment_status !== "success" &&
                    order.payment_status !== "manual" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleManualSold(order)}
                        disabled={marking === order.id}
                        title="Mark as manually sold"
                      >
                        {marking === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
