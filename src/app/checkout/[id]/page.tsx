import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/CheckoutForm";
import { formatCurrency, formatStorage } from "@/lib/utils";
import { Smartphone, ArrowLeft } from "lucide-react";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: phone } = await supabase
    .from("phones")
    .select("*")
    .eq("id", id)
    .single();

  if (!phone) {
    notFound();
  }

  if (phone.status !== "available") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Phone Not Available</h1>
          <p className="text-muted-foreground mb-4">
            This phone is no longer available for purchase.
          </p>
          <Link href="/phones" className="text-primary underline">
            Browse other phones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            <span className="font-bold text-xl">HSO</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href={`/phones/${phone.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to phone details
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Phone Summary */}
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {phone.images?.[0] ? (
                  <Image
                    src={phone.images[0]}
                    alt={phone.model}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Smartphone className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{phone.brand}</p>
                <p className="font-semibold">
                  {phone.model}{phone.storage_gb ? ` ${formatStorage(phone.storage_gb)}` : ""}
                </p>
                {phone.color && (
                  <p className="text-xs text-muted-foreground">{phone.color}</p>
                )}
              </div>
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">
                {formatCurrency(phone.price_cents)}
              </span>
            </div>
          </div>

          {/* Checkout Form */}
          <CheckoutForm phone={phone} />
        </div>
      </main>
    </div>
  );
}
