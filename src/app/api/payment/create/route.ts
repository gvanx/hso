import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTransaction } from "@/lib/sentoo";
import { DELIVERY_FEE_CENTS } from "@/lib/constants";

const schema = z
  .object({
    phone_id: z.string().uuid(),
    buyer_name: z.string().min(1).max(100),
    buyer_email: z.string().email(),
    buyer_phone: z.string().min(5).max(20),
    fulfillment_type: z.enum(["pickup", "delivery"]).default("pickup"),
    delivery_address: z.string().max(500).optional(),
  })
  .refine(
    (d) => d.fulfillment_type !== "delivery" || (d.delivery_address && d.delivery_address.trim().length > 0),
    { message: "Delivery address is required for delivery", path: ["delivery_address"] }
  );

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { phone_id, buyer_name, buyer_email, buyer_phone, fulfillment_type, delivery_address } = parsed.data;
    const supabase = createAdminClient();

    // Fetch phone and verify it's available
    const { data: phone, error: phoneError } = await supabase
      .from("phones")
      .select("*")
      .eq("id", phone_id)
      .single();

    if (phoneError || !phone) {
      return NextResponse.json({ error: "Phone not found" }, { status: 404 });
    }

    if (phone.status !== "available") {
      return NextResponse.json(
        { error: "Phone is no longer available" },
        { status: 409 }
      );
    }

    // Reserve the phone
    const { error: reserveError } = await supabase
      .from("phones")
      .update({ status: "reserved" })
      .eq("id", phone_id)
      .eq("status", "available"); // Optimistic lock

    if (reserveError) {
      return NextResponse.json(
        { error: "Failed to reserve phone" },
        { status: 500 }
      );
    }

    // Calculate total with optional delivery fee
    const deliveryFeeCents = fulfillment_type === "delivery" ? DELIVERY_FEE_CENTS : 0;
    const totalCents = phone.price_cents + deliveryFeeCents;

    // Create Sentoo transaction
    let sentooResponse;
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
      sentooResponse = await createTransaction({
        amountCents: totalCents,
        description: `HSO - ${phone.brand} ${phone.model}`.slice(0, 50),
        customerRef: buyer_email,
        returnUrl: `${siteUrl}/payment/return?phone_id=${phone_id}&status=`,
      });
    } catch (err) {
      // Revert reservation on Sentoo failure
      await supabase
        .from("phones")
        .update({ status: "available" })
        .eq("id", phone_id);

      console.error("Sentoo error:", err);
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 502 }
      );
    }

    const txId = sentooResponse.success.message;
    const paymentUrl = sentooResponse.success.data.url;
    const qrCode = sentooResponse.success.data.qr_code;

    // Create order
    const { error: orderError } = await supabase.from("orders").insert({
      phone_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      amount_cents: totalCents,
      fulfillment_type,
      delivery_address: delivery_address?.trim() || null,
      delivery_fee_cents: deliveryFeeCents,
      sentoo_tx_id: txId,
      sentoo_payment_url: paymentUrl,
      sentoo_qr_url: qrCode,
      payment_status: "created",
    });

    if (orderError) {
      // Revert reservation
      await supabase
        .from("phones")
        .update({ status: "available" })
        .eq("id", phone_id);

      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      payment_url: paymentUrl,
      qr_code: qrCode,
    });
  } catch (err) {
    console.error("Payment create error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
