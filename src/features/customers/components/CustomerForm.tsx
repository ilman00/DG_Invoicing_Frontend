import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Customer } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

// ─── Schema ───────────────────────────────────────────────────────────────────

const customerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(150),
    name_ar: z.string().max(150).optional().or(z.literal('')),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().max(30).optional().or(z.literal('')),
    type: z.enum(['individual', 'business']),
    status: z.enum(['active', 'inactive', 'blocked']),
    vat_number: z.string().max(50).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'business' && !data.vat_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'VAT number is required for business customers',
        path: ['vat_number'],
      });
    }
  });

export type CustomerFormValues = z.infer<typeof customerSchema>;

// ─── Utils ────────────────────────────────────────────────────────────────────

const fetchTransliteration = async (
  text: string,
  langCode: 'ar-t-i0-und' | 'en-t-i0-und'
) => {
  if (!text || text.trim().length < 2) return '';

  try {
    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(
        text
      )}&itc=${langCode}&num=1`
    );

    const data = await response.json();

    if (data[0] === 'SUCCESS') {
      return data[1][0][1][0];
    }
  } catch (error) {
    console.error('Transliteration error:', error);
  }

  return '';
};

// ─── Component ────────────────────────────────────────────────────────────────

interface CustomerFormProps {
  defaultValues?: Partial<Customer>;
  onSubmit: (data: CustomerFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}

export const CustomerForm = ({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
}: CustomerFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      name_ar: defaultValues?.name_ar ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      type: defaultValues?.type ?? 'individual',
      status: defaultValues?.status ?? 'active',
      vat_number: defaultValues?.vat_number ?? '',
    },
  });

  const nameEn = useWatch({ control, name: 'name' });
  const nameAr = useWatch({ control, name: 'name_ar' });
  const selectedType = useWatch({ control, name: 'type' });

  // 🔑 Track last edited field (THIS FIXES YOUR ISSUE)
  const [lastEdited, setLastEdited] = useState<'name' | 'name_ar' | null>(null);

  // ─── English → Arabic ──────────────────────────────────────────────────────
  useEffect(() => {
    if (lastEdited !== 'name' || !nameEn) return;

    const timeout = setTimeout(async () => {
      const result = await fetchTransliteration(nameEn, 'ar-t-i0-und');

      if (result && result !== nameAr) {
        setValue('name_ar', result, { shouldValidate: true });
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [nameEn, lastEdited]);

  // ─── Arabic → English ──────────────────────────────────────────────────────
  useEffect(() => {
    if (lastEdited !== 'name_ar' || !nameAr) return;

    const timeout = setTimeout(async () => {
      const result = await fetchTransliteration(nameAr, 'en-t-i0-und');

      if (result && result !== nameEn) {
        setValue('name', result, { shouldValidate: true });
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [nameAr, lastEdited]);

  // ─── Sync form when editing existing data ──────────────────────────────────
  useEffect(() => {
    reset({
      name: defaultValues?.name ?? '',
      name_ar: defaultValues?.name_ar ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      type: defaultValues?.type ?? 'individual',
      status: defaultValues?.status ?? 'active',
      vat_number: defaultValues?.vat_number ?? '',
    });
  }, [defaultValues?.id, reset]);

  // ─── JSX ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="name"
          label="Name"
          placeholder="Acme Corp"
          error={errors.name?.message}
          {...register('name')}
          onChange={(e) => {
            setLastEdited('name');
            register('name').onChange(e);
          }}
        />

        <Input
          id="name_ar"
          label="Name (Arabic)"
          placeholder="اسم العميل"
          dir="rtl"
          error={errors.name_ar?.message}
          {...register('name_ar')}
          onChange={(e) => {
            setLastEdited('name_ar');
            register('name_ar').onChange(e);
          }}
        />
      </div>

      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="contact@acme.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        id="phone"
        label="Phone"
        placeholder="+966 50 000 0000"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="type"
          label="Type"
          error={errors.type?.message}
          options={[
            { value: 'individual', label: 'Individual' },
            { value: 'business', label: 'Business' },
          ]}
          {...register('type')}
        />

        <Select
          id="status"
          label="Status"
          error={errors.status?.message}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'blocked', label: 'Blocked' },
          ]}
          {...register('status')}
        />
      </div>

      {selectedType === 'business' && (
        <Input
          id="vat_number"
          label="VAT Number"
          placeholder="310000000000003"
          error={errors.vat_number?.message}
          {...register('vat_number')}
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};