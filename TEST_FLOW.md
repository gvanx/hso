# HSO Test Flow

## 1. Happy Path - Successful Purchase (Pickup)

1. Browse `/phones` - verify only available phones are shown
2. Click a phone to view details (`/phones/{id}`)
3. Click **Buy Now** - redirects to `/checkout/{id}`
4. Select **Pickup**, fill in name, email, phone number
5. Submit - payment modal appears with QR code and "Pay with Sentoo" link
6. Complete payment on Sentoo
7. Redirected to `/payment/return` - polling spinner shows
8. Status resolves to **Payment Successful!**
9. Buyer receives confirmation email with invoice PDF attached
10. Store receives notification email at info@connectionscuracao.net
11. Phone status changes to **sold** (no longer visible on `/phones`)
12. Order appears in `/admin/orders` with status **success**

---

## 2. Happy Path - Successful Purchase (Delivery)

1. Same as above but select **Delivery**
2. Verify delivery fee (XCG 35.00) appears in order summary
3. Fill in delivery address (required)
4. Complete payment
5. Confirmation email mentions delivery
6. Invoice PDF includes delivery fee line item
7. Order in admin shows fulfillment type **delivery**

---

## 3. Payment Retry Flow (Failed / Cancelled / Rejected)

> This is the updated flow per Sentoo feedback - same Transaction UID is reused.

1. Start checkout and create payment
2. On Sentoo payment page, **cancel** or let it **fail**
3. Redirected to `/payment/return`
4. Status shows **Payment Cancelled** (or Failed)
5. **"Try Again" button** is visible - links to the **same Sentoo payment URL** (same Transaction UID)
6. Click "Try Again" - goes back to Sentoo payment page for the same transaction
7. Complete payment this time
8. Redirected back to `/payment/return` - status resolves to **Payment Successful!**
9. Notifications sent, phone marked sold

**Verify:**
- The Transaction UID stays the same across retries (check in Sentoo dashboard)
- Phone remains **reserved** during retries (not reverted to available)
- No duplicate orders created - same order record is updated
- Processor error message is displayed on the return page if available

---

## 4. Payment Expired Flow

1. Start checkout and create payment
2. Let the Sentoo transaction **expire** (do not pay)
3. Return page shows **Payment Expired**
4. **"Start New Payment"** button is shown (NOT the retry button)
5. Clicking it goes to `/phones/{id}` to start a new checkout
6. Phone is reverted to **available**

---

## 5. Webhook Processing

1. Complete a payment on Sentoo
2. Sentoo sends POST webhook to `/api/webhooks/sentoo`
3. Webhook accepts `application/x-www-form-urlencoded` with `transaction_id`
4. System fetches real status from Sentoo API (never trusts webhook payload)
5. On success: phone marked sold, invoice generated, notifications sent
6. On expired/failed/cancelled (transaction-level): phone reverted to available

**Verify:**
- Webhook returns 200 for known and unknown transactions
- Duplicate webhooks don't send duplicate notifications (idempotent via `notifications_sent` flag)
- Webhook with quoted `transaction_id` (e.g. `"abc123"`) is handled correctly

---

## 6. Payment Status Accuracy

> Previously, attempt-level statuses were overriding transaction-level status. This is now fixed.

1. Create a transaction
2. Make a payment attempt that gets **cancelled** at the processor level
3. Check Sentoo API - transaction should still be **issued** (open)
4. Our system should show **cancelled** for display but the transaction remains open for retry
5. The order in our database stays as **issued** or **created** (NOT updated to cancelled)
6. Phone stays **reserved** (NOT reverted to available)

**Verify:**
- `/api/payment/verify` returns `retryable: true` + `sentoo_payment_url` when transaction is issued but attempt failed
- The order `payment_status` in the database is NOT changed to a terminal status while the transaction is still open

---

## 7. Concurrent Checkout Protection

1. Open two browser tabs on the same phone detail page
2. Click **Buy Now** on both tabs
3. Fill in checkout forms on both
4. Submit the first one - succeeds, phone becomes **reserved**
5. Submit the second one - fails with **"Phone is no longer available"** (409)

---

## 8. Stale Reservation Cleanup

1. Start checkout (phone becomes reserved)
2. Abandon payment (close browser, don't pay)
3. Wait >10 minutes (or trigger manually via admin **Cleanup Reserved** button)
4. System checks Sentoo for each stale reservation:
   - If payment actually succeeded on Sentoo: mark phone as **sold**
   - If not: revert phone to **available**, mark order as **expired**
5. Phone becomes available for other buyers

---

## 9. Admin - Phone Management

1. **Add phone**: `/admin/phones/new` - fill in brand, model, price, upload images
2. **Edit phone**: `/admin/phones/{id}/edit` - modify fields, change status
3. **Delete phone**: from phones table dropdown menu (confirmation required)
4. **Cancel reservation**: dropdown menu on reserved phones - reverts to available
5. **Mark as sold**: dropdown menu on available phones - for walk-in sales

---

## 10. Admin - Order Management

1. View all orders at `/admin/orders`
2. Orders show: phone info, buyer info, fulfillment type, amount, payment status, date
3. **Mark as Manual**: for orders that were paid outside Sentoo (walk-in sales)
   - Updates payment status to **manual**
   - Marks phone as **sold**

---

## 11. Admin - Dashboard

1. `/admin` shows stats: Total Phones, Available, Sold, Revenue
2. Revenue counts only **success** and **manual** payment statuses
3. All counts update in real-time after changes

---

## 12. Invoice Verification

1. After successful payment, invoice PDF is generated
2. Invoice includes:
   - Connections Punda business details (KVK, CRIB)
   - Buyer details (name, email, phone, address if delivery)
   - Phone details (brand, model, color, storage, grade, reference)
   - Price breakdown: subtotal, OB 6% tax, delivery fee (if applicable), total
   - Warranty information (if applicable)
3. Invoice is uploaded to Supabase storage with 7-day signed URL
4. Invoice link is included in buyer email and store notification email

---

## 13. Warranty Display

1. Phones with warranty show warranty info on detail page
2. Warranty types: **Standard 3 Months**, **3 Months + Apple Warranty**, or custom text
3. Warranty info appears on invoice PDF
4. Warranty info included in store notification email

---

## 14. Edge Cases

- **Phone with no images**: placeholder icon shown instead of image
- **Long phone description**: pre-wrap formatting preserved
- **Price with cents**: XCG formatting correct (e.g., XCG 1,250.50)
- **Empty inventory**: phones page shows no results gracefully
- **Search filters**: search works on brand AND model, case-insensitive
- **Pagination**: works correctly at boundaries (12, 24, 36 items)
- **Sentoo API down**: payment creation returns 502, phone reservation is reverted
- **Notification failure**: non-blocking - payment still succeeds even if email fails
