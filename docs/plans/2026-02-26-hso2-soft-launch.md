# HSO2 Soft Launch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Sentoo API payment flow with direct Sentoo pay links so HSO can launch immediately without production API access. Deploy to hso2.connectionscuracao.net.

**Architecture:** Fork the existing HSO Next.js app. Replace the server-side Sentoo API integration (create transaction + webhooks) with client-side direct pay links (`https://sentoo.pro/connections-curacao/[cents]`). Add WhatsApp order confirmation step. Keep Supabase catalog + admin CRM intact. No phone reservation — phones stay "available" until manually marked sold.

**Tech Stack:** Next.js 16, React 19, Supabase, Sentoo direct links, EmailJS or Resend for notifications, Netlify deployment.

---

### Task 1: Create HSO2 branch and add config constants

**Files:**
- Modify: `src/lib/constants.ts`

**Step 1: Create a new branch from main**

```bash
cd /home/ganesh/hso
git checkout -b hso2-soft-launch
```

**Step 2: Add Sentoo direct link config to constants**

In `src/lib/constants.ts`, add:

```typescript
export const DELIVERY_FEE_CENTS = 3500;

// HSO2 soft-launch: direct Sentoo pay links (no API)
export const SENTOO_BASE_URL = "https://sentoo.pro/connections-curacao";
export const WHATSAPP_NUMBER = "59994618989";
export const STORE_NAME = "Connections";
```

**Step 3: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat: add Sentoo direct link and WhatsApp constants for HSO2"
```

---

### Task 2: Replace CheckoutForm with direct pay link flow

**Files:**
- Modify: `src/components/CheckoutForm.tsx`

**Step 1: Rewrite CheckoutForm to use direct Sentoo links**

Replace the entire `CheckoutForm.tsx` with a version that:
- Keeps the same form fields (name, email, phone, fulfillment toggle, delivery address)
- On submit: generates a client-side order ID (`HSO2-[timestamp]-[random]`)
- Opens `https://sentoo.pro/connections-curacao/[totalCents]` in a new tab
- Shows a confirmation page with:
  - "Reopen Sentoo" button (link to pay URL)
  - Pre-filled WhatsApp message button
  - Order summary

