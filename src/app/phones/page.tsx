export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PhoneGrid } from "@/components/PhoneGrid";
import { PhoneFilters } from "@/components/PhoneFilters";
import { Pagination } from "@/components/Pagination";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Smartphone } from "lucide-react";

const PAGE_SIZE = 12;

export async function generateMetadata() {
  const t = await getTranslations("phones");
  return {
    title: `${t("title")} | HSO`,
    description: t("metaDescription"),
  };
}

export default async function PhonesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations("phones");
  const tc = await getTranslations("common");

  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("phones")
    .select("*", { count: "exact" })
    .eq("status", "available");

  if (params.search) {
    query = query.or(
      `model.ilike.%${params.search}%,brand.ilike.%${params.search}%`
    );
  }

  if (params.brand) {
    query = query.eq("brand", params.brand);
  }

  if (params.grade) {
    query = query.eq("grade", params.grade);
  }

  switch (params.sort) {
    case "price_asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_cents", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: phones, count } = await query.range(from, to);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  const { data: brandData } = await supabase
    .from("phones")
    .select("brand")
    .eq("status", "available");
  const brands = [...new Set(brandData?.map((b) => b.brand) || [])].sort();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            <span className="font-bold text-xl">HSO</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/phones" className="text-sm font-medium">
              {tc("browsePhones")}
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

        <Suspense fallback={null}>
          <PhoneFilters brands={brands} />
        </Suspense>

        <div className="mt-8">
          <PhoneGrid phones={phones || []} />
        </div>

        <Suspense fallback={null}>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
      </main>
    </div>
  );
}
