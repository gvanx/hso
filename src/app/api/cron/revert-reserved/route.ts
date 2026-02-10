import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchTransactionStatus } from "@/lib/sentoo";

const CRON_SECRET = process.env.CRON_SECRET;
const STALE_MINUTES = 30;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString();

  // Find reserved phones with updated_at older than 30 minutes
  const { data: stalePhones, error } = await supabase
    .from("phones")
    .select("id, model, updated_at")
    .eq("status", "reserved")
    .lt("updated_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!stalePhones || stalePhones.length === 0) {
    return NextResponse.json({ reverted: 0, details: [] });
  }

  const results: Array<{ phone_id: string; model: string; action: string }> = [];

  for (const phone of stalePhones) {
    // Find most recent pending order for this phone
    const { data: order } = await supabase
      .from("orders")
      .select("id, sentoo_tx_id, payment_status")
      .eq("phone_id", phone.id)
      .in("payment_status", ["created", "issued", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let shouldRevert = true;

    // If there's a pending order with a Sentoo transaction, check its status
    if (order?.sentoo_tx_id) {
      try {
        const statusResponse = await fetchTransactionStatus(order.sentoo_tx_id);
        const sentooStatus = statusResponse.success.message;

        if (sentooStatus === "success") {
          // Payment actually succeeded — mark as sold instead
          await supabase
            .from("phones")
            .update({ status: "sold" })
            .eq("id", phone.id);
          await supabase
            .from("orders")
            .update({ payment_status: "success" })
            .eq("id", order.id);
          results.push({ phone_id: phone.id, model: phone.model, action: "marked_sold" });
          shouldRevert = false;
        } else if (sentooStatus === "pending" || sentooStatus === "issued") {
          // Still actively pending — skip for now
          results.push({ phone_id: phone.id, model: phone.model, action: "skipped_still_pending" });
          shouldRevert = false;
        }
      } catch (err) {
        console.error(`Cron: failed to check Sentoo status for ${order.sentoo_tx_id}:`, err);
        // Can't verify — revert to be safe
      }
    }

    if (shouldRevert) {
      await supabase
        .from("phones")
        .update({ status: "available" })
        .eq("id", phone.id);

      // Mark any open orders as expired
      if (order) {
        await supabase
          .from("orders")
          .update({ payment_status: "expired" })
          .eq("id", order.id);
      }

      results.push({ phone_id: phone.id, model: phone.model, action: "reverted" });
    }
  }

  const revertedCount = results.filter((r) => r.action === "reverted").length;
  return NextResponse.json({ reverted: revertedCount, details: results });
}
