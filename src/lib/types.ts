export interface Phone {
  id: string;
  model: string;
  brand: string;
  price_cents: number;
  color: string | null;
  battery_pct: number | null;
  reference: string | null;
  grade: string | null;
  description: string | null;
  images: string[];
  status: "available" | "reserved" | "sold";
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  phone_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  amount_cents: number;
  sentoo_tx_id: string | null;
  sentoo_payment_url: string | null;
  sentoo_qr_url: string | null;
  payment_status:
    | "created"
    | "issued"
    | "pending"
    | "success"
    | "failed"
    | "cancelled"
    | "expired"
    | "manual";
  notifications_sent: boolean;
  created_at: string;
  updated_at: string;
  phone?: Phone;
}

export interface SentooCreateResponse {
  success: {
    code: number;
    message: string;
    data: {
      url: string;
      qr_code: string;
    };
  };
}

export interface SentooStatusResponse {
  success: {
    code: number;
    message: string;
    data?: {
      receiving_account_id?: string;
      amount?: {
        total_paid: string;
        paid_currency: string;
      };
      responses?: Array<{
        processor: string;
        reference: string;
        status: string;
        date: string;
        message?: string;
      }>;
    };
  };
}
