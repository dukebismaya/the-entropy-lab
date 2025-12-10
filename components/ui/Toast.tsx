import React from 'react';

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

export type ToastPayload = Omit<ToastMessage, 'id'>;

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  info: 'bg-white/10 text-white border-white/20',
  success: 'bg-emerald-500/90 text-white border-emerald-400/60',
  error: 'bg-red-500/90 text-white border-red-400/60',
};

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onDismiss }) => (
  <div className="fixed top-24 right-4 z-[999] flex flex-col gap-3 pointer-events-none">
    {toasts.map(toast => (
      <div
        key={toast.id}
        className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-xl border backdrop-blur ${variantStyles[toast.variant]}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <p className="text-sm font-medium tracking-wide flex-1">{toast.message}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="text-white/70 hover:text-white text-lg leading-none"
            onClick={() => onDismiss(toast.id)}
          >
            ×
          </button>
        </div>
      </div>
    ))}
  </div>
);
