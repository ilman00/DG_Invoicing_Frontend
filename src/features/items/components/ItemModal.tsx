import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Item } from '../../../types';
import { ItemForm, type ItemFormValues } from './ItemsForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item?: Item | null;
  onSubmit: (data: ItemFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const ItemModal = ({ isOpen, onClose, item, onSubmit, isSubmitting }: Props) => {
  const isEditing = !!item;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {isEditing ? 'Edit Item' : 'New Item'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEditing ? `Editing · ID #${item.id}` : 'Add a new item to your catalog'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          <ItemForm
            defaultValues={item}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};