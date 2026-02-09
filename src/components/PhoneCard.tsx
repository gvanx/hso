import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Phone } from "@/lib/types";
import { Battery, Smartphone } from "lucide-react";

export function PhoneCard({ phone }: { phone: Phone }) {
  const imageUrl = phone.images?.[0];

  return (
    <Link href={`/phones/${phone.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg h-full">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={phone.model}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Smartphone className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
          {phone.grade && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Grade {phone.grade}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {phone.brand}
          </p>
          <h3 className="font-semibold mt-1 line-clamp-1">{phone.model}</h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold">
              {formatCurrency(phone.price_cents)}
            </span>
            {phone.battery_pct != null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Battery className="h-3 w-3" />
                {phone.battery_pct}%
              </span>
            )}
          </div>
          {phone.color && (
            <p className="text-xs text-muted-foreground mt-1">{phone.color}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
