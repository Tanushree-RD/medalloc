import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard utility function for combining Tailwind CSS classes cleanly (shadcn/ui convention)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
