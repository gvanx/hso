"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function PhoneFilters({ brands }: { brands?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search phones..."
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
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {availableBrands.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentGrade || "all"} onValueChange={(v) => updateParams("grade", v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Grade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Grades</SelectItem>
          {GRADES.map((g) => (
            <SelectItem key={g} value={g}>
              Grade {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentSort} onValueChange={(v) => updateParams("sort", v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
