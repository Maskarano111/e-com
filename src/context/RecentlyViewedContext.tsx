import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index';

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const MAX_RECENT_ITEMS = 12;
const STORAGE_KEY = 'novamart_recently_viewed';

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (e) {
      console.warn('Failed to store recently viewed items', e);
    }
  }, [recentlyViewed]);

  const addRecentlyViewed = (product: Product) => {
    if (!product || !product.id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addRecentlyViewed,
        clearRecentlyViewed
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
};
