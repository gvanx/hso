import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Smartphone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata() {
  const t = await getTranslations("terms");
  return {
    title: `${t("title")} | HSO`,
  };
}

export default async function TermsPage() {
  const t = await getTranslations("terms");
  const tl = await getTranslations("legal");
  const tc = await getTranslations("common");

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
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {tl("backToHome")}
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {tl("lastUpdated")}
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-2">{t("introTitle")}</h2>
            <p className="text-muted-foreground">{t("introText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("productsTitle")}
            </h2>
            <p className="text-muted-foreground">{t("productsText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("pricingTitle")}
            </h2>
            <p className="text-muted-foreground">{t("pricingText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("paymentTermsTitle")}
            </h2>
            <p className="text-muted-foreground">{t("paymentTermsText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("warrantyTitle")}
            </h2>
            <p className="text-muted-foreground mb-3">{t("warrantyText")}</p>
            <p className="text-muted-foreground text-sm italic">
              {t("warrantyExclusions")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{t("ordersTitle")}</h2>
            <p className="text-muted-foreground">{t("ordersText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("liabilityTitle")}
            </h2>
            <p className="text-muted-foreground">{t("liabilityText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("governingTitle")}
            </h2>
            <p className="text-muted-foreground">{t("governingText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("changesTitle")}
            </h2>
            <p className="text-muted-foreground">{t("changesText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("contactTitle")}
            </h2>
            <p className="text-muted-foreground">{t("contactText")}</p>
            <a
              href="mailto:info@connectionscuracao.net"
              className="text-primary underline"
            >
              info@connectionscuracao.net
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>{tc("footer")}</p>
          <p className="mt-1">{tc("poweredBy")}</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/privacy" className="underline hover:text-foreground">
              {tc("privacy")}
            </Link>
            <span className="font-medium">{tc("terms")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
