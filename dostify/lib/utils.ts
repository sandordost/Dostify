import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncate(text: string | undefined | null, max: number): string {
  const s = (text ?? "").trim();
  if (!s) return "";
  if (s.length <= max) return s;

  if (max <= 3) return ".".repeat(max);
  return s.slice(0, max - 3).trimEnd() + " ..";
}
