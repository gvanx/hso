import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchTransactionStatus } from "@/lib/sentoo";

const STALE_MINUTES = 10;

export async function POST() {
  // Verify admin is authenticated
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString();

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
    const { data: order } = await supabase
      .from("orders")
      .select("id, sentoo_tx_id, payment_status")
      .eq("phone_id", phone.id)
      .in("payment_status", ["created", "issued", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let shouldRevert = true;

    if (order?.sentoo_tx_id) {
      try {
        const statusResponse = await fetchTransactionStatus(order.sentoo_tx_id);
        const sentooStatus = statusResponse.success.message;

        if (sentooStatus === "success") {
          await supabase.from("phones").update({ status: "sold" }).eq("id", phone.id);
          await supabase.from("orders").update({ payment_status: "success" }).eq("id", order.id);
          results.push({ phone_id: phone.id, model: phone.model, action: "marked_sold" });
          shouldRevert = false;
        }
      } catch (err) {
        console.error(`Cleanup: failed to check Sentoo status for ${order.sentoo_tx_id}:`, err);
      }
    }

    if (shouldRevert) {
      await supabase.from("phones").update({ status: "available" }).eq("id", phone.id);
      if (order) {
        await supabase.from("orders").update({ payment_status: "expired" }).eq("id", order.id);
      }
      results.push({ phone_id: phone.id, model: phone.model, action: "reverted" });
    }
  }

  const revertedCount = results.filter((r) => r.action === "reverted").length;
  return NextResponse.json({ reverted: revertedCount, details: results });
}
