import { useCallback, useEffect, useRef } from "react";

// Debounce hook for performance optimization
export const useDebounce = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  const debounced = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debounced;
};

// Throttle hook for performance optimization
export const useThrottle = (callback, delay = 300) => {
  const lastRunRef = useRef(Date.now());

  const throttled = useCallback((...args) => {
    const now = Date.now();
    if (now - lastRunRef.current >= delay) {
      lastRunRef.current = now;
      callback(...args);
    }
  }, [callback, delay]);

  return throttled;
};
