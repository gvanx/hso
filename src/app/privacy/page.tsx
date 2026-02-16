import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Smartphone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata() {
  const t = await getTranslations("privacy");
  return {
    title: `${t("title")} | HSO`,
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
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
              {t("dataCollectTitle")}
            </h2>
            <p className="text-muted-foreground">{t("dataCollectText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("dataUseTitle")}
            </h2>
            <p className="text-muted-foreground">{t("dataUseText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("paymentTitle")}
            </h2>
            <p className="text-muted-foreground mb-3">{t("paymentText")}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <a
                  href="https://sentoo.io/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {t("sentooPolicy")}
                </a>
              </li>
              <li>
                <a
                  href="https://www.paddle.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {t("paddlePolicy")}
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("sharingTitle")}
            </h2>
            <p className="text-muted-foreground">{t("sharingText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("retentionTitle")}
            </h2>
            <p className="text-muted-foreground">{t("retentionText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              {t("cookiesTitle")}
            </h2>
            <p className="text-muted-foreground">{t("cookiesText")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{t("rightsTitle")}</h2>
            <p className="text-muted-foreground">{t("rightsText")}</p>
            <a
              href="mailto:info@connectionscuracao.net"
              className="text-primary underline"
            >
              info@connectionscuracao.net
            </a>
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
            <span className="font-medium">{tc("privacy")}</span>
            <Link href="/terms" className="underline hover:text-foreground">
              {tc("terms")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
