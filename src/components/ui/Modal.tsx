import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'w-full max-w-lg bg-card rounded-lg border border-border shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div>
            <Dialog.Title className="text-sm font-semibold text-foreground">
              {title}
            </Dialog.Title>
            {description && (
              <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                {description}
              </Dialog.Description>
            )}
          </div>
          <Dialog.Close className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="w-4 h-4" />
          </Dialog.Close>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
