import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Smartphone, CheckCircle, Clock, XCircle } from "lucide-react";

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const status = params.status || "unknown";

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
    rejected: {
      icon: XCircle,
      title: "Payment Rejected",
      message:
        "Your payment was rejected by the bank. Please try again with a different payment method.",
      color: "text-red-600",
    },
  };

  const config = statusConfig[status] || {
    icon: Clock,
    title: "Payment Status",
    message: "We are processing your payment. Please check back shortly.",
    color: "text-gray-600",
  };

  const StatusIcon = config.icon;

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
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <StatusIcon className={`h-16 w-16 ${config.color}`} />
            </div>
            <CardTitle className="text-2xl">{config.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{config.message}</p>
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
      </main>
    </div>
  );
}
