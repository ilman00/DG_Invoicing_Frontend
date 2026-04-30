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

export function useItems(): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Remove MOCK_ITEMS entirely
// Replace the setTimeout useEffect with the real one:

useEffect(() => {
  let cancelled = false;

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await itemsApi.getAll();
      if (!cancelled) setItems(data);
    } catch (err: any) {
      if (!cancelled) {
        setError(err?.response?.data?.message || 'Failed to load items');
      }
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  };

  fetchItems();
  return () => { cancelled = true; };
}, [tick]);



  const createItem = async (data: ItemFormValues) => {
  try {
    const created = await itemsApi.create(data);
    setItems((prev) => [created, ...prev]);
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || 'Failed to create item');
  }
};

const updateItem = async (id: number, data: ItemFormValues) => {
  try {
    const updated = await itemsApi.update(id, data);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || 'Failed to update item');
  }
};

const deleteItem = async (id: number) => {
  try {
    await itemsApi.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || 'Failed to delete item');
  }
};

  return { items, isLoading, error, createItem, updateItem, deleteItem, refresh };
}