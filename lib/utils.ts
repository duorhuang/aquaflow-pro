import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Iteratively peel nested { data: { data: { ... } } } wrappers from request bodies.
 */
export function flattenPayload(body: any): any {
  let current = body;
  while (current && current.data && typeof current.data === 'object' && !Array.isArray(current.data)) {
    const { data, ...rest } = current;
    current = { ...rest, ...data };
  }
  return current;
}

/**
 * Response headers applied to every API response for build identification and cache control.
 */
export const V12_FINGERPRINT = {
  'X-Build': 'V12-STRATOSPHERE-RECOVERY',
  'Cache-Control': 'no-store'
};
