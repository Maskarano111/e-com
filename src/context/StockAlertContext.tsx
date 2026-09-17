import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

export interface StockAlertEntry {
  productId: string;
  productName: string;
  email: string;
  subscribedAt: string;
}

interface StockAlertContextType {
  alerts: StockAlertEntry[];
  addAlert: (productId: string, email: string, productName: string) => void;
  removeAlert: (productId: string) => void;
  isAlerted: (productId: string) => boolean;
  clearAlerts: () => void;
}

const DEFAULT_CONTEXT: StockAlertContextType = {
  alerts: [],
  addAlert: () => {},
  removeAlert: () => {},
  isAlerted: () => false,
  clearAlerts: () => {},
};

const StockAlertContext = createContext<StockAlertContextType>(DEFAULT_CONTEXT);

const STORAGE_KEY = 'novamart_stock_alerts';

export const StockAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<StockAlertEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useToast();

  // Persist to localStorage whenever alerts change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  const isAlerted = useCallback(
    (productId: string) => alerts.some((a) => a.productId === productId),
    [alerts]
  );

  const addAlert = useCallback(
    (productId: string, email: string, productName: string) => {
      if (alerts.some((a) => a.productId === productId)) {
        showToast('info', 'Already Subscribed', `You'll be notified when ${productName} is back in stock.`);
        return;
      }
      const entry: StockAlertEntry = {
        productId,
        productName,
        email,
        subscribedAt: new Date().toISOString(),
      };
      setAlerts((prev) => [...prev, entry]);
      showToast(
        'success',
        '🔔 Stock Alert Set!',
        `We'll email you at ${email} the moment ${productName} is back in stock.`
      );
    },
    [alerts, showToast]
  );

  const removeAlert = useCallback(
    (productId: string) => {
      setAlerts((prev) => prev.filter((a) => a.productId !== productId));
      showToast('info', 'Alert Removed', 'Stock notification has been cancelled.');
    },
    [showToast]
  );

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <StockAlertContext.Provider value={{ alerts, addAlert, removeAlert, isAlerted, clearAlerts }}>
      {children}
    </StockAlertContext.Provider>
  );
};

export const useStockAlert = () => {
  const ctx = useContext(StockAlertContext);
  return ctx || DEFAULT_CONTEXT;
};
