import { isDev, devLog } from './logger';
/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Throttle utility to limit function execution rate
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Performance monitoring utilities
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (isDev) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    devLog(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
}

/**
 * Async version of performance measurement
 */
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  if (isDev) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    devLog(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return await fn();
}
