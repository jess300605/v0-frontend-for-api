import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | undefined | null): string {
  const numPrice = Number(price || 0)
  return numPrice.toFixed(2)
}

export function parsePrice(price: number | string | undefined | null): number {
  return Number(price || 0)
}
