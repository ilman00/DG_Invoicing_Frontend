import { useState, useEffect, useCallback } from 'react';
import type { Invoice } from '../types';
import { invoicesApi } from '../api/invoices.api';
import type { InvoiceFormValues } from '../features/invoices/components/invoiceForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseInvoicesReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  createInvoice: (data: InvoiceFormValues) => Promise<void>;
  updateInvoice: (id: number, data: InvoiceFormValues) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  refresh: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // ── Fetch all ──────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const fetchInvoices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await invoicesApi.getAll();
        if (!cancelled) setInvoices(data);
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Failed to load invoices';

          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchInvoices();
    return () => { cancelled = true; };
  }, [tick]);

  // ── Create ─────────────────────────────────────────────────────────────────

  const createInvoice = async (formData: InvoiceFormValues) => {
    const created = await invoicesApi.create(formData);
    setInvoices((prev) => [created, ...prev]);
  };

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateInvoice = async (id: number, formData: InvoiceFormValues) => {
    const updated = await invoicesApi.update(id, formData);
    setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const deleteInvoice = async (id: number) => {
    await invoicesApi.delete(id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  return {
    invoices,
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refresh,
  };
}