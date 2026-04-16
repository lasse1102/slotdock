import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr = "dd.MM.yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: de });
}

export function formatTime(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm", { locale: de });
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd.MM.yyyy HH:mm", { locale: de });
}

export function formatSlotTime(start: string | Date, end: string | Date) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}
