export const dynamic = "force-dynamic";

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PhoneGrid } from "@/components/PhoneGrid";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Shield, CreditCard } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

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
              {tc("browsePhones")}
            </Link>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin">{tc("admin")}</Link>
            </Button>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {t("heroDescription")}
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/phones">
                {tc("browsePhones")}
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
              <h3 className="font-semibold mb-1">{t("featureTestedTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("featureTestedDesc")}
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">{t("featurePaymentsTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("featurePaymentsDesc")}
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-1">{t("featurePricesTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("featurePricesDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Phones */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t("latestPhones")}</h2>
            <Button asChild variant="ghost">
              <Link href="/phones">
                {t("viewAll")}
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
          <p>{tc("footer")}</p>
          <p className="mt-1">{tc("poweredBy")}</p>
        </div>
      </footer>
    </div>
  );
}
