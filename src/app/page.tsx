export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PhoneGrid } from "@/components/PhoneGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Shield, CreditCard } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredPhones } = await supabase
    .from("phones")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            <span className="font-bold text-xl">HSO</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/phones"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Phones
            </Link>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin">Admin</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Quality Second-Hand Phones
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Find your next phone at a great price. All phones are tested,
            graded, and ready for you. Pay securely with Sentoo.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/phones">
                Browse Phones
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-b">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">Tested &amp; Graded</h3>
              <p className="text-sm text-muted-foreground">
                Every phone is inspected and graded for quality
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                Pay safely through Sentoo&apos;s banking network
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">Great Prices</h3>
              <p className="text-sm text-muted-foreground">
                Quality phones at prices that make sense
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Phones */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Latest Phones</h2>
            <Button asChild variant="ghost">
              <Link href="/phones">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <PhoneGrid phones={featuredPhones || []} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>HSO - Second Hand Phones | Curaçao</p>
          <p className="mt-1">Powered by Connections Curaçao</p>
        </div>
      </footer>
    </div>
  );
}
