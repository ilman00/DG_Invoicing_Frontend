import { useState } from 'react';
import { Info, DollarSign, Globe, } from 'lucide-react';
import type { Item } from '../../../types';

export interface ItemFormValues {
  name: string;
  name_ar?: string;
  price: number;
}

interface Props {
  defaultValues?: Item | null;
  onSubmit: (data: ItemFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

// ─── Reusable styled field wrapper ───────────────────────────────────────────
interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const Field = ({ label, hint, required, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
      {label}
      {required && <span className="text-blue-500 text-xs normal-case font-normal">required</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 leading-relaxed">{hint}</p>}
  </div>
);

// ─── Input with optional left icon ───────────────────────────────────────────
interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  suffix?: string;
}

const StyledInput = ({ icon, suffix, className = '', ...props }: StyledInputProps) => (
  <div className="relative flex items-center">
    {icon && (
      <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
        {icon}
      </span>
    )}
    <input
      {...props}
      className={[
        'w-full h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900',
        'placeholder:text-gray-300',
        'transition-all duration-150',
        'focus:outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-50',
        'hover:border-gray-300',
        icon ? 'pl-9' : 'pl-4',
        suffix ? 'pr-14' : 'pr-4',
        className,
      ].join(' ')}
    />
    {suffix && (
      <span className="absolute right-3.5 text-xs font-medium text-gray-400 pointer-events-none">
        {suffix}
      </span>
    )}
  </div>
);

// ─── Read-only display field ──────────────────────────────────────────────────
const ReadField = ({ value }: { value: string }) => (
  <div className="h-11 rounded-xl border border-gray-100 bg-gray-50 px-4 flex items-center text-sm text-gray-400">
    {value}
  </div>
);

// ─── Section divider ──────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 my-1">
    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
      {children}
    </span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

// ─── Main form ────────────────────────────────────────────────────────────────
export const ItemForm = ({ defaultValues, onSubmit, isSubmitting, onCancel }: Props) => {
  const [form, setForm] = useState<ItemFormValues>({
    name:    defaultValues?.name    ?? '',
    name_ar: defaultValues?.name_ar ?? '',
    price:   defaultValues?.price   ?? 0,
  });

  const vatPrice = (Number(form.price) * 1.15).toFixed(2);

  const fmtDate = (d: Date | string | undefined) =>
    d
      ? new Date(d).toLocaleDateString('en-SA', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '—';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...form, name_ar: form.name_ar?.trim() || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ZATCA notice */}
      <div className="flex gap-3 items-start rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <span className="font-semibold">ZATCA Phase 2</span> — both English and Arabic item
          names are mandatory on all e-invoices issued in Saudi Arabia.
        </p>
      </div>

      {/* ── Item names ── */}
      <SectionLabel>Item names</SectionLabel>

      <div className="grid grid-cols-2 gap-4">
        <Field label="English name" required>
          <StyledInput
            type="text"
            placeholder="e.g. Consulting Service"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            icon={<Globe size={14} />}
            required
          />
        </Field>

        <Field
          label="Arabic name — اسم الصنف"
          required
          hint="Required for ZATCA e-invoices"
        >
          <StyledInput
            type="text"
            placeholder="مثال: خدمة استشارية"
            value={form.name_ar ?? ''}
            onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
            dir="rtl"
            className="text-right"
          />
        </Field>
      </div>

      {/* ── Pricing ── */}
      <SectionLabel>Pricing</SectionLabel>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Unit price (excl. VAT)" required hint="Base price before 15% Saudi VAT">
          <StyledInput
            type="number"
            placeholder="0.00"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            icon={<DollarSign size={14} />}
            suffix="SAR"
            required
          />
        </Field>

        <Field label="Price incl. 15% VAT" hint="Auto-calculated · not stored">
          <ReadField value={`${vatPrice} SAR`} />
        </Field>
      </div>

      {/* ── Audit info (edit mode only) ── */}
      {defaultValues && (
        <>
          <SectionLabel>Record info</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Item ID">
              <ReadField value={`#${defaultValues.id}`} />
            </Field>
            <Field label="Organization">
              <ReadField value={`Org #${defaultValues.organization_id}`} />
            </Field>
            <Field label="Created at">
              <ReadField value={fmtDate(defaultValues.created_at)} />
            </Field>
            <Field label="Last updated">
              <ReadField value={fmtDate(defaultValues.updated_at)} />
            </Field>
            <Field label="Created by">
              <ReadField value={defaultValues.created_by ? `User #${defaultValues.created_by}` : '—'} />
            </Field>
            <Field label="Updated by">
              <ReadField value={defaultValues.updated_by ? `User #${defaultValues.updated_by}` : '—'} />
            </Field>
          </div>
        </>
      )}

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600
            border border-gray-200 bg-white
            hover:bg-gray-50 hover:border-gray-300
            transition-colors duration-150
          "
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            px-5 py-2.5 rounded-xl text-sm font-medium text-white
            bg-blue-600 hover:bg-blue-700
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-sm shadow-blue-200
            transition-all duration-150
          "
        >
          {isSubmitting ? 'Saving…' : defaultValues ? 'Save changes' : 'Create item'}
        </button>
      </div>
    </form>
  );
};