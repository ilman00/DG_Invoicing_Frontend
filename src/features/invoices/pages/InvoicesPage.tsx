import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertCircle,
  ReceiptText,
  RefreshCw,
  Eye,
} from 'lucide-react';

import type { InvoiceWithDetails } from '../../../types/invoice.types';
import { useInvoices } from '../../../hooks/useInvoices';
import { InvoiceModal } from '../components/InvoiceModal';
import type { InvoiceFormValues } from '../components/invoiceForm';
import { tokenStore } from '../../../lib/axios';


const STATUS_CONFIG: Record<
  InvoiceWithDetails['status'],
  { label: string; dot: string; pill: string }
> = {
  draft: {
    label: 'Draft',
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  sent: {
    label: 'Sent',
    dot: 'bg-blue-500',
    pill: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  paid: {
    label: 'Paid',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  overdue: {
    label: 'Overdue',
    dot: 'bg-red-500',
    pill: 'bg-red-50 text-red-600 border-red-200',
  },
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

const DeleteConfirm = ({ invoice, onConfirm, onCancel, isDeleting }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
    <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
        <AlertCircle size={18} className="text-red-500" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900">
        Delete this invoice?
      </h3>

      <p className="mt-1.5 text-xs text-slate-500">
        Invoice <span className="font-semibold text-slate-700">
          {invoice.invoice_number}
        </span> will be permanently removed.
      </p>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 disabled:opacity-60"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const InvoicesPage = () => {
  const {
    invoices,
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refresh,
  } = useInvoices();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [deletingInvoice, setDeletingInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<InvoiceWithDetails['status'] | 'all'>('all');

  // ─── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return invoices.filter((inv) => {
      const matchesSearch =
        !q ||
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.customer_name.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, query, statusFilter]);

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    revenue: invoices
      .filter(i => i.status === 'paid')
      .reduce((s, i) => s + Number(i.grand_total), 0),
  }), [invoices]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, data);
      } else {
        await createInvoice(data);
      }
      setModalOpen(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingInvoice) return;
    setIsDeleting(true);
    try {
      await deleteInvoice(deletingInvoice.id);
      setDeletingInvoice(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    const token = tokenStore.getAccessToken(); // wherever you store it
    console.log(invoiceId, invoiceNumber);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch PDF');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    window.open(url, '_blank');

    // Clean up the object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  // ─── UI ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100">
              <ReceiptText size={16} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Invoices</h1>
              <p className="text-xs text-slate-500">
                {isLoading ? 'Loading…' : `${stats.total} total`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingInvoice(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-500"
          >
            <Plus size={14} />
            New Invoice
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex gap-3">
          <Stat label="Paid" value={stats.paid} />
          <Stat label="Overdue" value={stats.overdue} />
          <Stat label="Revenue" value={`SAR ${stats.revenue.toFixed(2)}`} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-8 py-4">

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded-lg border ${statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200'
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={refresh}
          className="p-2 rounded-lg hover:bg-slate-100"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="px-8 pb-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3">Invoice #</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3" >Action </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const cfg = STATUS_CONFIG[inv.status];
                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">{inv.invoice_number}</td>
                    <td className="px-5 py-3">{inv.customer_name}</td>
                    <td className="px-5 py-3">
                      {inv.currency_code} {Number(inv.grand_total).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${cfg.pill}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownloadPdf(inv.id, inv.invoice_number)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                          title="View PDF"
                        >
                          <Eye size={13} />
                          <span className="text-xs font-medium">PDF</span>
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={() => { setEditingInvoice(inv); setModalOpen(true); }}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          onClick={() => setDeletingInvoice(inv)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <InvoiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={editingInvoice}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />

      {deletingInvoice && (
        <DeleteConfirm
          invoice={deletingInvoice}
          onConfirm={handleDelete}
          onCancel={() => setDeletingInvoice(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

// Stat component
const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
    <span className="text-slate-500">{label}: </span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);