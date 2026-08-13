import { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onCancel}>
            Batal
          </button>
          <button className="btn-danger flex-1" onClick={onConfirm}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-florist-200">{icon}</div>
      <p className="font-medium text-gray-600">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
    </div>
  );
}

interface LoadingProps {
  text?: string;
}

export function Loading({ text = 'Memuat...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-florist-400" size={24} />
      <span className="ml-2 text-sm text-gray-400">{text}</span>
    </div>
  );
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toastEl = toast ? (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-slideup">
      <div
        className={`rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-sage-500 text-white' : 'bg-red-500 text-white'
        }`}
      >
        {toast.message}
      </div>
    </div>
  ) : null;

  return { showToast, toastEl };
}
