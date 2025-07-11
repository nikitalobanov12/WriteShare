import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomColor(): string {
  const colors = [
    "#DC2626",
    "#EA580C",
    "#D97706",
    "#CA8A04",
    "#65A30D",
    "#16A34A",
    "#059669",
    "#0891B2",
    "#0284C7",
    "#2563EB",
    "#7C3AED",
    "#C026D3",
    "#DC2626",
    "#BE185D",
  ] as const;
  return colors[Math.floor(Math.random() * colors.length)]!;
}
