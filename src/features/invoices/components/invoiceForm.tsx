import { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import type { InvoiceType, InvoiceStatus } from '../../../types/invoice.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LineItemFormValue {
  item_id?: number;
  item_name: string;
  item_name_ar?: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

export interface InvoiceFormValues {
  customer_id: number;
  invoice_type: InvoiceType;
  currency_code: string;
  issue_date: string;
  due_date: string;
  notes?: string;
  status?: InvoiceStatus;
  line_items: LineItemFormValue[];
}

interface Props {
  initialValues?: Partial<InvoiceFormValues>;
  isEditing?: boolean;
  onSubmit: (data: InvoiceFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0];
const in30 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

const emptyItem = (): LineItemFormValue => ({
  item_name: '',
  quantity: 1,
  unit_price: 0,
  vat_rate: 15,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      {label}
      {required && <span className="ml-0.5 text-amber-400">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

const selectCls =
  'w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';
// ─── Main Form ────────────────────────────────────────────────────────────────

export const InvoiceForm = ({
  initialValues,
  isEditing = false,
  onSubmit,
  isSubmitting,
  submitError,
}: Props) => {
  const [form, setForm] = useState<InvoiceFormValues>({
    customer_id: initialValues?.customer_id ?? 0,
    invoice_type: initialValues?.invoice_type ?? 'simplified',
    currency_code: initialValues?.currency_code ?? 'SAR',
    issue_date: initialValues?.issue_date ?? today(),
    due_date: initialValues?.due_date ?? in30(),
    notes: initialValues?.notes ?? '',
    status: initialValues?.status,
    line_items: initialValues?.line_items?.length
      ? initialValues.line_items.map(li => ({
        item_id: (li as any).item_id,
        item_name: li.item_name,
        item_name_ar: (li as any).item_name_ar,
        quantity: li.quantity,
        unit_price: li.unit_price,
        vat_rate: li.vat_rate ?? 15,
      }))
      : [emptyItem()],
  });

  const set = useCallback(<K extends keyof InvoiceFormValues>(
    key: K, val: InvoiceFormValues[K]
  ) => setForm(f => ({ ...f, [key]: val })), []);

  const updateItem = (idx: number, key: keyof LineItemFormValue, val: any) =>
    setForm(f => {
      const items = [...f.line_items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...f, line_items: items };
    });

  const addItem = () => setForm(f => ({ ...f, line_items: [...f.line_items, emptyItem()] }));
  const removeItem = (idx: number) =>
    setForm(f => ({ ...f, line_items: f.line_items.filter((_, i) => i !== idx) }));

  // totals
  const subtotal = form.line_items.reduce(
    (s, li) => s + li.quantity * li.unit_price, 0
  );
  const vatTotal = form.line_items.reduce(
    (s, li) => s + (li.quantity * li.unit_price * li.vat_rate) / 100, 0
  );
  const grandTotal = subtotal + vatTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">

      {/* ── Section: Invoice Details ── */}
      <div className="px-6 pt-2 pb-5">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Invoice Details
        </p>

        <div className="grid grid-cols-2 gap-3">

          <Field label="Customer ID" required>
            <input
              type="number"
              min={1}
              required
              value={form.customer_id || ''}
              onChange={e => set('customer_id', Number(e.target.value))}
              placeholder="e.g. 42"
              className={inputCls}
            />
          </Field>

          <Field label="Invoice Type">
            <div className="relative">
              <select
                value={form.invoice_type}
                onChange={e => set('invoice_type', e.target.value as InvoiceType)}
                className={selectCls}
              >
                <option value="simplified">Simplified</option>
                <option value="standard">Standard</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </Field>

          <Field label="Issue Date" required>
            <input
              type="date"
              required
              value={form.issue_date}
              onChange={e => set('issue_date', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Due Date" required>
            <input
              type="date"
              required
              value={form.due_date}
              onChange={e => set('due_date', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Currency">
            <div className="relative">
              <select
                value={form.currency_code}
                onChange={e => set('currency_code', e.target.value)}
                className={selectCls}
              >
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="USD">USD — US Dollar</option>
                <option value="PKR">PKR — Pakistani Rupee</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </Field>

          {/* Status only shown when editing */}
          {isEditing && (
            <Field label="Status">
              <div className="relative">
                <select
                  value={form.status ?? 'draft'}
                  onChange={e => set('status', e.target.value as InvoiceStatus)}
                  className={selectCls}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </Field>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6 border-t border-slate-700/60" />

      {/* ── Section: Line Items ── */}
      <div className="px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
            Line Items
          </p>

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm transition hover:bg-blue-50 hover:border-blue-300"
          >
            <Plus size={12} />
            Add Item
          </button>
        </div>

        {/* Column headers */}
        <div className="mb-1.5 grid grid-cols-[1fr_72px_88px_60px_32px] gap-2">
          {['Item Name', 'Qty', 'Unit Price', 'VAT %', ''].map(h => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {h}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {form.line_items.map((item, idx) => {
            const lineTotal = item.quantity * item.unit_price;
            const lineVat = (lineTotal * item.vat_rate) / 100;
            return (
              <div key={idx} className="group relative">
                <div className="grid grid-cols-[1fr_72px_88px_60px_32px] items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Service or product"
                    value={item.item_name}
                    onChange={e => updateItem(idx, 'item_name', e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={1}
                    required
                    value={item.quantity}
                    onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={item.unit_price || ''}
                    placeholder="0.00"
                    onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={item.vat_rate}
                    onChange={e => updateItem(idx, 'vat_rate', Number(e.target.value))}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={form.line_items.length === 1}
                    className="flex h-[38px] w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Per-line subtotal hint */}
                {lineTotal > 0 && (
                  <div className="mt-1 flex justify-end pr-10 text-[10px] text-slate-500">
                    {lineTotal.toFixed(2)} + {lineVat.toFixed(2)} VAT
                    &nbsp;=&nbsp;
                    <span className="text-slate-400">{(lineTotal + lineVat).toFixed(2)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6 border-t border-slate-700/60" />

      {/* ── Totals ── */}
      <div className="px-6 py-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-1.5">

            {/* Subtotal */}
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal (excl. VAT)</span>
              <span className="font-medium text-slate-900">
                {form.currency_code} {subtotal.toFixed(2)}
              </span>
            </div>

            {/* VAT */}
            <div className="flex justify-between text-xs text-slate-600">
              <span>VAT</span>
              <span className="font-medium text-slate-900">
                {form.currency_code} {vatTotal.toFixed(2)}
              </span>
            </div>

            {/* Divider */}
            <div className="my-1 border-t border-slate-200" />

            {/* Grand Total */}
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Grand Total
              </span>
              <span className="text-sm font-bold text-blue-600">
                {form.currency_code} {grandTotal.toFixed(2)}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6 border-t border-slate-700/60" />

      {/* ── Notes ── */}
      <div className="px-6 py-5">
        <Field label="Notes">
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Any additional notes for this invoice…"
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>

      {/* ── Footer: error + submit ── */}
      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 backdrop-blur">

        {/* Error */}
        {submitError && (
          <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {submitError}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Saving…
            </span>
          ) : isEditing ? (
            'Update Invoice'
          ) : (
            'Create Invoice'
          )}
        </button>

      </div>
    </form>
  );
};