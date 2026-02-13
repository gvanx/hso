import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchTransactionStatus } from "@/lib/sentoo";
import { sendAllNotifications } from "@/lib/notifications";
import { generateInvoicePdf } from "@/lib/invoice";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let transactionId: string | null = null;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      transactionId = formData.get("transaction_id") as string;
    } else {
      const body = await request.json().catch(() => null);
      transactionId = body?.transaction_id;
    }

    // Strip quotes if present (Sentoo sometimes sends quoted strings)
    if (transactionId) {
      transactionId = transactionId.replace(/^"|"$/g, "");
    }

    if (!transactionId) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const supabase = createAdminClient();

    // Find order by transaction ID
    const { data: order } = await supabase
      .from("orders")
      .select("*, phone:phones(*)")
      .eq("sentoo_tx_id", transactionId)
      .single();

    if (!order) {
      // Unknown transaction - still return success to stop retries
      console.warn(`Webhook: unknown transaction ${transactionId}`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Fetch actual status from Sentoo API (never trust webhook payload)
    let sentooStatus: string;
    try {
      const statusResponse = await fetchTransactionStatus(transactionId);
      sentooStatus = statusResponse.success.message;
    } catch (err) {
      console.error("Failed to fetch Sentoo status:", err);
      // Return non-200 so Sentoo retries
      return NextResponse.json(
        { error: "Status fetch failed" },
        { status: 500 }
      );
    }

    // Map Sentoo transaction-level status to our payment_status
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

    // If the transaction is still "issued", individual attempts may have
    // failed/cancelled/rejected but the transaction remains open for retry.
    // Don't update the order to a terminal status — keep it as "issued".
    if (paymentStatus === "issued" && order.payment_status !== "issued") {
      await supabase
        .from("orders")
        .update({ payment_status: "issued" })
        .eq("id", order.id);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (paymentStatus === "issued") {
      // Already "issued" — nothing to change
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Update order payment status for final statuses
    await supabase
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", order.id);

    // Handle success: mark phone as sold, send notifications
    if (paymentStatus === "success" && !order.notifications_sent) {
      // Mark phone as sold
      await supabase
        .from("phones")
        .update({ status: "sold" })
        .eq("id", order.phone_id);

      // Generate invoice and send notifications
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
          .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

        invoiceUrl = signedUrlData?.signedUrl;
      } catch (err) {
        console.error("Invoice generation failed:", err);
      }

      // Send all notifications (non-blocking)
      try {
        await sendAllNotifications(order, order.phone, invoiceUrl, order.fulfillment_type);
      } catch (err) {
        console.error("Notification error:", err);
      }

      // Mark notifications as sent (idempotency)
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    // Return success to prevent infinite retries for unrecoverable errors
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
