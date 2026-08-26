import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Store,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNavigateToStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onNavigateToStore,
  children
}) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard & Analytics', icon: LayoutDashboard, badge: 'Live' },
    { id: 'vendors', label: 'Vendors & Merchants', icon: Store, badge: 'New' },
    { id: 'products', label: 'Products & Inventory', icon: Package, badge: undefined },
    { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag, badge: '3 New' },
    { id: 'categories', label: 'Departments & Tags', icon: Layers, badge: undefined },
    { id: 'coupons', label: 'Coupons & Vouchers', icon: Tag, badge: undefined },
    { id: 'customers', label: 'VIP & Customer Base', icon: Users, badge: undefined },
    { id: 'reviews', label: 'Review Moderation', icon: MessageSquare, badge: undefined },
    { id: 'settings', label: 'Boutique Settings', icon: Settings, badge: undefined }
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Layers className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 font-black text-sm ring-4 ring-emerald-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                  NovaMart <span className="text-emerald-600">HQ</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Accra Node
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Executive Management & Commercial Operations</p>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Live Storefront Button */}
          <button
            id="btn-admin-view-store"
            onClick={onNavigateToStore}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-colors shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">View Boutique</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Admin User Info Card */}
          <div className="flex items-center gap-2.5 pl-1">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.firstName}
              className="w-8 h-8 rounded-xl object-cover border border-emerald-500/30 ring-2 ring-emerald-500/10 shadow-xs"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {(user?.role || 'admin').replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="p-3 flex-1 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Controls */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle sidebar"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {!isCollapsed && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <div className="fixed inset-0 z-40 lg:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.div
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                className="relative bg-white dark:bg-slate-900 w-64 p-4 flex flex-col space-y-1 shadow-2xl z-10"
              >
                <div className="pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-sm">Navigation</span>
                  <button onClick={() => setMobileNavOpen(false)} className="text-slate-400 text-xs font-bold p-1">
                    ✕
                  </button>
                </div>

                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

