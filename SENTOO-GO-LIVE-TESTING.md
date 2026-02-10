# Sentoo Go-Live Testing Checklist

Before moving from sandbox to production, all test scenarios below must pass.
Once complete, confirm to Sentoo that all scenarios have been executed and verified.

---

## Test Scenarios

### TC001 — Successful Payment

**Objective:** Verify the success flow end-to-end.

| Step | Action |
|------|--------|
| 1 | Pick a phone and place an order |
| 2 | On the Sentoo mock screen, select payment attempt status **success** |
| 3 | You are redirected back with `?status=success` |

**Expected:**
- [ ] Order payment status is **success** in the database
- [ ] Phone status is **sold**
- [ ] Customer sees "Payment Successful!" on the return page
- [ ] SMS, email, and WhatsApp notifications are sent
- [ ] Invoice PDF is generated and stored
- [ ] "Continue Shopping" is the primary button (no "Try Again")

---

### TC002 — Pending Payment

**Objective:** Verify the order is NOT finalized while payment is still pending.

| Step | Action |
|------|--------|
| 1 | Pick a phone and place an order |
| 2 | On the Sentoo mock screen, select payment attempt status **pending** |
| 3 | You are redirected back with `?status=pending` |

**Expected:**
- [ ] Order payment status is **pending** (NOT success)
- [ ] Phone status is still **reserved** (not sold)
- [ ] Customer sees "Payment Pending" with a polling spinner
- [ ] No notifications are sent yet
- [ ] "Try Again" button is visible and links to the phone detail page
- [ ] Customer can click "Try Again" to restart the payment

---

### TC003 — Unsuccessful Payment (Cancelled / Rejected)

**Objective:** Verify cancelled and rejected payments are handled correctly.

| Step | Action |
|------|--------|
| 1 | Pick a phone and place an order |
| 2 | On the Sentoo mock screen, select payment attempt status **cancelled** or **rejected** |
| 3 | You are redirected back with `?status=cancelled` or `?status=rejected` |

**Expected:**
- [ ] Order payment status is **cancelled** or **failed**
- [ ] Phone status is reverted to **available**
- [ ] Customer sees "Payment Cancelled" or "Payment Failed"
- [ ] If Sentoo provides a processor response message, it is displayed
- [ ] "Try Again" button is visible and links to the phone detail page
- [ ] Customer can click "Try Again" to restart the payment

---

### TC004 — Asynchronous Success (Pending then Success)

**Objective:** Verify that a payment initially pending can resolve to success asynchronously.

| Step | Action |
|------|--------|
| 1 | Pick a phone and place an order |
| 2 | Copy the payment handle URL (`https://pay.sandbox.sentoo.io/p/<uuid>`) |
| 3 | On the mock screen, select payment attempt status **pending** |
| 4 | You are redirected back with `?status=pending` |
| 5 | Open the payment handle URL from step 2 again |
| 6 | On the mock screen, select payment attempt status **success** |
| 7 | You are redirected back with `?status=success` |

**Expected:**
- [ ] After step 4: customer sees "Payment Pending", "Try Again" button visible
- [ ] After step 4: order is NOT marked as success, phone is still reserved
- [ ] After step 7: order payment status is **success**
- [ ] After step 7: phone status is **sold**
- [ ] Notifications and invoice are sent/generated after success
- [ ] Customer sees "Payment Successful!"

---

### TC005 — URL Status Manipulation

**Objective:** Verify a customer cannot fake a successful payment by editing the URL.

| Step | Action |
|------|--------|
| 1 | Pick a phone and place an order |
| 2 | On the Sentoo mock screen, select payment attempt status **rejected** |
| 3 | You are redirected back with `?status=rejected` |
| 4 | Manually change `?status=rejected` to `?status=success` in the browser URL bar and reload |

**Expected:**
- [ ] Order status is still **failed** (NOT success)
- [ ] Customer sees "Payment Failed" — NOT "Payment Successful"
- [ ] Phone is NOT marked as sold
- [ ] The return page verifies status via backend API, ignoring the URL parameter
- [ ] "Try Again" button is visible

---

## Go-Live Checklist (from Sentoo)

These are the 6 requirements Sentoo verifies before enabling production credentials:

- [ ] **All API endpoints respond with expected payloads** — create transaction and fetch status both return typed responses with error handling
- [ ] **Each transaction status transition is tested** — Pending, Success, Rejected, Expired, Cancelled all handled (TC001–TC005 above)
- [ ] **Webhook endpoint receives and acknowledges async updates (HTTP 200)** — `POST /api/webhooks/sentoo` returns 200 in all paths
- [ ] **Webhook payloads are validated and processed idempotently** — fetches fresh status from Sentoo API, `notifications_sent` flag prevents duplicates
- [ ] **Redirects and return URLs work on desktop and mobile** — test both devices
- [ ] **Error and retry handling is implemented** — reservation rollback, cron revert for stale orders, webhook retry via 500 on transient errors

---

## Additional Manual Checks

- [ ] Test full flow on **mobile browser** (responsive layout, QR code redirect)
- [ ] Test full flow on **desktop browser**
- [ ] Verify **webhook delivery** in Sentoo merchant portal logs
- [ ] Verify **cron job** (`/api/cron/revert-reserved`) reverts stale reservations after 10 minutes
- [ ] Confirm **environment variables** are set for production: `SENTOO_API_URL` (`api.sentoo.io`), `SENTOO_MERCHANT_ID`, `SENTOO_SECRET`
- [ ] Confirm **webhook URL** is registered in Sentoo merchant portal: `https://<production-domain>/api/webhooks/sentoo`
