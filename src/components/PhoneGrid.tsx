import { getTranslations } from "next-intl/server";
import { PhoneCard } from "./PhoneCard";
import type { Phone } from "@/lib/types";

export async function PhoneGrid({ phones }: { phones: Phone[] }) {
  const t = await getTranslations("phones");

  if (phones.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">{t("noResults")}</p>
        <p className="text-muted-foreground text-sm mt-1">
          {t("noResultsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {phones.map((phone) => (
        <PhoneCard key={phone.id} phone={phone} />
      ))}
    </div>
  );
}
