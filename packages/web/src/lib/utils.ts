import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

function toDisplayDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  if (!date.includes("T")) return new Date(`${date}T00:00:00`);
  return new Date(date);
}

export function formatDate(date: string | Date, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(toDisplayDate(date));
}
