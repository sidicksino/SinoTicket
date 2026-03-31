import { useCallback, useEffect, useMemo, useState } from "react";

export interface UseCrudOptions<T> {
  getAll: () => Promise<T[]>;
  create: (payload: Record<string, unknown>) => Promise<T>;
  update: (id: string, payload: Record<string, unknown>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export function useApiCrud<T extends { id: string }>(options: UseCrudOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalized) {
      return items;
    }
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(normalized),
    );
  }, [items, normalized]);

  // Fetch all items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await options.getAll();
      setItems(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch items";
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  }, [options]);

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Create item
  const create = useCallback(
    async (payload: Omit<T, "id">) => {
      try {
        setError(null);
        const newItem = await options.create(
          payload as Record<string, unknown>,
        );
        setItems((current) => [newItem, ...current]);
        return newItem;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create item";
        setError(message);
        throw err;
      }
    },
    [options],
  );

  // Update item
  const update = useCallback(
    async (id: string, payload: Omit<T, "id">) => {
      try {
        setError(null);
        const updated = await options.update(
          id,
          payload as Record<string, unknown>,
        );
        setItems((current) =>
          current.map((item) => (item.id === id ? updated : item)),
        );
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update item";
        setError(message);
        throw err;
      }
    },
    [options],
  );

  // Delete item
  const remove = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await options.delete(id);
        setItems((current) => current.filter((item) => item.id !== id));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete item";
        setError(message);
        throw err;
      }
    },
    [options],
  );

  // Retry fetching
  const refetch = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    filteredItems,
    query,
    setQuery,
    create,
    update,
    remove,
    loading,
    error,
    refetch,
  };
}
