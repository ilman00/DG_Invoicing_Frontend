import { api } from '../lib/axios';
import type {
  InvoiceWithDetails,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
} from '../types';

export const invoicesApi = {
  getAll: async (): Promise<InvoiceWithDetails[]> => {
    const res = await api.get<{ success: true; data: InvoiceWithDetails[] }>('/invoices');
    return res.data.data;
  },

  getById: async (id: number): Promise<InvoiceWithDetails> => {
    const res = await api.get<{ success: true; data: InvoiceWithDetails }>(`/invoices/${id}`);
    return res.data.data;
  },

  create: async (data: CreateInvoiceDTO): Promise<InvoiceWithDetails> => {
    const res = await api.post<{ success: true; data: InvoiceWithDetails }>('/invoices', data);
    return res.data.data;
  },

  update: async (id: number, data: UpdateInvoiceDTO): Promise<InvoiceWithDetails> => {
    const res = await api.put<{ success: true; data: InvoiceWithDetails }>(`/invoices/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },
};
