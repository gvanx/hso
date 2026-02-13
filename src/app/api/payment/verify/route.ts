import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchTransactionStatus } from "@/lib/sentoo";
import { sendAllNotifications } from "@/lib/notifications";
import { generateInvoicePdf } from "@/lib/invoice";

export async function GET(request: NextRequest) {
  const phoneId = request.nextUrl.searchParams.get("phone_id");

  if (!phoneId) {
    return NextResponse.json({ error: "Missing phone_id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Find the most recent order for this phone
  const { data: order } = await supabase
    .from("orders")
    .select("*, phone:phones(*)")
    .eq("phone_id", phoneId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!order || !order.sentoo_tx_id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If already finalized, return current status without polling Sentoo
  if (
    order.payment_status === "success" ||
    order.payment_status === "failed" ||
    order.payment_status === "cancelled" ||
    order.payment_status === "expired" ||
    order.payment_status === "manual"
  ) {
    return NextResponse.json({ status: order.payment_status });
  }

  // Poll Sentoo for the real status
  let sentooStatus: string;
  let processorMessage: string | undefined;
  let attemptStatus: string | undefined;
  try {
    const statusResponse = await fetchTransactionStatus(order.sentoo_tx_id);
    sentooStatus = statusResponse.success.message;
    // Extract the latest processor response message (if any)
    const responses = statusResponse.success.data?.responses;
    if (responses && responses.length > 0) {
      const lastAttempt = responses[responses.length - 1];
      processorMessage = lastAttempt.message;

      // Track the latest attempt status separately (don't override transaction status)
      if (sentooStatus === "issued" && lastAttempt.status) {
        const s = lastAttempt.status.toLowerCase();
        if (s === "cancelled" || s === "rejected" || s === "failed") {
          attemptStatus = s;
        }
      }
    }
  } catch (err) {
    console.error("Verify: failed to fetch Sentoo status:", err);
    return NextResponse.json({ status: order.payment_status });
  }

  // Map Sentoo status to our payment_status
  const statusMap: Record<string, string> = {
    success: "success",
    pending: "pending",
    issued: "issued",
    failed: "failed",
    cancelled: "cancelled",
    expired: "expired",
    rejected: "failed",
  };
  const paymentStatus = statusMap[sentooStatus] || sentooStatus;

  // If the transaction is still "issued" but the latest attempt failed/cancelled/rejected,
  // return the attempt status for display but keep the transaction open for retry
  if (paymentStatus === "issued" && attemptStatus) {
    const displayStatus = attemptStatus === "rejected" ? "failed" : attemptStatus;
    return NextResponse.json({
      status: displayStatus,
      retryable: true,
      sentoo_payment_url: order.sentoo_payment_url,
      ...(processorMessage && { processor_message: processorMessage }),
    });
  }

  // No change — return current
  if (paymentStatus === order.payment_status) {
    return NextResponse.json({
      status: paymentStatus,
      ...(processorMessage && { processor_message: processorMessage }),
      // For non-final statuses, include the payment URL for retry
      ...(paymentStatus !== "success" && order.sentoo_payment_url && { sentoo_payment_url: order.sentoo_payment_url }),
    });
  }

  // Update order status
  await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", order.id);

  // Handle success: mark phone as sold, send notifications
  if (paymentStatus === "success" && !order.notifications_sent) {
    await supabase
      .from("phones")
      .update({ status: "sold" })
      .eq("id", order.phone_id);

    let invoiceUrl: string | undefined;
    try {
      const pdfBuffer = await generateInvoicePdf(order, order.phone);
      const fileName = `invoices/${order.id}.pdf`;

      await supabase.storage
        .from("phone-image")
        .upload(fileName, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      const { data: signedUrlData } = await supabase.storage
        .from("phone-image")
        .createSignedUrl(fileName, 60 * 60 * 24 * 7);

      invoiceUrl = signedUrlData?.signedUrl;
    } catch (err) {
      console.error("Invoice generation failed:", err);
    }

    try {
      await sendAllNotifications(order, order.phone, invoiceUrl, order.fulfillment_type);
    } catch (err) {
      console.error("Notification error:", err);
    }

    await supabase
      .from("orders")
      .update({ notifications_sent: true })
      .eq("id", order.id);
  }

  // Handle failed/cancelled/expired: revert phone to available
  if (
    (paymentStatus === "failed" || paymentStatus === "cancelled" || paymentStatus === "expired") &&
    order.phone?.status === "reserved"
  ) {
    await supabase
      .from("phones")
      .update({ status: "available" })
      .eq("id", order.phone_id);
  }

  return NextResponse.json({
    status: paymentStatus,
    ...(processorMessage && { processor_message: processorMessage }),
    // For non-final statuses, include the payment URL for retry
    ...(paymentStatus !== "success" && order.sentoo_payment_url && { sentoo_payment_url: order.sentoo_payment_url }),
  });
}
