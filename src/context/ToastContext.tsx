import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (typeOrMessage: ToastType | string, titleOrType?: string | ToastType, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_TOAST_CONTEXT: ToastContextType = {
  toasts: [],
  showToast: () => {},
  removeToast: () => {}
};

const ToastContext = createContext<ToastContextType>(DEFAULT_TOAST_CONTEXT);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((
    typeOrMessage: ToastType | string,
    titleOrType?: string | ToastType,
    message?: string,
    duration = 4000
  ) => {
    let type: ToastType = 'info';
    let title = '';
    let msg = message;

    const validTypes: ToastType[] = ['success', 'error', 'info', 'warning'];
    if (validTypes.includes(typeOrMessage as ToastType)) {
      type = typeOrMessage as ToastType;
      title = (titleOrType as string) || '';
    } else {
      title = typeOrMessage;
      if (titleOrType && validTypes.includes(titleOrType as ToastType)) {
        type = titleOrType as ToastType;
      } else {
        type = 'info';
        msg = titleOrType as string;
      }
    }

    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: Toast = { id, type, title, message: msg, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const bgClass =
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/50'
                : toast.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-700/50'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 text-amber-100 border-amber-700/50'
                : 'bg-slate-900/90 text-slate-100 border-slate-700/50';

            const Icon =
              toast.type === 'success'
                ? CheckCircle2
                : toast.type === 'error'
                ? AlertCircle
                : toast.type === 'warning'
                ? AlertTriangle
                : Info;

            const iconColor =
              toast.type === 'success'
                ? 'text-emerald-400'
                : toast.type === 'error'
                ? 'text-rose-400'
                : toast.type === 'warning'
                ? 'text-amber-400'
                : 'text-blue-400';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${bgClass}`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm leading-snug">{toast.title}</h4>
                  {toast.message && <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>}
                </div>
                <button
                  id={`btn-close-toast-${toast.id}`}
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-white/60 hover:text-white transition-colors p-0.5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  return context || DEFAULT_TOAST_CONTEXT;
};
