import { useEffect, useRef } from 'react';
import { X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { InvoiceForm, type InvoiceFormValues } from './invoiceForm';
import type { InvoiceWithDetails } from '../../../types/invoice.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: InvoiceWithDetails | null;
  onSubmit: (data: InvoiceFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const InvoiceModal = ({
  isOpen,
  onClose,
  invoice,
  onSubmit,
  isSubmitting,
  submitError,
}: InvoiceModalProps) => {
  const isEditing = !!invoice;
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, isSubmitting, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal */}
      <div
        ref={panelRef}
        className="relative z-10 w-[75vw] max-w-none max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl"
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <FileText size={16} className="text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              {isEditing ? 'Edit Invoice' : 'New Invoice'}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {isEditing && invoice
                ? `#${invoice.invoice_number} · ${invoice.customer_name || 'Customer'}`
                : 'Create a new invoice'}
            </p>
          </div>

          {/* ZATCA badge */}
          <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2.5 py-1">
            ZATCA
          </span>

          {/* Close */}
          <button
            onClick={() => !isSubmitting && onClose()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Error banner ── */}
        {submitError && (
          <div className="flex items-center gap-2 px-6 py-3 bg-red-50 border-b border-red-200 text-red-600 text-xs">
            <AlertCircle size={14} />
            <span>{submitError}</span>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <InvoiceForm
            key={invoice?.id ?? 'new'}
            initialValues={
              invoice
                ? {
                    customer_id: invoice.customer_id,
                    invoice_type: invoice.invoice_type,
                    currency_code: invoice.currency_code,
                    issue_date: invoice.issue_date,
                    due_date: invoice.due_date,
                    notes: invoice.notes ?? '',
                    status: invoice.status,
                    line_items: invoice.line_items ?? [], // ✅ no any
                  }
                : undefined
            }
            isEditing={isEditing}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitError={null} // handled here instead
          />
        </div>

        {/* ── Footer loader (subtle UX) ── */}
        {isSubmitting && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            <Loader2 size={14} className="animate-spin" />
            Processing...
          </div>
        )}
      </div>
    </div>
  );
};