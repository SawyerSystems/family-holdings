import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names into a single string
 * Uses clsx and tailwind-merge to handle conditional classes and merge tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
