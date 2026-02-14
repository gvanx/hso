"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const BRANDS = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Huawei", "Other"];
const GRADES = ["A", "B", "C", "D"];

export function PhoneFilters({ brands }: { brands?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("filters");

  const currentSearch = searchParams.get("search") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentGrade = searchParams.get("grade") || "";
  const currentSort = searchParams.get("sort") || "newest";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/phones?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/phones");
  }

  const hasFilters = currentSearch || currentBrand || currentGrade;
  const availableBrands = brands?.length ? brands : BRANDS;

  const sortOptions = [
    { value: "newest", label: t("newestFirst") },
    { value: "price_asc", label: t("priceLowHigh") },
    { value: "price_desc", label: t("priceHighLow") },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          defaultValue={currentSearch}
          className="pl-9"
          onChange={(e) => {
            const timer = setTimeout(
              () => updateParams("search", e.target.value),
              300
            );
            return () => clearTimeout(timer);
          }}
        />
      </div>

      <Select value={currentBrand || "all"} onValueChange={(v) => updateParams("brand", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("brandPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allBrands")}</SelectItem>
          {availableBrands.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentGrade || "all"} onValueChange={(v) => updateParams("grade", v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t("gradePlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allGrades")}</SelectItem>
          {GRADES.map((g) => (
            <SelectItem key={g} value={g}>
              {t("grade", { letter: g })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentSort} onValueChange={(v) => updateParams("sort", v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("sortPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          {t("clear")}
        </Button>
      )}
    </div>
  );
}
