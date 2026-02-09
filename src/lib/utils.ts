import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return `XCG ${(cents / 100).toFixed(2)}`;
}

export function getGradeLabel(grade: string | null): string {
  const grades: Record<string, string> = {
    A: "Excellent",
    B: "Good",
    C: "Fair",
    D: "Poor",
  };
  return grade ? `${grade} - ${grades[grade] || grade}` : "N/A";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800";
    case "reserved":
      return "bg-yellow-100 text-yellow-800";
    case "sold":
      return "bg-red-100 text-red-800";
    case "success":
      return "bg-green-100 text-green-800";
    case "pending":
    case "issued":
    case "created":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
    case "cancelled":
    case "expired":
      return "bg-red-100 text-red-800";
    case "manual":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
