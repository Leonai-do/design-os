
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePath(path: string): string {
  if (!path) return '';
  // Remove leading slashes, trim whitespace, remove ./
  return path.trim().replace(/^\/+/, '').replace(/^\.\//, '');
}
