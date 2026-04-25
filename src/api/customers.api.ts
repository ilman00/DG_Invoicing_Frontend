import { api } from '../lib/axios';
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../types';

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const res = await api.get<{ success: true; data: Customer[] }>('/customers');
    return res.data.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const res = await api.get<{ success: true; data: Customer }>(`/customers/${id}`);
    return res.data.data;
  },

  create: async (data: CreateCustomerDTO): Promise<Customer> => {
    const res = await api.post<{ success: true; data: Customer }>('/customers', data);
    return res.data.data;
  },

  update: async (id: number, data: UpdateCustomerDTO): Promise<Customer> => {
    const res = await api.put<{ success: true; data: Customer }>(`/customers/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
