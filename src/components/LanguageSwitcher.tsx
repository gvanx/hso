"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  COOKIE_NAME,
  type Locale,
} from "@/i18n/config";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  function onChange(newLocale: string) {
    document.cookie = `${COOKIE_NAME}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    router.refresh();
  }

  return (
    <Select value={locale} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <Globe className="h-3.5 w-3.5 mr-1" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {LOCALE_LABELS[loc as Locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
