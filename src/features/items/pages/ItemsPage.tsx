import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';

import { useItems } from '../../../hooks/useItems';
import { ItemModal } from '../components/ItemModal';
import type { Item } from '../../../types';
import type { ItemFormValues } from '../components/ItemsForm';

export const ItemsPage = () => {
  const { items, isLoading, error, createItem, updateItem, deleteItem } = useItems();

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'name_asc' | 'price_desc' | 'price_asc'>('created_desc');
  const [mutationError, setMutationError] = useState<string | null>(null);


  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = items.filter(
      (i) => i.name.toLowerCase().includes(q) || (i.name_ar ?? '').includes(q),
    );
    if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'created_asc')
      list = [...list].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    else
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    return list;
  }, [items, query, sortBy]);

  const stats = useMemo(() => {
    const withAr = items.filter((i) => i.name_ar?.trim()).length;
    const avg = items.length
      ? items.reduce((s, i) => s + Number(i.price), 0) / items.length
      : 0;
    return { total: items.length, withAr, avg };
  }, [items]);

  const handleSubmit = async (data: ItemFormValues) => {
    setIsSubmitting(true);
    setMutationError(null);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, data);
      } else {
        await createItem(data);
      }
      setOpen(false);
    } catch (err: any) {
      setMutationError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMutationError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this item? It may be referenced by existing invoices.')) return;
    await deleteItem(id);
  };

  const fmtPrice = (p: number) =>
    Number(p).toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('en-SA', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6 px-8 py-8">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Arabic name required on all items for ZATCA Phase 2 compliance
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Total items</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">With Arabic name</p>
          <p className="text-2xl font-semibold">
            {stats.withAr}
            {stats.total > 0 && stats.withAr < stats.total && (
              <span className="text-sm text-red-500 font-normal ml-2">
                {stats.total - stats.withAr} missing
              </span>
            )}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Avg. price (SAR)</p>
          <p className="text-2xl font-semibold">{fmtPrice(stats.avg)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by name or Arabic name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-8 w-full"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="input w-auto"
        >
          <option value="created_desc">Newest first</option>
          <option value="created_asc">Oldest first</option>
          <option value="name_asc">Name A–Z</option>
          <option value="price_desc">Price high–low</option>
          <option value="price_asc">Price low–high</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-600 text-sm flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">No items found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium w-[22%]">Name (EN)</th>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium w-[22%]">
                  Name (AR)
                  <span className="ml-1 text-blue-500 text-[10px]">ZATCA</span>
                </th>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium w-[14%]">Price (SAR)</th>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium w-[14%]">Price + VAT</th>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium w-[13%]">Created</th>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium w-[10%]">Updated by</th>
                <th className="px-5 py-3 w-[5%]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b last:border-b-0">
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-0 truncate">
                    {item.name}
                  </td>
                  <td className="px-5 py-3 max-w-0">
                    {item.name_ar ? (
                      <span className="text-gray-700 truncate block text-right" dir="rtl">
                        {item.name_ar}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        <AlertTriangle size={11} />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {fmtPrice(item.price)}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {fmtPrice(Number(item.price) * 1.15)}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {fmtDate(item.created_at)}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {item.updated_by ? `User #${item.updated_by}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditingItem(item); setOpen(true); }}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <ItemModal
        isOpen={open}
        onClose={handleClose}
        item={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={mutationError}     // ← add this
      />
    </div>
  );
};