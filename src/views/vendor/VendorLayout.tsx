import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Store,
  MessageSquare,
  ExternalLink,
  Plus,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Wallet,
  Percent,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../services/api';
import { Vendor } from '../../types/index';

interface VendorLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNavigateToStore: () => void;
  onOpenAddProduct?: () => void;
  children: React.ReactNode;
}

export const VendorLayout: React.FC<VendorLayoutProps> = ({
  currentTab,
  onTabChange,
  onNavigateToStore,
  onOpenAddProduct,
  children
}) => {
  const { user, logout } = useAuth();
  const { formatPrice } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      if (user?.vendorId) {
        const v = await api.getVendorById(user.vendorId);
        if (v) setVendor(v);
      } else {
        // Fallback demo vendor if not tagged
        const v = await api.getVendorById('vend-kofi');
        if (v) setVendor(v);
      }
    };
    fetchVendor();
  }, [user]);

  const NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard & Analytics', icon: LayoutDashboard, badge: 'Live' },
    { id: 'products', label: 'My Products & Catalog', icon: Package, badge: undefined },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag, badge: 'Active' },
    { id: 'payouts', label: 'Wallet & Payouts', icon: CreditCard, badge: undefined },
    { id: 'profile', label: 'Storefront Profile', icon: Store, badge: undefined },
    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare, badge: undefined }
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Seller Bar */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Store Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 font-black text-sm ring-4 ring-amber-500/10">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                  {vendor?.storeName || user?.vendorStoreName || 'Seller Hub'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified Merchant
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Merchant Operations &amp; Direct Marketplace Portal
              </p>
            </div>
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance Badge */}
          <div
            onClick={() => onTabChange('payouts')}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors shadow-2xs"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-600" />
            <span>Balance: {formatPrice(vendor?.balance || 3450.00)}</span>
          </div>

          {/* View Live Boutique */}
          <button
            onClick={onNavigateToStore}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Storefront</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>

          {/* User Sign out */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area: Sidebar + Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 hidden lg:flex flex-col justify-between p-4 shrink-0 shadow-xs">
          <div className="space-y-6">
            {/* Vendor Profile Card */}
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-slate-50 to-amber-50/40 dark:from-slate-800/80 dark:to-amber-950/20 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <img
                src={vendor?.logo || user?.profileImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                alt="Store Logo"
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {vendor?.storeName || 'Kofi Tech & Audio'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{vendor?.ownerName || user?.firstName} (Merchant)</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Percent className="w-2.5 h-2.5" />
                  {vendor?.commissionRate || 10}% Commission
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick upload CTA */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <p className="font-bold text-xs text-amber-950 dark:text-amber-200">Expand Your Store</p>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
              List new stock items with images, pricing, and instant live catalog indexing.
            </p>
            <button
              onClick={() => {
                onTabChange('products');
                if (onOpenAddProduct) onOpenAddProduct();
              }}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List New Product</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-2xl z-50"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-amber-500" />
                      <span className="font-black text-sm text-slate-900 dark:text-white">Seller Portal</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onTabChange(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                            isActive
                              ? 'bg-amber-500 text-white shadow-md'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={onNavigateToStore}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600"
                  >
                    <span>View Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={logout} className="text-xs text-rose-600 font-bold">
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Content View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
};
