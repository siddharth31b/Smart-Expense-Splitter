import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ExpenseCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; emoji: string; color: string }
> = {
  food: { label: "Food & Drinks", emoji: "🍔", color: "text-amber-400" },
  travel: { label: "Travel", emoji: "✈️", color: "text-sky-400" },
  rent: { label: "Rent & Housing", emoji: "🏠", color: "text-violet-400" },
  entertainment: { label: "Entertainment", emoji: "🎬", color: "text-rose-400" },
  utilities: { label: "Utilities", emoji: "💡", color: "text-yellow-400" },
  shopping: { label: "Shopping", emoji: "🛒", color: "text-pink-400" },
  health: { label: "Health", emoji: "💊", color: "text-green-400" },
  other: { label: "Other", emoji: "📦", color: "text-slate-400" },
};

export const ALL_CATEGORIES: ExpenseCategory[] = [
  "food",
  "travel",
  "rent",
  "entertainment",
  "utilities",
  "shopping",
  "health",
  "other",
];
