"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Phone } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  DELIVERY_FEE_CENTS,
  SENTOO_BASE_URL,
  WHATSAPP_NUMBER,
  STORE_NAME,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from "@/lib/constants";
import emailjs from "@emailjs/browser";
import {
  CreditCard,
  Store,
  Truck,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Copy,
} from "lucide-react";

export function CheckoutForm({ phone }: { phone: Phone }) {
  const t = useTranslations("checkoutForm");
  const tc = useTranslations("common");
  const [fulfillmentType, setFulfillmentType] = useState<
    "pickup" | "delivery"
  >("pickup");
  const [confirmed, setConfirmed] = useState<{
    orderId: string;
    payLink: string;
    waLink: string;
    waMessage: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryAddress: "",
  });

  const deliveryFee = fulfillmentType === "delivery" ? DELIVERY_FEE_CENTS : 0;
  const totalCents = phone.price_cents + deliveryFee;

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const orderId = `HSO2-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 100)}`;
    const payLink = `${SENTOO_BASE_URL}/${totalCents}`;

    const fulfillmentLabel =
      fulfillmentType === "pickup" ? "Store Pickup" : "Delivery";

    const messageParts = [
      `Hi ${STORE_NAME}!`,
      `Order: ${orderId}`,
      `Phone: ${phone.brand} ${phone.model}${phone.storage_gb ? ` ${phone.storage_gb}GB` : ""}${phone.color ? ` - ${phone.color}` : ""}`,
      `Price: ${formatCurrency(totalCents)}`,
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Contact: ${formData.phone}`,
      `Fulfillment: ${fulfillmentLabel}`,
    ];

    if (fulfillmentType === "delivery" && formData.deliveryAddress) {
      messageParts.push(`Address: ${formData.deliveryAddress}`);
    }

    messageParts.push("Payment: Sentoo");

    const waMessage = messageParts.join("\n");
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    window.open(payLink, "_blank");

    // Send admin email notification via EmailJS (fire and forget)
    const phoneDesc = `${phone.brand} ${phone.model}${phone.storage_gb ? ` ${phone.storage_gb}GB` : ""}${phone.color ? ` - ${phone.color}` : ""}`;
    emailjs
      .send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          whatsapp: formData.phone,
          product: phoneDesc,
          type: "SENTOO",
          amount: formatCurrency(totalCents),
          delivery: fulfillmentLabel,
          orderId,
        },
        EMAILJS_PUBLIC_KEY
      )
      .catch(() => {});

    setConfirmed({ orderId, payLink, waLink, waMessage });
  }

  function handleCopy() {
    if (!confirmed) return;
    navigator.clipboard.writeText(confirmed.waMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (confirmed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            {t("completePayment")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {t("paymentInstructions", {
              amount: formatCurrency(totalCents),
              model: phone.model,
            })}
          </p>

          {/* Order summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-medium">
                {confirmed.orderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{phone.model}</span>
              <span>{formatCurrency(phone.price_cents)}</span>
            </div>
            {fulfillmentType === "delivery" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("deliveryFee")}
                </span>
                <span>{formatCurrency(DELIVERY_FEE_CENTS)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>{tc("total")}</span>
              <span>{formatCurrency(totalCents)}</span>
            </div>
          </div>

          {/* Reopen Sentoo payment */}
          <Button variant="outline" asChild className="w-full">
            <a
              href={confirmed.payLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Reopen Sentoo Payment
            </a>
          </Button>

          {/* WhatsApp message preview */}
          <div className="space-y-2">
            <div className="relative">
              <Textarea
                readOnly
                value={confirmed.waMessage}
                rows={10}
                className="resize-none pr-12 text-sm font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied && (
                <span className="absolute top-2 right-12 text-xs text-green-600 font-medium">
                  Copied!
                </span>
              )}
            </div>
          </div>

          {/* Confirm on WhatsApp */}
          <Button asChild size="lg" className="w-full">
            <a
              href={confirmed.waLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Confirm on WhatsApp
            </a>
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            After paying, send the order details on WhatsApp to confirm your
            purchase.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("yourInformation")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fulfillment type toggle */}
          <div className="space-y-2">
            <Label>{t("fulfillmentMethod")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFulfillmentType("pickup")}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  fulfillmentType === "pickup"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted hover:border-muted-foreground/30"
                }`}
              >
                <Store className="h-4 w-4" />
                {t("storePickup")}
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType("delivery")}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  fulfillmentType === "delivery"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted hover:border-muted-foreground/30"
                }`}
              >
                <Truck className="h-4 w-4" />
                {t("delivery", { fee: formatCurrency(DELIVERY_FEE_CENTS) })}
              </button>
            </div>
          </div>

          {/* Delivery address */}
          {fulfillmentType === "delivery" && (
            <div className="space-y-2">
              <Label htmlFor="delivery-address">{t("deliveryAddress")}</Label>
              <Textarea
                id="delivery-address"
                required
                value={formData.deliveryAddress}
                onChange={(e) => updateField("deliveryAddress", e.target.value)}
                placeholder={t("deliveryPlaceholder")}
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t("fullName")}</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={t("namePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder={t("emailPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyer-phone">{t("phoneNumber")}</Label>
            <Input
              id="buyer-phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder={t("phonePlaceholder")}
            />
          </div>

          {/* Price breakdown */}
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{phone.model}</span>
              <span>{formatCurrency(phone.price_cents)}</span>
            </div>
            {fulfillmentType === "delivery" && (
              <div className="flex justify-between">
                <span>{t("deliveryFee")}</span>
                <span>{formatCurrency(DELIVERY_FEE_CENTS)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-1 mt-1">
              <span>{tc("total")}</span>
              <span>{formatCurrency(totalCents)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <CreditCard className="h-4 w-4 mr-2" />
            {t("pay", { amount: formatCurrency(totalCents) })}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
