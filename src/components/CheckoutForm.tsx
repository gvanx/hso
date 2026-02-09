"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Phone } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CreditCard, QrCode } from "lucide-react";
import Image from "next/image";

export function CheckoutForm({ phone }: { phone: Phone }) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    url: string;
    qr_code: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_id: phone.id,
          buyer_name: formData.name,
          buyer_email: formData.email,
          buyer_phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment creation failed");
      }

      setPaymentData({
        url: data.payment_url,
        qr_code: data.qr_code,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (paymentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Scan the QR code or click the button below to pay{" "}
            <strong>{formatCurrency(phone.price_cents)}</strong> for your{" "}
            <strong>{phone.model}</strong>.
          </p>

          <div className="flex justify-center">
            <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
              <Image
                src={paymentData.qr_code}
                alt="Payment QR Code"
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          </div>

          <Button asChild size="lg" className="w-full max-w-sm">
            <a href={paymentData.url} target="_blank" rel="noopener noreferrer">
              <QrCode className="h-4 w-4 mr-2" />
              Pay with Sentoo
            </a>
          </Button>

          <p className="text-xs text-muted-foreground">
            You will be redirected to Sentoo to complete the payment securely.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyer-phone">Phone Number *</Label>
            <Input
              id="buyer-phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+5999..."
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Pay {formatCurrency(phone.price_cents)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
