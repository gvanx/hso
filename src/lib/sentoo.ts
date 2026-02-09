import { SentooCreateResponse, SentooStatusResponse } from "./types";

const SENTOO_API_URL = process.env.SENTOO_API_URL!;
const SENTOO_MERCHANT_ID = process.env.SENTOO_MERCHANT_ID!;
const SENTOO_SECRET = process.env.SENTOO_SECRET!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export async function createTransaction(opts: {
  amountCents: number;
  description: string;
  customerRef?: string;
}): Promise<SentooCreateResponse> {
  const body = new URLSearchParams({
    sentoo_merchant: SENTOO_MERCHANT_ID,
    sentoo_amount: String(opts.amountCents),
    sentoo_description: opts.description.slice(0, 50),
    sentoo_currency: "XCG",
    sentoo_return_url: `${SITE_URL}/payment/return?status=`,
  });

  if (opts.customerRef) {
    body.set("sentoo_customer", opts.customerRef);
  }

  const res = await fetch(`${SENTOO_API_URL}/v1/payment/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-SENTOO-SECRET": SENTOO_SECRET,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sentoo create failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function fetchTransactionStatus(
  transactionId: string
): Promise<SentooStatusResponse> {
  const res = await fetch(
    `${SENTOO_API_URL}/v1/payment/status/${SENTOO_MERCHANT_ID}/${transactionId}`,
    {
      headers: { "X-SENTOO-SECRET": SENTOO_SECRET },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sentoo status fetch failed (${res.status}): ${text}`);
  }

  return res.json();
}
