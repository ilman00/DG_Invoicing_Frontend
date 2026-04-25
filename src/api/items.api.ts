import { api } from '../lib/axios';
import type { Item, CreateItemDTO, UpdateItemDTO } from '../types';

export const itemsApi = {
  getAll: async (): Promise<Item[]> => {
    const res = await api.get<{ success: true; data: Item[] }>('/items');
    return res.data.data;
  },

  getById: async (id: number): Promise<Item> => {
    const res = await api.get<{ success: true; data: Item }>(`/items/${id}`);
    return res.data.data;
  },

  create: async (data: CreateItemDTO): Promise<Item> => {
    const res = await api.post<{ success: true; data: Item }>('/items', data);
    return res.data.data;
  },

  update: async (id: number, data: UpdateItemDTO): Promise<Item> => {
    const res = await api.put<{ success: true; data: Item }>(`/items/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
};
