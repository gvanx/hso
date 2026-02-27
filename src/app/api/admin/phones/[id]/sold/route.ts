import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: phoneId } = await params;
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orderId = body.order_id;

  const admin = createAdminClient();

  // Mark phone as sold
  const { error: phoneError } = await admin
    .from("phones")
    .update({ status: "sold" })
    .eq("id", phoneId);

  if (phoneError) {
    return NextResponse.json(
      { error: "Failed to update phone" },
      { status: 500 }
    );
  }

  if (orderId) {
    // Existing order — mark as manual
    await admin
      .from("orders")
      .update({ payment_status: "manual" })
      .eq("id", orderId);
  } else {
    // Walk-in sale — fetch phone price and create a manual order
    const { data: phone } = await admin
      .from("phones")
      .select("price_cents")
      .eq("id", phoneId)
      .single();

    await admin.from("orders").insert({
      phone_id: phoneId,
      buyer_name: "Walk-in",
      buyer_email: "",
      buyer_phone: "",
      amount_cents: phone?.price_cents || 0,
      payment_status: "manual",
      fulfillment_type: "pickup",
      delivery_fee_cents: 0,
      notifications_sent: false,
    });
  }

  return NextResponse.json({ success: true });
}
