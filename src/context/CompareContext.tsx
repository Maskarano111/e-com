import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index';
import { useToast } from './ToastContext';

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'novamart_compare_items';

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
    } catch (e) {
      console.warn('Failed to save compare items to local storage', e);
    }
  }, [compareItems]);

  const isInCompare = (productId: string) => {
    return compareItems.some((item) => item.id === productId);
  };

  const addToCompare = (product: Product) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      return;
    }

    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      showToast('warning', 'Comparison Limit Reached', `You can compare up to ${MAX_COMPARE_ITEMS} products at a time.`);
      return;
    }

    setCompareItems((prev) => [...prev, product]);
    showToast('success', 'Added to Comparison', `Added "${product.name}" to compare list.`);
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== productId));
    showToast('info', 'Removed from Comparison', 'Item removed from compare list.');
  };

  const clearCompare = () => {
    setCompareItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setIsCompareModalOpen(false);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        compareCount: compareItems.length
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
};
