import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * The one class-name helper. `clsx` handles conditionals, `twMerge` resolves
 * Tailwind conflicts so a consumer's `className` always wins over a
 * component's defaults (`<Button className="px-8" />` actually gets px-8).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
