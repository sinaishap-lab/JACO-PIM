/* Shared mock data for the JACO PIM app screens. */

export type Status = "active" | "low" | "out" | "draft";

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: Status;
}

export const STATUS_META: Record<
  Status,
  { label: string; tone: "success" | "warning" | "danger" | "info" }
> = {
  active: { label: "פעיל", tone: "success" },
  low: { label: "מלאי נמוך", tone: "warning" },
  out: { label: "אזל", tone: "danger" },
  draft: { label: "טיוטה", tone: "info" },
};

export const PRODUCTS: Product[] = [
  { sku: "JP-1024", name: "קנבס משפחתי 40×60", category: "קנבסים", price: 149, stock: 84, status: "active" },
  { sku: "JP-2087", name: "אלבום קלאסי 30 עמ׳", category: "אלבומים", price: 89, stock: 12, status: "low" },
  { sku: "JP-3310", name: "מגנט תמונה 10×10", category: "תמונות", price: 12, stock: 0, status: "out" },
  { sku: "JP-4501", name: "מסגרת עץ A4", category: "מסגרות", price: 65, stock: 40, status: "draft" },
  { sku: "JP-5120", name: "ספר תמונות יוקרתי", category: "אלבומים", price: 199, stock: 67, status: "active" },
  { sku: "JP-6044", name: "כוס קרמיקה מודפסת", category: "מתנות", price: 39, stock: 8, status: "low" },
  { sku: "JP-7788", name: "פאזל תמונה 500 חלקים", category: "מתנות", price: 79, stock: 23, status: "active" },
];

export interface Category {
  slug: string;
  name: string;
  count: number;
}

export const CATEGORIES: Category[] = [
  { slug: "canvas", name: "קנבסים", count: 128 },
  { slug: "albums", name: "אלבומים", count: 94 },
  { slug: "photos", name: "תמונות", count: 612 },
  { slug: "frames", name: "מסגרות", count: 73 },
  { slug: "gifts", name: "מתנות", count: 156 },
  { slug: "magnets", name: "מגנטים", count: 41 },
];

export function findProduct(sku: string) {
  return PRODUCTS.find((p) => p.sku === sku);
}
