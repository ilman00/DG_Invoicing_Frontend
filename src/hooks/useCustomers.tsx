import { useState, useEffect, useCallback } from 'react';
import type { Customer } from '../types';
import { customersApi } from '../api/customers.api';
import type { CustomerFormValues } from '../features/customers/components/CustomerForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  createCustomer: (data: CustomerFormValues) => Promise<void>;
  updateCustomer: (id: number, data: CustomerFormValues) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  refresh: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [tick, setTick]           = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // ── Fetch all ──────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await customersApi.getAll();
        if (!cancelled) setCustomers(data);
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to load customers';
          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCustomers();
    return () => { cancelled = true; };
  }, [tick]);

  // ── Create ─────────────────────────────────────────────────────────────────

  const createCustomer = async (formData: CustomerFormValues) => {
    const created = await customersApi.create(formData);
    setCustomers((prev) => [created, ...prev]);
  };

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateCustomer = async (id: number, formData: CustomerFormValues) => {
    const updated = await customersApi.update(id, formData);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const deleteCustomer = async (id: number) => {
    await customersApi.delete(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  return { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer, refresh };
}