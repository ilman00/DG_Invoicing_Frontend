import { api } from '../lib/axios';
import type { Customer } from '../types';
import type { CustomerFormValues } from '../features/customers/components/CustomerForm';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert empty strings to undefined so the backend stores NULL, not "" */
const nullCoerce = (v: string | undefined): string | undefined =>
  v === '' ? undefined : v;

// ─── API ──────────────────────────────────────────────────────────────────────

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const res = await api.get<{ success: true; data: Customer[] }>('/customers');
    return res.data.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const res = await api.get<{ success: true; data: Customer }>(`/customers/${id}`);
    return res.data.data;
  },

  /**
   * Maps CustomerFormValues → CreateCustomerDTO shape.
   * The backend derives organizationId and userId from req.user, so we
   * only send the user-supplied fields.
   */
  create: async (form: CustomerFormValues): Promise<Customer> => {
    const payload = {
      name:       form.name,
      name_ar:    nullCoerce(form.name_ar),
      email:      form.email,
      phone:      nullCoerce(form.phone),
      type:       form.type,
      status:     form.status,
      vat_number: nullCoerce(form.vat_number),
    };
    const res = await api.post<{ success: true; data: Customer }>('/customers', payload);
    return res.data.data;
  },

  /**
   * Maps CustomerFormValues → UpdateCustomerDTO shape.
   */
  update: async (id: number, form: CustomerFormValues): Promise<Customer> => {
    const payload = {
      name:       form.name,
      name_ar:    nullCoerce(form.name_ar),
      email:      form.email,
      phone:      nullCoerce(form.phone),
      type:       form.type,
      status:     form.status,
      vat_number: nullCoerce(form.vat_number),
    };
    const res = await api.put<{ success: true; data: Customer }>(`/customers/${id}`, payload);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};