"use client";

import { useCallback, useEffect, useState } from "react";

// A small set of ids persisted in localStorage (saved videos, followed creators).
export function useStoredSet(key: string) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, [key]);

  const toggle = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key]
  );

  return { items, has: (id: string) => items.includes(id), toggle };
}
