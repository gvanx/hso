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

export function getGradeColor(grade: string | null): string {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-800 border-green-200";
    case "B":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "C":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "D":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  silver: "#C0C0C0",
  gray: "#808080",
  grey: "#808080",
  gold: "#FFD700",
  "rose gold": "#B76E79",
  rosegold: "#B76E79",
  blue: "#3B82F6",
  "sierra blue": "#69ABCE",
  "pacific blue": "#2D4F6C",
  "midnight blue": "#191970",
  navy: "#000080",
  red: "#EF4444",
  "product red": "#FF0000",
  green: "#22C55E",
  "midnight green": "#2F4538",
  "alpine green": "#3D6B50",
  purple: "#9333EA",
  "deep purple": "#673AB7",
  lavender: "#B4A7D6",
  pink: "#EC4899",
  coral: "#FF7F50",
  yellow: "#FBBF24",
  orange: "#F97316",
  midnight: "#1C1C1E",
  starlight: "#F5E6D3",
  "space gray": "#535150",
  "space grey": "#535150",
  "space black": "#1D1D1F",
  graphite: "#41424C",
  titanium: "#8F8A81",
  "natural titanium": "#9A9590",
  "blue titanium": "#394D5F",
  "white titanium": "#C4C1BA",
  "black titanium": "#282828",
  "desert titanium": "#B4A48E",
  cream: "#FFFDD0",
  bronze: "#CD7F32",
  copper: "#B87333",
};

export function getPhoneColorHex(color: string | null): string | null {
  if (!color) return null;
  return COLOR_MAP[color.toLowerCase().trim()] || null;
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
