import { useState, useEffect, useCallback } from 'react';
import type { InvoiceWithDetails, CreateInvoiceDTO, UpdateInvoiceDTO } from '../types/invoice.types';
import { invoicesApi } from '../api/invoices.api';
import type { InvoiceFormValues } from '../features/invoices/components/invoiceForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseInvoicesReturn {
  invoices:      InvoiceWithDetails[];
  isLoading:     boolean;
  error:         string | null;
  createInvoice: (data: InvoiceFormValues) => Promise<void>;
  updateInvoice: (id: number, data: InvoiceFormValues) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  refresh:       () => void;
}

// ─── DTO mappers ──────────────────────────────────────────────────────────────

/**
 * Maps the flat form values into the shape the backend expects.
 * The form knows nothing about organizationId / userId — those are
 * injected server-side from req.user, so we never send them.
 */
const toCreateDTO = (form: InvoiceFormValues): CreateInvoiceDTO => ({
  customer_id:           form.customer_id,
  invoice_type:          form.invoice_type,
  currency_code:         form.currency_code,
  issue_date:            form.issue_date,
  due_date:              form.due_date,
  notes:                 form.notes || undefined,
  reference_invoice_id:  form.reference_invoice_id,
  line_items: form.line_items.map((li) => ({
    item_id:      li.item_id,
    item_name:    li.item_name,
    item_name_ar: li.item_name_ar,
    quantity:     li.quantity,
    unit_price:   li.unit_price,
    vat_rate:     li.vat_rate,
  })),
});

/**
 * Only the four fields the backend UpdateInvoiceDTO accepts.
 * Sending anything else (customer_id, line_items, etc.) would be ignored
 * by the backend or could cause an error, so we strip them here.
 */
const toUpdateDTO = (form: InvoiceFormValues): UpdateInvoiceDTO => ({
  issue_date: form.issue_date,
  due_date:   form.due_date,
  notes:      form.notes || undefined,
  status:     form.status,
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInvoices(): UseInvoicesReturn {
  const [invoices,  setInvoices]  = useState<InvoiceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [tick,      setTick]      = useState(0);

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
    return () => { cancelled = true; };
  }, [tick]);

  // ── Create ─────────────────────────────────────────────────────────────────

  const createInvoice = async (formData: InvoiceFormValues) => {
    const created = await invoicesApi.create(toCreateDTO(formData));
    setInvoices((prev) => [created, ...prev]);
  };

  // ── Update ─────────────────────────────────────────────────────────────────

  const updateInvoice = async (id: number, formData: InvoiceFormValues) => {
    const updated = await invoicesApi.update(id, toUpdateDTO(formData));
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