```typescript
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
} from "@/lib/constants";
import {
  CreditCard,
  Store,
  Truck,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Copy,
} from "lucide-react";

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 100);
  return `HSO2-${ts}-${rand}`;
}

export function CheckoutForm({ phone }: { phone: Phone }) {
  const t = useTranslations("checkoutForm");
  const tc = useTranslations("common");
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const [orderData, setOrderData] = useState<{
    orderId: string;
    payLink: string;
    waLink: string;
    message: string;
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

    const orderId = generateOrderId();
    const payLink = `${SENTOO_BASE_URL}/${totalCents}`;

    const lines = [
      `Hi ${STORE_NAME}!`,
      `Order: ${orderId}`,
      `Phone: ${phone.brand} ${phone.model}${phone.storage_gb ? ` ${phone.storage_gb}GB` : ""}${phone.color ? ` - ${phone.color}` : ""}`,
      `Price: ${formatCurrency(totalCents)}`,
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Contact: ${formData.phone}`,
      `Fulfillment: ${fulfillmentType === "delivery" ? "Delivery" : "Store Pickup"}`,
      ...(fulfillmentType === "delivery" && formData.deliveryAddress
        ? [`Address: ${formData.deliveryAddress}`]
        : []),
      `Payment: Sentoo`,
    ];

    const message = lines.join("\n");
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Open Sentoo payment in new tab
    window.open(payLink, "_blank");

    setOrderData({ orderId, payLink, waLink, message });
  }

  async function copyMessage() {
    if (!orderData) return;
    await navigator.clipboard.writeText(orderData.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Confirmation screen after checkout
  if (orderData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t("completePayment")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("paymentInstructions", {
              amount: formatCurrency(totalCents),
              model: phone.model,
            })}
          </p>

          <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-mono text-xs">{orderData.orderId}</span>
            </div>
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

          <Button asChild className="w-full" variant="outline">
            <a href={orderData.payLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Reopen Sentoo Payment
            </a>
          </Button>

          <div className="relative">
            <textarea
              readOnly
              value={orderData.message}
              rows={8}
              className="w-full rounded-lg border bg-muted/30 p-3 text-xs font-mono resize-none"
            />
            <button
              onClick={copyMessage}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-background border hover:bg-muted"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            {copied && (
              <span className="absolute top-2 right-10 text-xs text-green-600">
                Copied!
              </span>
            )}
          </div>

          <Button asChild className="w-full" size="lg">
            <a href={orderData.waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />
              Confirm on WhatsApp
            </a>
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            After paying, send the order details on WhatsApp to confirm your purchase.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Checkout form (same fields, no API call)
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
```

**Step 2: Commit**

```bash
git add src/components/CheckoutForm.tsx
git commit -m "feat: replace API payment with direct Sentoo pay links and WhatsApp confirmation"
```

---

### Task 3: Remove phone availability check from checkout page

**Files:**
- Modify: `src/app/checkout/[id]/page.tsx`

**Step 1: Remove the `status !== "available"` block**

Since we're not reserving phones, the availability check on the checkout page should be relaxed. Keep the check but only block "sold" phones, not "reserved" ones (since reservations are no longer used):

In `src/app/checkout/[id]/page.tsx`, change line 31 from:
```typescript
if (phone.status !== "available") {
```
to:
```typescript
if (phone.status === "sold") {
```

This allows "available" and "reserved" (legacy) phones to be purchased.

**Step 2: Commit**

```bash
git add src/app/checkout/[id]/page.tsx
git commit -m "feat: allow checkout for non-sold phones (no reservation in HSO2)"
```

---

### Task 4: Remove API payment routes

**Files:**
- Delete: `src/app/api/payment/create/route.ts`
- Delete: `src/app/api/payment/verify/route.ts`
- Delete: `src/app/api/webhooks/sentoo/route.ts`
- Delete: `src/app/api/cron/revert-reserved/route.ts`
- Delete: `src/lib/sentoo.ts`

**Step 1: Remove the files**

```bash
cd /home/ganesh/hso
rm -f src/app/api/payment/create/route.ts
rm -f src/app/api/payment/verify/route.ts
rm -rf src/app/api/webhooks/
rm -rf src/app/api/cron/
rm -f src/lib/sentoo.ts
```

**Step 2: Remove empty directories**

```bash
rmdir src/app/api/payment 2>/dev/null || true
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: remove Sentoo API routes, webhook, cron, and sentoo lib for HSO2"
```

---

### Task 5: Remove unused dependencies (sentoo, twilio)

**Files:**
- Modify: `src/lib/notifications.ts`

**Step 1: Simplify notifications**

Since there's no automated payment flow triggering notifications, and we don't need Twilio for this version, simplify `notifications.ts` to keep only the Resend-based store notification (admin gets emailed when an order is placed). However, since the checkout is now client-side only, we need a different approach.

**Decision:** For HSO2, notifications come via WhatsApp (the customer sends the message). The store notification email is no longer triggered by a webhook. We can remove `notifications.ts` for HSO2 since the WhatsApp message IS the notification.

```bash
# notifications.ts is no longer called by any route in HSO2
# But keep it for the admin to reference later — just don't import it anywhere
```

Actually — check if any other file imports `notifications.ts`. If only the deleted payment/webhook routes imported it, it's already dead code and safe to leave.

**Step 2: Verify build still works**

```bash
cd /home/ganesh/hso
npm run build
```

Fix any import errors from the deleted files.

**Step 3: Commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve build errors from removed API routes"
```

---

### Task 6: Update Netlify config for hso2 deployment

**Files:**
- Modify: `netlify.toml`

**Step 1: No changes needed to netlify.toml itself**

The `netlify.toml` is fine as-is. The new Netlify site will use the same build config.

**Step 2: Create new Netlify site for hso2**

```bash
# If netlify CLI is available:
cd /home/ganesh/hso
npx netlify-cli sites:create --name hso2-connectionscuracao
# Or create manually in Netlify dashboard

# Set environment variables on the new site:
# NEXT_PUBLIC_SUPABASE_URL = (same as HSO)
# NEXT_PUBLIC_SUPABASE_ANON_KEY = (same as HSO)
# RESEND_API_KEY = (same as HSO, for admin emails if added later)
# No SENTOO_* vars needed!
# No TWILIO_* vars needed!
```

**Step 3: Connect domain**

In Netlify dashboard: Domain settings → add `hso2.connectionscuracao.net`
In DNS (wherever connectionscuracao.net is managed): add CNAME for `hso2` pointing to Netlify.

**Step 4: Deploy**

```bash
git push origin hso2-soft-launch
# Connect branch in Netlify or deploy manually
```

**Step 5: Commit any config changes**

```bash
git add -A
git commit -m "chore: configure for hso2 deployment"
```

---

### Task 7: Verify and test

**Step 1: Run build locally**

```bash
cd /home/ganesh/hso
npm run build
```

Expected: No errors.

**Step 2: Run dev server and test checkout flow**

```bash
npm run dev
```

- Browse to phone catalog
- Click "Buy" on a phone
- Fill in checkout form
- Verify Sentoo link opens in new tab with correct amount
- Verify WhatsApp confirmation button works with correct pre-filled message
- Verify "Reopen Sentoo" button works
- Verify admin CRM still works

**Step 3: Push and deploy**

```bash
git push origin hso2-soft-launch
```

---

## Summary of changes

| What | Before (HSO) | After (HSO2) |
|------|---------------|---------------|
| Payment | Sentoo API (server-side) | Direct pay link (client-side) |
| Reservation | Auto-reserve on buy | No reservation |
| Webhooks | Sentoo webhook for status | None |
| Confirmation | Auto via webhook | Manual via WhatsApp |
| Order tracking | Supabase orders table | WhatsApp message |
| Notifications | Resend + Twilio (server) | WhatsApp (customer-initiated) |
| Cron | Revert stale reservations | None |
| Catalog/Admin | Supabase + Next.js | Unchanged |
| Domain | hso.connectionscuracao.net | hso2.connectionscuracao.net |
