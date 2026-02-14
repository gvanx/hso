"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Smartphone, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("payment");
  const tc = useTranslations("common");
  const phoneId = searchParams.get("phone_id");
  const urlStatus = searchParams.get("status") || "unknown";
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);
  const [processorMessage, setProcessorMessage] = useState<string | null>(null);
  const [retryUrl, setRetryUrl] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!phoneId) {
      setPolling(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    async function verify() {
      try {
        const res = await fetch(`/api/payment/verify?phone_id=${phoneId}`);
        if (!res.ok) return;
        const data = await res.json();
        setVerifiedStatus(data.status);
        if (data.processor_message) {
          setProcessorMessage(data.processor_message);
        }
        if (data.sentoo_payment_url) {
          setRetryUrl(data.sentoo_payment_url);
        }

        if (
          !data.retryable &&
          (data.status === "success" ||
          data.status === "failed" ||
          data.status === "cancelled" ||
          data.status === "expired")
        ) {
          setPolling(false);
          return;
        }

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

  const statusConfig: Record<
    string,
    { icon: typeof CheckCircle; titleKey: string; messageKey: string; color: string }
  > = {
    success: {
      icon: CheckCircle,
      titleKey: "successTitle",
      messageKey: "successMessage",
      color: "text-green-600",
    },
    pending: {
      icon: Clock,
      titleKey: "pendingTitle",
      messageKey: "pendingMessage",
      color: "text-yellow-600",
    },
    issued: {
      icon: Clock,
      titleKey: "processingTitle",
      messageKey: "pendingMessage",
      color: "text-yellow-600",
    },
    failed: {
      icon: XCircle,
      titleKey: "failedTitle",
      messageKey: "failedMessage",
      color: "text-red-600",
    },
    cancelled: {
      icon: XCircle,
      titleKey: "cancelledTitle",
      messageKey: "cancelledMessage",
      color: "text-gray-600",
    },
    expired: {
      icon: XCircle,
      titleKey: "expiredTitle",
      messageKey: "expiredMessage",
      color: "text-gray-600",
    },
  };

  const config = statusConfig[status] || {
    icon: Clock,
    titleKey: "defaultTitle",
    messageKey: "defaultMessage",
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
          {polling && !verifiedStatus ? t("verifying") : t(config.titleKey)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          {polling && !verifiedStatus
            ? t("verifyingMessage")
            : t(config.messageKey)}
        </p>
        {processorMessage && status !== "success" && (
          <p className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">
            {processorMessage}
          </p>
        )}
        {polling && verifiedStatus && (verifiedStatus === "pending" || verifiedStatus === "issued") && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("checkingUpdates")}
          </div>
        )}
        <div className="flex flex-col gap-2">
          {status !== "success" && retryUrl && (
            <Button asChild>
              <a href={retryUrl}>{t("tryAgain")}</a>
            </Button>
          )}
          {status !== "success" && !retryUrl && phoneId && (
            <Button asChild>
              <Link href={`/phones/${phoneId}`}>{t("startNewPayment")}</Link>
            </Button>
          )}
          <Button asChild variant={status === "success" ? "default" : "outline"}>
            <Link href="/phones">{tc("continueShopping")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{tc("goHome")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentReturnPage() {
  const t = useTranslations("payment");

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            <span className="font-bold text-xl">HSO</span>
          </Link>
          <LanguageSwitcher />
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
