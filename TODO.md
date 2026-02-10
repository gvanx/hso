# HSO - Todo List

## Completed
- [x] Next.js 15 project setup with Tailwind + shadcn/ui
- [x] Supabase: database tables, RLS policies, triggers, storage bucket
- [x] Admin CRM: login, dashboard, phone CRUD, image upload, orders table
- [x] Public storefront: homepage, catalog with search/filter/sort, phone detail
- [x] Payment flow: checkout page, Sentoo API integration (XCG currency)
- [x] Webhook handler + manual mark-sold API
- [x] Notification system (SMS, email, WhatsApp) + PDF invoice generation
- [x] Deployed to Netlify at hso.connectionscuracao.net
- [x] Sentoo sandbox: domain whitelisted, payment creation working

## To Do

### High Priority
- [ ] **Set Sentoo webhook URL** in sandbox portal to `https://hso.connectionscuracao.net/api/webhooks/sentoo`
- [ ] **Test full payment flow** on live site (create payment → complete in sandbox → verify webhook fires → phone marked sold)
- [x] **Test failed/cancelled payment** — verify phone reverts to available
- [ ] **Set up Twilio** for SMS + WhatsApp notifications (need account + phone numbers)
- [ ] **Set up Resend** for email notifications (need API key + verify domain)

### Medium Priority
- [ ] **Sentoo production credentials** — switch from sandbox to production when ready to go live
- [ ] **Custom domain SSL** — verify hso.connectionscuracao.net has proper HTTPS (needed for Sentoo webhook)
- [ ] **Phone delete protection** — show better error when trying to delete a phone that has orders
- [ ] **Payment return page** — currently redirects to hso.connectionscuracao.net which shows status, but test the actual redirect flow end-to-end
- [ ] **Double-purchase test** — verify second buyer sees "reserved" and can't buy same phone

### Low Priority / Nice to Have
- [ ] **Admin: bulk actions** — mark multiple phones as sold/available
- [ ] **Storefront: pagination** — if inventory grows large
- [ ] **SEO: meta tags** — per-phone open graph tags for sharing
- [ ] **Analytics** — track page views, conversion rates
- [x] **Expiry handling** — auto-revert reserved phones after 10 min via cron (cron-job.org every 5 min)

## Environment Variables Still Needed
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=
RESEND_API_KEY=
```
Add these in both `.env.local` (local dev) and Netlify dashboard (production).

## Key URLs
- **Live site:** https://hso.connectionscuracao.net
- **Admin:** https://hso.connectionscuracao.net/admin
- **Sentoo sandbox portal:** https://portal.sandbox.sentoo.io
- **Supabase dashboard:** https://supabase.com/dashboard/project/ngzxrygvotftmpgmzmcy
- **GitHub repo:** https://github.com/gvanx/hso

## Notes
- Currency must be **XCG** (not ANG) — Sentoo returns 402 with ANG
- Storage bucket is named **phone-image** (not phone-images)
- Sentoo webhook sends `application/x-www-form-urlencoded` with `transaction_id` field
- Webhook must return `{"success": true}` with status 200 to stop retries
