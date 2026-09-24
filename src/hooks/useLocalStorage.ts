import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/utils/storage';

/**
 * Typed, JSON-serialised localStorage state that also syncs across tabs.
 *
 * (Zustand's `persist` middleware covers persisted *stores*; this is for
 * component-local persistence such as "dismissed this banner".)
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => storage.get(key, initialValue));

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = typeof next === 'function' ? (next as (previous: T) => T)(previous) : next;
        storage.set(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    storage.remove(key);
    setValue(initialValue);
    // `initialValue` is intentionally captured once — changing it mid-life
    // should not silently rewrite persisted state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Another tab changed the same key — mirror it instead of going stale.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      setValue(storage.get(key, initialValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, update, remove] as const;
}
