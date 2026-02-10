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
- [x] Set Sentoo webhook URL in sandbox portal
- [x] Full payment flow tested end-to-end (create → pay → webhook → phone sold)
- [x] Failed/cancelled payment reverts phone to available
- [x] Custom domain SSL verified (Let's Encrypt on hso.connectionscuracao.net)
- [x] Payment return page tested
- [x] Double-purchase protection (reserved phones can't be bought by second buyer)
- [x] Admin phone actions: cancel reservation, mark as sold (walk-in)
- [x] Auto-revert stale reservations after 10 min via cron (cron-job.org every 5 min)
- [x] Admin cleanup reservations button

## To Do

### High Priority
- [ ] **Set up Twilio** for SMS + WhatsApp notifications (need account + phone numbers)
- [ ] **Set up Resend** for email notifications (need API key + verify domain)
- [ ] **Sentoo production credentials** — switch from sandbox to production when ready to go live

### Medium Priority
- [ ] **Phone delete protection** — show better error when trying to delete a phone that has orders
- [ ] **Admin: bulk actions** — mark multiple phones as sold/available

### Low Priority / Nice to Have
- [x] **Storefront: pagination** — 12 per page with Prev/Next controls
- [x] **SEO: meta tags** — OG + Twitter Card on all pages, dynamic for phone detail
- [x] **Analytics** — Google Analytics via NEXT_PUBLIC_GA_MEASUREMENT_ID env var

## Environment Variables Still Needed
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=
RESEND_API_KEY=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
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
