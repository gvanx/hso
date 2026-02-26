# HSO2 Soft Launch Design

**Date:** 2026-02-26
**Domain:** hso2.connectionscuracao.net
**Purpose:** Launch HSO phone store without Sentoo production API by using direct Sentoo pay links

## Context

The HSO app is fully built with Sentoo API integration, but the production API access hasn't been granted yet. To launch sooner, we deploy a parallel version (HSO2) that uses direct Sentoo payment links (same approach as giftcard.connectionscuracao.net) instead of the API.

When the production API is approved, the original HSO goes live at hso.connectionscuracao.net with full automated payment/webhook support.

## Architecture

Fork the HSO repo. Replace API-based payment with direct Sentoo links + WhatsApp confirmation. Deploy to hso2.connectionscuracao.net on Netlify.

### Payment Flow (before vs after)

**Current HSO (API-based):**
1. Customer clicks Buy
2. Backend calls Sentoo API to create transaction
3. Customer redirected to Sentoo checkout
4. Sentoo webhook fires on payment → auto-updates order/phone status
5. Cron reverts stale reservations

**HSO2 (direct links):**
1. Customer clicks Buy
2. Checkout form: name, WhatsApp/email
3. Client generates order ID (`HSO2-[timestamp]-[random]`)
4. Opens `https://sentoo.pro/connections-curacao/[price_in_cents]` in new tab
5. Shows confirmation page with WhatsApp confirm button (pre-filled message)
6. Email notification sent to admin
7. Admin manually marks phone as sold

### What Changes

- **Remove:** `/api/payment/` (Sentoo API transaction creation)
- **Remove:** `/api/webhooks/sentoo` (webhook handler)
- **Remove:** `/api/cron/revert-reserved` (auto-revert)
- **Remove:** Order reservation logic (phone stays "available" until manual update)
- **Add:** Direct Sentoo pay link generation (client-side, price * 100 for cents)
- **Add:** WhatsApp confirmation step with pre-filled order message
- **Add:** EmailJS or Resend notification to admin on checkout
- **Add:** "Reopen Sentoo" button on confirmation page

### What Stays

- Phone catalog UI (browse, filter, search, sort)
- Admin CRM (manage phones, upload images)
- Supabase database (phones table, phone-images storage)
- i18n (EN, ES, PAP, NL)
- Responsive design
- PDF invoice generation

### Config

```
sentooBaseUrl: "https://sentoo.pro/connections-curacao"
whatsappNumber: "59994618989"
```

### Deployment

- New Netlify site for hso2.connectionscuracao.net
- Same Supabase project (ngzxrygvotftmpgmzmcy)
- Separate GitHub repo or branch

## Order Message Format

```
Hi Connections!
Order: HSO2-ABC123-45
Phone: Samsung Galaxy A15 - Black
Price: NAf 450.00
Name: John Doe
Delivery: Pickup / Delivery
Contact: +5999XXXXXXX
Payment: Sentoo
```

## Risk

- No automated payment verification (manual confirm via WhatsApp)
- Phone could theoretically be "bought" by two people simultaneously (low risk for phone store volume)
- Mitigated by admin monitoring WhatsApp notifications promptly
