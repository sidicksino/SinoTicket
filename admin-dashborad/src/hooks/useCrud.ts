import { useMemo, useState } from "react";

export function useCrud<T extends { id: string }>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(normalized),
    );
  }, [items, normalized]);

  function create(payload: Omit<T, "id">) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((current) => [{ id, ...payload } as T, ...current]);
  }

  function update(id: string, payload: Omit<T, "id">) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? ({ id, ...payload } as T) : item,
      ),
    );
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return {
    items,
    filteredItems,
    query,
    setQuery,
    create,
    update,
    remove,
  };
}
