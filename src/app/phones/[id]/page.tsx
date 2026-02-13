import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatStorage, getGradeLabel, getGradeColor, getPhoneColorHex } from "@/lib/utils";
import {
  Smartphone,
  Battery,
  Tag,
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: phone } = await supabase
    .from("phones")
    .select("model, brand, price_cents, images, description")
    .eq("id", id)
    .single();

  if (!phone) {
    return { title: "Phone Not Found | HSO" };
  }

  const title = `${phone.brand} ${phone.model} | HSO`;
  const description =
    phone.description ||
    `Buy a ${phone.brand} ${phone.model} for ${formatCurrency(phone.price_cents)} at HSO Curaçao.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/phones/${id}`,
      ...(phone.images?.[0] && {
        images: [{ url: phone.images[0], alt: `${phone.brand} ${phone.model}` }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(phone.images?.[0] && { images: [phone.images[0]] }),
    },
  };
}

export default async function PhoneDetailPage({
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

  const isAvailable = phone.status === "available";

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

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/phones"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to phones
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              {phone.images?.[0] ? (
                <Image
                  src={phone.images[0]}
                  alt={phone.model}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Smartphone className="h-24 w-24 text-muted-foreground/40" />
                </div>
              )}
            </div>
            {phone.images && phone.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {phone.images.slice(1).map((img: string, i: number) => (
                  <div
                    key={i}
                    className="aspect-square relative rounded-md overflow-hidden bg-muted"
                  >
                    <Image
                      src={img}
                      alt={`${phone.model} image ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {phone.brand}
            </p>
            <h1 className="text-3xl font-bold mt-1">
              {phone.model}{phone.storage_gb ? ` ${formatStorage(phone.storage_gb)}` : ""}
            </h1>

            <div className="flex items-center gap-2 mt-4">
              <span className="text-3xl font-bold">
                {formatCurrency(phone.price_cents)}
              </span>
              {!isAvailable && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {phone.status === "reserved" ? "Reserved" : "Sold"}
                </Badge>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {phone.grade && (
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Grade:{" "}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(phone.grade)}`}>
                      {getGradeLabel(phone.grade)}
                    </span>
                  </span>
                </div>
              )}
              {phone.storage_gb != null && (
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Storage: {formatStorage(phone.storage_gb)}</span>
                </div>
              )}
              {phone.battery_pct != null && (
                <div className="flex items-center gap-3">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Battery Health: {phone.battery_pct}%
                  </span>
                </div>
              )}
              {phone.color && (
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full border border-gray-300"
                    style={getPhoneColorHex(phone.color) ? { backgroundColor: getPhoneColorHex(phone.color)! } : { backgroundColor: '#d1d5db' }}
                  />
                  <span className="text-sm">Color: {phone.color}</span>
                </div>
              )}
              {phone.warranty_type && (
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Warranty:{" "}
                    {phone.warranty_type === "standard_3m"
                      ? "Standard 3 Months"
                      : phone.warranty_type === "apple_3m"
                        ? "3 Months + Apple Warranty"
                        : phone.warranty_text || "Other"}
                  </span>
                </div>
              )}
            </div>

            {phone.description && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {phone.description}
                </p>
              </div>
            )}

            <div className="mt-8">
              {isAvailable ? (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={`/checkout/${phone.id}`}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now - {formatCurrency(phone.price_cents)}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" disabled className="w-full sm:w-auto">
                  {phone.status === "reserved"
                    ? "Currently Reserved"
                    : "Sold Out"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
