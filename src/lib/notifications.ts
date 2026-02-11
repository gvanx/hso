import twilio from "twilio";
import { Resend } from "resend";
import type { Order, Phone } from "./types";

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const resend =
  process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function formatCurrency(cents: number): string {
  return `XCG ${(cents / 100).toFixed(2)}`;
}

export async function sendSMS(order: Order, phone: Phone) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn("Twilio not configured, skipping SMS");
    return;
  }

  await twilioClient.messages.create({
    body: `HSO: Your purchase of ${phone.model} for ${formatCurrency(order.amount_cents)} is confirmed! Order #${order.id.slice(0, 8)}. Thank you!`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: order.buyer_phone,
  });
}

export async function sendEmail(
  order: Order,
  phone: Phone,
  invoiceUrl?: string,
  fulfillmentType?: "pickup" | "delivery"
) {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return;
  }

  const invoiceButton = invoiceUrl
    ? `<a href="${invoiceUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Download Invoice</a>`
    : "";

  await resend.emails.send({
    from: "HSO <noreply@connectionscuracao.net>",
    to: [order.buyer_email],
    subject: `Order Confirmed - ${phone.model}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Order Confirmed</h1>
        <p>Hi ${order.buyer_name},</p>
        <p>Your purchase has been confirmed!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Phone:</strong> ${phone.model}${phone.storage_gb ? ` ${phone.storage_gb >= 1024 ? `${phone.storage_gb / 1024}TB` : `${phone.storage_gb}GB`}` : ""}</p>
          <p style="margin: 0 0 8px;"><strong>Color:</strong> ${phone.color || "N/A"}</p>
          <p style="margin: 0 0 8px;"><strong>Grade:</strong> ${phone.grade || "N/A"}</p>
          <p style="margin: 0 0 8px;"><strong>Amount:</strong> ${formatCurrency(order.amount_cents)}</p>
          <p style="margin: 0;"><strong>Order ID:</strong> ${order.id.slice(0, 8)}</p>
        </div>
        ${invoiceButton}
        <p>${fulfillmentType === "delivery" ? "We will arrange delivery to your provided address." : "Please visit our store to pick up your phone. Bring this email as your receipt."}</p>
        <p>Thank you for shopping with HSO!</p>
      </div>
    `,
  });
}

export async function sendWhatsApp(
  order: Order,
  phone: Phone,
  invoiceUrl?: string
) {
  if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
    console.warn("Twilio WhatsApp not configured, skipping");
    return;
  }

  const messageOpts: {
    body: string;
    from: string;
    to: string;
    mediaUrl?: string[];
  } = {
    body: `HSO: Your purchase of ${phone.model} for ${formatCurrency(order.amount_cents)} is confirmed! Order #${order.id.slice(0, 8)}.`,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${order.buyer_phone}`,
  };

  if (invoiceUrl) {
    messageOpts.mediaUrl = [invoiceUrl];
  }

  await twilioClient.messages.create(messageOpts);
}

export async function sendAllNotifications(
  order: Order,
  phone: Phone,
  invoiceUrl?: string,
  fulfillmentType?: "pickup" | "delivery"
) {
  const results = await Promise.allSettled([
    sendEmail(order, phone, invoiceUrl, fulfillmentType),
    // sendSMS(order, phone),       // TODO: enable when Twilio SMS is verified
    // sendWhatsApp(order, phone, invoiceUrl), // TODO: enable when WhatsApp Business is set up
  ]);

  results.forEach((result, i) => {
    const names = ["Email"];
    if (result.status === "rejected") {
      console.error(`Failed to send ${names[i]}:`, result.reason);
    }
  });
}
