import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function numWord(value: number, singular: string, few: string, plural: string): string {
  value = Math.abs(value) % 100;
  const num = value % 10;
  
  if (value > 10 && value < 20) return plural;
  if (num > 1 && num < 5) return few;
  if (num === 1) return singular;
  return plural;
}