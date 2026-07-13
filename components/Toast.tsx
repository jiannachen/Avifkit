'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export type ToastType = 'error' | 'warning' | 'info' | 'success';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, toast.duration]);

  const getToastStyle = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    switch (toast.type) {
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      default:
        return <Info className={`${iconClass} text-blue-600`} />;
    }
  };

  return (
    <div role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'} className={`${getToastStyle()} flex w-full items-center gap-3 rounded-xl border p-4 shadow-md ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}`}>
      {getIcon()}
      <p className="flex-grow text-sm font-medium">{toast.message}</p>
      {toast.actionLabel && toast.onAction && (
        <button
          onClick={toast.onAction}
          className="text-xs font-semibold underline hover:no-underline whitespace-nowrap"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md transition-colors hover:bg-black/5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const MAX_VISIBLE_TOASTS = 5;

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  const visibleToasts = toasts.slice(-MAX_VISIBLE_TOASTS);

  return (
    <div className="fixed left-4 right-4 top-20 z-50 flex flex-col gap-2 sm:left-auto sm:w-full sm:max-w-md">
      {visibleToasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
