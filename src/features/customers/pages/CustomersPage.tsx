import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Users, RefreshCw, AlertCircle } from 'lucide-react';
import type { Customer } from '../../../types';
import { useCustomers } from '../../../hooks/useCustomers';
import { CustomerDrawer } from '../components/customerDrawer';
import type { CustomerFormValues } from '../components/CustomerForm';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Customer['status'], string> = {
  active:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-gray-100   text-gray-500   ring-gray-200',
  blocked:  'bg-red-50     text-red-600    ring-red-200',
};

const TYPE_STYLES: Record<Customer['type'], string> = {
  individual: 'bg-blue-50  text-blue-700  ring-blue-200',
  business:   'bg-amber-50 text-amber-700 ring-amber-200',
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Delete confirm modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  customer: Customer;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirm = ({ customer, onConfirm, onCancel, isDeleting }: DeleteConfirmProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
      onClick={onCancel}
      aria-hidden="true"
    />
    <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={20} className="text-red-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">Delete customer?</h3>
      <p className="mt-1 text-sm text-gray-500">
        <span className="font-medium text-gray-700">{customer.name}</span> will be permanently
        removed. This cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const CustomersPage = () => {
  const { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer, refresh } =
    useCustomers();

  // ── Drawer state ────────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);

  // ── Delete state ────────────────────────────────────────────────────────────
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting]             = useState(false);

  // ── Search ──────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q),
    );
  }, [customers, query]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingCustomer(null);
    setSubmitError(null);
    setDrawerOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setSubmitError(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSubmitting) return;
    setDrawerOpen(false);
  };

  const handleSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
      } else {
        await createCustomer(data);
      }
      setDrawerOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Something went wrong. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 px-8 py-8">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isLoading
              ? 'Loading…'
              : `${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* ── API-level error ── */}
      {error && !isLoading && (
        <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={refresh}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* ── Submit error (drawer-level, shown below header) ── */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          {submitError}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-2.5 w-48 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Users size={22} className="text-gray-400" />
            </div>
            {query ? (
              <>
                <p className="text-sm font-medium text-gray-700">No results for "{query}"</p>
                <p className="text-xs text-gray-400">Try a different name, email, or phone number.</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">No customers yet</p>
                <p className="text-xs text-gray-400">Add your first customer to get started.</p>
                <button
                  onClick={openCreate}
                  className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  <Plus size={12} />
                  Add Customer
                </button>
              </>
            )}
          </div>
        )}

        {/* Table rows */}
        {!isLoading && filtered.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="group transition-colors hover:bg-gray-50/70"
                >
                  {/* Name + email */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Avatar initials */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 leading-tight">{customer.name}</p>
                        <p className="text-xs text-gray-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3.5 text-gray-500">
                    {customer.phone ?? <span className="text-gray-300">—</span>}
                  </td>

                  {/* Type badge */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TYPE_STYLES[customer.type]}`}
                    >
                      {capitalize(customer.type)}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[customer.status]}`}
                    >
                      {capitalize(customer.status)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(customer)}
                        className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        aria-label={`Edit ${customer.name}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingCustomer(customer)}
                        className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${customer.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Slide-over drawer ── */}
      <CustomerDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        customer={editingCustomer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* ── Delete confirm modal ── */}
      {deletingCustomer && (
        <DeleteConfirm
          customer={deletingCustomer}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingCustomer(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};