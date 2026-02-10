"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Smartphone, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle; title: string; message: string; color: string }
> = {
  success: {
    icon: CheckCircle,
    title: "Payment Successful!",
    message:
      "Your payment has been received. You will receive a confirmation via SMS, email, and WhatsApp shortly.",
    color: "text-green-600",
  },
  pending: {
    icon: Clock,
    title: "Payment Pending",
    message:
      "Your payment is being processed. We will notify you once it is confirmed.",
    color: "text-yellow-600",
  },
  issued: {
    icon: Clock,
    title: "Payment Processing",
    message:
      "Your payment is being processed. We will notify you once it is confirmed.",
    color: "text-yellow-600",
  },
  failed: {
    icon: XCircle,
    title: "Payment Failed",
    message:
      "Your payment could not be processed. Please try again or contact us for help.",
    color: "text-red-600",
  },
  cancelled: {
    icon: XCircle,
    title: "Payment Cancelled",
    message: "You cancelled the payment. The phone is still available for purchase.",
    color: "text-gray-600",
  },
  expired: {
    icon: XCircle,
    title: "Payment Expired",
    message: "The payment session has expired. Please try again.",
    color: "text-gray-600",
  },
};

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const phoneId = searchParams.get("phone_id");
  const urlStatus = searchParams.get("status") || "unknown";
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!phoneId) return;

    let attempts = 0;
    const maxAttempts = 10;
    setPolling(true);

    async function verify() {
      try {
        const res = await fetch(`/api/payment/verify?phone_id=${phoneId}`);
        if (!res.ok) return;
        const data = await res.json();
        setVerifiedStatus(data.status);

        // Stop polling if status is final
        if (
          data.status === "success" ||
          data.status === "failed" ||
          data.status === "cancelled" ||
          data.status === "expired"
        ) {
          setPolling(false);
          return;
        }

        // Keep polling for pending/issued statuses
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(verify, 3000);
        } else {
          setPolling(false);
        }
      } catch {
        setPolling(false);
      }
    }

    verify();
  }, [phoneId]);

  const status = verifiedStatus || urlStatus;
  const config = statusConfig[status] || {
    icon: Clock,
    title: "Payment Status",
    message: "We are processing your payment. Please check back shortly.",
    color: "text-gray-600",
  };
  const StatusIcon = config.icon;

  return (
    <Card className="max-w-md w-full text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          {polling && !verifiedStatus ? (
            <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
          ) : (
            <StatusIcon className={`h-16 w-16 ${config.color}`} />
          )}
        </div>
        <CardTitle className="text-2xl">
          {polling && !verifiedStatus ? "Verifying Payment..." : config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          {polling && !verifiedStatus
            ? "Please wait while we verify your payment with Sentoo."
            : config.message}
        </p>
        {polling && verifiedStatus && (verifiedStatus === "pending" || verifiedStatus === "issued") && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking for updates...
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/phones">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentReturnPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            <span className="font-bold text-xl">HSO</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 flex justify-center">
        <Suspense
          fallback={
            <Card className="max-w-md w-full text-center">
              <CardContent className="py-16">
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-muted-foreground" />
              </CardContent>
            </Card>
          }
        >
          <PaymentReturnContent />
        </Suspense>
      </main>
    </div>
  );
}
