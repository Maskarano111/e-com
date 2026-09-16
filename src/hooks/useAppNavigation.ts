import { useState, useEffect } from 'react';
import { Product } from '../types/index';
import { api } from '../services/api';

export interface AppNavState {
  // Core navigation
  currentView: string;
  viewParams: Record<string, any>;
  handleNavigate: (view: string, param?: Record<string, any>) => void;

  // Admin portal tabs
  adminTab: string;
  setAdminTab: (tab: string) => void;

  // Vendor portal tabs
  vendorTab: string;
  setVendorTab: (tab: string) => void;
  isVendorAddOpen: boolean;
  setIsVendorAddOpen: (open: boolean) => void;

  // Modal visibility
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isScentQuizOpen: boolean;
  setIsScentQuizOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Quick-view & review
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  reviewProduct: Product | null;
  setReviewProduct: (product: Product | null) => void;
  handleOpenQuickView: (product: Product) => void;
  handleOpenReview: (product: Product) => void;

  // Scent quiz product list
  allProducts: Product[];
}

/**
 * useAppNavigation
 *
 * Centralises all navigation, tab, and modal state that previously
 * lived directly inside the MainApp component in App.tsx.
 * Extracting it here keeps App.tsx focused on rendering and wiring,
 * not on state management.
 */
export function useAppNavigation(): AppNavState {
  // Core navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<Record<string, any>>({});

  // Admin / Vendor portal tabs
  const [adminTab, setAdminTab] = useState<string>('overview');
  const [vendorTab, setVendorTab] = useState<string>('overview');
  const [isVendorAddOpen, setIsVendorAddOpen] = useState(false);

  // Modal visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScentQuizOpen, setIsScentQuizOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Quick-view & review
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);

  // Products for scent quiz
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Global Ctrl+K / Cmd+K shortcut -- opens command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Preload products for scent quiz modal
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.getProducts({ limit: 30 });
        if (res?.products) {
          setAllProducts(res.products);
        }
      } catch (e) {
        console.error('Failed to load products for quiz:', e);
      }
    };
    loadProducts();
  }, []);

  // Scroll to top whenever the active view or its params change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParams]);

  // Navigation handler
  const handleNavigate = (view: string, param?: Record<string, any>) => {
    if (view === 'scent-quiz') {
      setIsScentQuizOpen(true);
      return;
    }
    setCurrentView(view);
    setViewParams(param ?? {});
  };

  // Convenience helpers
  const handleOpenQuickView = (product: Product) => setQuickViewProduct(product);
  const handleOpenReview = (product: Product) => setReviewProduct(product);

  return {
    currentView,
    viewParams,
    handleNavigate,
    adminTab,
    setAdminTab,
    vendorTab,
    setVendorTab,
    isVendorAddOpen,
    setIsVendorAddOpen,
    isCartOpen,
    setIsCartOpen,
    isScentQuizOpen,
    setIsScentQuizOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    quickViewProduct,
    setQuickViewProduct,
    reviewProduct,
    setReviewProduct,
    handleOpenQuickView,
    handleOpenReview,
    allProducts,
  };
}
