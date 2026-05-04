import { useState, useEffect, useCallback } from 'react';
import type {
  InvoiceWithDetails,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
} from '../types/invoice.types';
import { invoicesApi } from '../api/invoices.api';
import type { InvoiceFormValues } from '../features/invoices/components/invoiceForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseInvoicesReturn {
  invoices: InvoiceWithDetails[];
  isLoading: boolean;
  isFetchingOne: boolean;
  error: string | null;
  createInvoice: (data: InvoiceFormValues) => Promise<void>;
  updateInvoice: (id: number, data: InvoiceFormValues) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  getInvoiceById: (id: number) => Promise<InvoiceWithDetails | null>;
  refresh: () => void;
}

// ─── DTO mappers ──────────────────────────────────────────────────────────────

const toCreateDTO = (form: InvoiceFormValues): CreateInvoiceDTO => ({
  customer_id: form.customer_id,
  invoice_type: form.invoice_type,
  currency_code: form.currency_code,
  issue_date: form.issue_date,
  due_date: form.due_date,
  notes: form.notes || undefined,
  reference_invoice_id: form.reference_invoice_id,
  line_items: form.line_items.map((li) => ({
    item_id: li.item_id,
    item_name: li.item_name,
    item_name_ar: li.item_name_ar,
    quantity: li.quantity,
    unit_price: li.unit_price,
    vat_rate: li.vat_rate,
  })),
});

const toUpdateDTO = (form: InvoiceFormValues): UpdateInvoiceDTO => ({
  issue_date: form.issue_date,
  due_date: form.due_date,
  notes: form.notes || undefined,
  status: form.status,
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingOne, setIsFetchingOne] = useState(false);
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
            (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Failed to load invoices';

          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchInvoices();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // ── Create ─────────────────────────────────────────────────────────────────

  const createInvoice = useCallback(async (formData: InvoiceFormValues) => {
    try {
      const created = await invoicesApi.create(toCreateDTO(formData));
      setInvoices((prev) => [created, ...prev]);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to create invoice';

      setError(message);
    }
  }, []);

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateInvoice = useCallback(async (id: number, formData: InvoiceFormValues) => {
    try {
      const updated = await invoicesApi.update(id, toUpdateDTO(formData));
      setInvoices((prev) =>
        prev.map((i) => (i.id === id ? updated : i))
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to update invoice';

      setError(message);
    }
  }, []);

  // ── Delete ─────────────────────────────────────────────────────────────────

  const deleteInvoice = useCallback(async (id: number) => {
    try {
      await invoicesApi.delete(id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to delete invoice';

      setError(message);
    }
  }, []);

  // ── Get single invoice ─────────────────────────────────────────────────────

  const getInvoiceById = useCallback(async (id: number) => {
    setIsFetchingOne(true);
    setError(null);

    try {
      return await invoicesApi.getById(id);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to load invoice';

      setError(message);
      return null;
    } finally {
      setIsFetchingOne(false);
    }
  }, []);

  return {
    invoices,
    isLoading,
    isFetchingOne,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    refresh,
  };
}