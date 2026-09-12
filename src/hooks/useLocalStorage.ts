import { useState, useEffect } from 'react';

/**
 * Type-safe localStorage hook with SSR fallback and JSON serialization.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Storage quota exceeded or disabled in private browsing
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
