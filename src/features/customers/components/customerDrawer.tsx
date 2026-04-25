import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Customer } from '../../../types';
import { CustomerForm, type CustomerFormValues } from './CustomerForm';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer | null;          // null/undefined → create mode
    onSubmit: (data: CustomerFormValues) => Promise<void>;
    isSubmitting: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CustomerDrawer = ({
    isOpen,
    onClose,
    customer,
    onSubmit,
    isSubmitting,
}: CustomerDrawerProps) => {
    const isEditing = !!customer;
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                ref={overlayRef}
                onClick={onClose}
                className={[
                    'fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300',
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                aria-hidden="true"
            />

            {/* ── Panel ── */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={isEditing ? 'Edit customer' : 'Add customer'}
                className={[
                    'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl',
                    'transition-transform duration-300 ease-in-out',
                    isOpen ? 'translate-x-0' : 'translate-x-full',
                ].join(' ')}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {isEditing ? 'Edit Customer' : 'New Customer'}
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {isEditing
                                ? "Update the customer's details below."
                                : "Fill in the details to add a new customer."
                            }
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Close panel"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <CustomerForm
                        key={customer?.id ?? 'new'}   // remount when switching customer
                        defaultValues={customer ?? undefined}
                        onSubmit={onSubmit}
                        isSubmitting={isSubmitting}
                        submitLabel={isEditing ? 'Save Changes' : 'Add Customer'}
                        onCancel={onClose}
                    />
                </div>
            </aside>
        </>
    );
};