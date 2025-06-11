import React, { useCallback, useMemo, useRef } from "react";

// Debounce hook for expensive operations
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => func(...args), delay);
    }) as T,
    [func, delay]
  );
}

// Memoized filter function
export const useMemoizedFilter = <T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[]
) => {
  return useMemo(() => items.filter(filterFn), [items, ...dependencies]);
};

// Throttle hook for frequent updates
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastExecRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastExecRef.current > delay) {
        func(...args);
        lastExecRef.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          func(...args);
          lastExecRef.current = Date.now();
        }, delay - (now - lastExecRef.current));
      }
    }) as T,
    [func, delay]
  );
}

// Lazy loading utility
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return React.lazy(importFn);
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
};

// Batch updates utility
export class BatchUpdater<T> {
  private queue: T[] = [];
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private batchSize: number;
  private delay: number;

  constructor(
    private onBatch: (items: T[]) => void,
    batchSize = 10,
    delay = 100
  ) {
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T) {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.flush(), this.delay);
    }
  }

  private flush() {
    if (this.queue.length > 0) {
      this.onBatch([...this.queue]);
      this.queue = [];
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
