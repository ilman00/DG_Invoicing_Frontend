import { useState, useEffect, useCallback } from 'react';
import type { Item } from '../types';
import { itemsApi } from '../api/items.api';
import type { ItemFormValues } from '../features/items/components/ItemsForm';

interface UseItemsReturn {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  createItem: (data: ItemFormValues) => Promise<void>;
  updateItem: (id: number, data: ItemFormValues) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  refresh: () => void;
}
const MOCK_ITEMS: Item[] = [
  {
    id: 1,
    organization_id: 1,
    name: 'Hosting',
    name_ar: null,
    price: 50,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    organization_id: 1,
    name: 'Website Development',
    name_ar: null,
    price: 500,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
export function useItems(): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // useEffect(() => {
  //   let cancelled = false;

  //   const fetchItems = async () => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       const data = await itemsApi.getAll();
  //       if (!cancelled) setItems(data);
  //     } catch (err: any) {
  //       if (!cancelled) {
  //         setError(err?.response?.data?.message || 'Failed to load items');
  //       }
  //     } finally {
  //       if (!cancelled) setIsLoading(false);
  //     }
  //   };

  //   fetchItems();
  //   return () => { cancelled = true; };
  // }, [tick]);

  useEffect(() => {
  setIsLoading(true);
  setError(null);

  const timer = setTimeout(() => {
    try {
      setItems(MOCK_ITEMS);
    } catch (err: any) {
      setError('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [tick]); // ✅ now refresh() works

  const createItem = async (data: ItemFormValues) => {
    const created = await itemsApi.create(data);
    setItems((prev) => [created, ...prev]);
  };

  const updateItem = async (id: number, data: ItemFormValues) => {
    const updated = await itemsApi.update(id, data);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const deleteItem = async (id: number) => {
    await itemsApi.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, isLoading, error, createItem, updateItem, deleteItem, refresh };
}