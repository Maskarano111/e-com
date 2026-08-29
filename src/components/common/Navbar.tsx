import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Phone,
  Truck,
  ShieldCheck,
  Tag,
  Zap,
  LogOut,
  LayoutDashboard,
  Package,
  SlidersHorizontal,
  Flame,
  Gift,
  Sparkles,
  Sun,
  Moon,
  Store,
  Scale,
  Command
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useSettings, CURRENCY_MAP, COUNTRY_MAP, SupportedCurrency, SupportedCountry } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useFontSize } from '../../context/FontSizeContext';
import { DemoSwitcher } from './DemoSwitcher';
import { Product, Category } from '../../types/index';
import { api } from '../../services/api';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  categories?: Category[];
  onOpenCart?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  categories: propsCategories,
  onOpenCart,
  onOpenCommandPalette
}) => {
  const { user, isAdmin, isVendor, logout } = useAuth();
  const { itemCount, subtotal, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount, setIsCompareModalOpen } = useCompare();
  const { settings, currency, setCurrency, country, setCountry, countryConfig, formatPrice } = useSettings();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();

  const [categories, setCategories] = useState<Category[]>(propsCategories || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  // Notification polling
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await api.getNotifications({ userId: user.id, target: 'customer' });
        if (res) setNotifications(res);
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside notifications
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load categories if not provided in props
  useEffect(() => {
    if (propsCategories && propsCategories.length > 0) {
      setCategories(propsCategories);
      return;
    }
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res) setCategories(res);
      } catch (err) {
        console.error('Failed to load nav categories', err);
      }
    };
    fetchCats();
  }, [propsCategories]);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getProducts({ search: searchQuery, limit: 5 });
        setSearchResults(res.products);
        setIsSearchOpen(true);
      } catch (e) {
        console.error('Search error', e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      onNavigate('shop', { search: searchQuery.trim() });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* 1. TOP PROMO BAR */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px] font-medium">
            {/* Country Market Switcher */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              {(['GH', 'NG'] as const).map((cCode) => {
                const c = COUNTRY_MAP[cCode];
                return (
                  <button
                    key={cCode}
                    id={`btn-market-${cCode.toLowerCase()}`}
                    type="button"
                    onClick={() => setCountry(cCode)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                      country === cCode
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>

            <span className="flex items-center gap-1.5 text-emerald-400">
              <Truck className="w-3.5 h-3.5" />
              <span>{countryConfig.deliveryPromo}</span>
            </span>
            <span className="hidden lg:inline-block text-slate-600">|</span>
            <span className="hidden lg:flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Hotline: {countryConfig.supportPhone}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Expanded Currency selector */}
            <div className="relative flex items-center">
              <select
                id="select-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                className="bg-slate-800/90 text-slate-200 text-[11px] font-bold py-1 px-2.5 rounded-lg border border-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none pr-6"
              >
                {Object.values(CURRENCY_MAP).map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
            </div>

            <button
              id="btn-track-order-top"
              onClick={() => onNavigate('track-order')}
              className="text-[11px] text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-2"
            >
              Track Order
            </button>

            {/* Quick Demo Switcher */}
            <DemoSwitcher
              onNavigateToAdmin={() => onNavigate('admin')}
              onNavigateToVendor={() => onNavigate('vendor')}
              onNavigateToCustomer={() => onNavigate('account')}
            />
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-500/10">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Nova<span className="text-emerald-600">Mart</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-600">
                Online Superstore & Marketplace
              </span>
            </div>
          </div>

          {/* Search Bar with live preview */}
          <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="input-global-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                placeholder="Search phones, electronics, blenders, fashion, health, perfumes, supermarket..."
                className="w-full pl-11 pr-24 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-hidden shadow-inner"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-0.5"
                  title="Open Spotlight Command Palette (Ctrl+K)"
                >
                  <Command className="w-2.5 h-2.5" /> K
                </button>
              </div>
              <button
                id="btn-submit-search"
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Search autocomplete dropdown */}
            <AnimatePresence>
              {isSearchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Products matching "{searchQuery}"
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          onNavigate('product-detail', { productId: product.id });
                        }}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
                      >
                        <img
                          src={product.featuredImage}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{product.name}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">{product.brand} • {product.categoryName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-emerald-600">
                            {formatPrice(product.discountPrice || product.price)}
                          </p>
                          {product.discountPrice && (
                            <p className="text-[10px] text-slate-400 line-through">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onNavigate('shop', { search: searchQuery });
                    }}
                    className="w-full text-center py-2.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl mt-1 transition-colors"
                  >
                    View all matching results →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right actions: Admin toggle, Wishlist, Cart, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Dashboard shortcut button if admin */}
            {isAdmin && (
              <button
                id="btn-admin-portal-nav"
                onClick={() => onNavigate('admin')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* Font Size Accessibility Controls */}
            <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-1 py-1" title="Adjust text size for accessibility">
              <button
                id="btn-font-decrease"
                onClick={decreaseFontSize}
                disabled={fontSize === 'normal'}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-xs"
                title="Decrease text size"
                aria-label="Decrease font size"
              >
                <span style={{ fontSize: '11px', fontWeight: 800 }}>A</span>
              </button>
              <div className="flex gap-0.5 px-0.5">
                {(['normal', 'large', 'xl'] as const).map(level => (
                  <span
                    key={level}
                    className={`w-1 h-1 rounded-full transition-all ${
                      fontSize === level ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <button
                id="btn-font-increase"
                onClick={increaseFontSize}
                disabled={fontSize === 'xl'}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Increase text size"
                aria-label="Increase font size"
              >
                <span style={{ fontSize: '15px', fontWeight: 800 }}>A</span>
              </button>
            </div>

            {/* Mobile Search Spotlight Button */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Search Catalog (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle Button (Light/Dark Mode) - Desktop & Tablet */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="hidden sm:flex p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={resolvedTheme === 'dark' ? 'Switch to Light Mode (Clean White)' : 'Switch to Dark Mode (Midnight Emerald)'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Compare Products Button - Desktop */}
            <button
              id="btn-compare-nav"
              onClick={() => setIsCompareModalOpen(true)}
              className="hidden sm:flex relative p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Compare Products Matrix"
            >
              <Scale className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Notification Bell - for logged-in users */}
            {user && (
              <div className="relative hidden sm:block" ref={notifRef}>
                <button
                  id="btn-notifications-nav"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={async () => {
                            for (const n of notifications.filter(n => !n.read)) {
                              await api.markNotificationRead(n.id);
                            }
                            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          }} className="text-xs text-emerald-600 font-bold hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-sm">No notifications yet</div>
                        ) : notifications.slice(0, 8).map(n => (
                          <div key={n.id} className={`p-3 ${!n.read ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : ''}`}>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Wishlist Icon - Desktop */}
            <button
              id="btn-wishlist-nav"
              onClick={() => onNavigate('wishlist')}
              className="hidden sm:flex relative p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger - Desktop */}
            <button
              id="btn-cart-nav"
              onClick={() => {
                setIsCartDrawerOpen(true);
                if (onOpenCart) onOpenCart();
              }}
              className="hidden sm:flex relative items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-md group cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 group-hover:bg-white group-hover:text-emerald-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="text-left text-xs">
                <p className="text-[10px] opacity-75 leading-none">My Bag</p>
                <p className="font-bold leading-tight mt-0.5">{formatPrice(subtotal)}</p>
              </div>
            </button>

            {/* User Account / Login Dropdown */}
            <div className="relative">
              {user ? (
                <button
                  id="btn-user-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:pr-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-lg object-cover bg-emerald-100"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white">{user.firstName}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 capitalize">{(user.role || 'customer').replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>
              ) : (
                <button
                  id="btn-login-nav"
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-600 hover:text-emerald-600 text-xs font-bold transition-all cursor-pointer"
                  title="Sign In"
                >
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && user && (
                  <>
                    <div className="fixed inset-0" onClick={() => setIsUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-slate-800 dark:text-slate-100"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="space-y-0.5 text-xs font-medium">
                        {isAdmin && (
                          <button
                            id="btn-user-admin"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors font-semibold"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin HQ Dashboard</span>
                          </button>
                        )}

                        {(isVendor || isAdmin) && (
                          <button
                            id="btn-user-vendor"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigate('vendor');
                            }}
                            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors font-semibold"
                          >
                            <Store className="w-4 h-4" />
                            <span>Seller / Vendor Hub</span>
                          </button>
                        )}

                        <button
                          id="btn-user-account"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('account');
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          <span>My Account</span>
                        </button>

                        <button
                          id="btn-user-orders"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('account', { tab: 'orders' });
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Package className="w-4 h-4 text-slate-500" />
                          <span>My Orders & Tracking</span>
                        </button>

                        <button
                          id="btn-user-wishlist"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('wishlist');
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-slate-500" />
                          <span>Wishlist ({wishlistCount})</span>
                        </button>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                        <button
                          id="btn-user-logout"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle button */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 3. NAVIGATION BAR (CATEGORIES & MAIN LINKS) */}
        <div className="hidden md:flex items-center justify-between py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-6">
            {/* All Categories Dropdown */}
            <div className="relative">
              <button
                id="btn-categories-dropdown"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-white font-bold"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>All Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {isCategoryMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setIsCategoryMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50"
                    >
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        Shop By Department
                      </div>
                      <div className="space-y-1 mt-1 max-h-96 overflow-y-auto">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setIsCategoryMenuOpen(false);
                              onNavigate('shop', { category: cat.id });
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-emerald-700 transition-colors"
                          >
                            <span className="font-semibold text-xs">{cat.name}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-bold">
                              {cat.productCount || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Links */}
            <button
              id="nav-link-home"
              onClick={() => onNavigate('home')}
              className={`hover:text-emerald-600 transition-colors ${currentView === 'home' ? 'text-emerald-600 font-bold' : ''}`}
            >
              Home
            </button>
            <button
              id="nav-link-shop"
              onClick={() => onNavigate('shop')}
              className={`hover:text-emerald-600 transition-colors ${currentView === 'shop' ? 'text-emerald-600 font-bold' : ''}`}
            >
              All Products
            </button>
            <button
              id="nav-link-phones"
              onClick={() => onNavigate('shop', { category: 'cat-phones' })}
              className="hover:text-emerald-600 transition-colors"
            >
              Phones & Tablets
            </button>
            <button
              id="nav-link-electronics"
              onClick={() => onNavigate('shop', { category: 'cat-electronics' })}
              className="hover:text-emerald-600 transition-colors"
            >
              Electronics
            </button>
            <button
              id="nav-link-appliances"
              onClick={() => onNavigate('shop', { category: 'cat-appliances' })}
              className="hover:text-emerald-600 transition-colors"
            >
              Home & Appliances
            </button>
            <button
              id="nav-link-fashion"
              onClick={() => onNavigate('shop', { category: 'cat-fashion' })}
              className="hover:text-emerald-600 transition-colors"
            >
              Fashion
            </button>
            <button
              id="nav-link-deals"
              onClick={() => onNavigate('shop', { dealsOnly: true })}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold transition-colors"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Flash Sales</span>
            </button>
            <button
              id="nav-link-about"
              onClick={() => onNavigate('about')}
              className="hover:text-emerald-600 transition-colors"
            >
              About Us
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => onNavigate('shop', { dealsOnly: true })}
              className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              <span>Explore Live Deals →</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER NAVIGATION */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4"
          >
            {/* Mobile search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="input-mobile-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Search
              </button>
            </form>

            {/* Mobile Regional Market Switcher */}
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">Select Market Region</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCountry('GH')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    country === 'GH'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🇬🇭</span>
                  <span>Ghana (GH₵)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCountry('NG')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    country === 'NG'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🇳🇬</span>
                  <span>Nigeria (₦)</span>
                </button>
              </div>
            </div>

            {/* User Account / Profile Mobile Card */}
            {!user ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-md">
                <div>
                  <p className="font-bold text-xs">Welcome to NovaMart</p>
                  <p className="text-[10px] text-emerald-100">Sign in to save items &amp; track orders</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('login');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-700 font-black text-xs shadow-xs active:scale-95 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
                    alt={user.firstName}
                    className="w-9 h-9 rounded-xl object-cover bg-emerald-100"
                  />
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{(user.role || 'customer').replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('account');
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-xs text-rose-500 hover:underline font-bold cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('shop');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                All Products
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('shop', { dealsOnly: true });
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600"
              >
                Hot Deals 🔥
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('track-order');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Track Order
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartDrawerOpen(true);
                  if (onOpenCart) onOpenCart();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Shopping Bag</span>
                </span>
                {itemCount > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {itemCount} items
                  </span>
                )}
              </button>

              {/* Mobile Theme Switcher */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2 py-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Store Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  {resolvedTheme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-600" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Font Size Control */}
              <div className="flex items-center justify-between px-2 py-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Text Size</span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1">
                  <button
                    onClick={decreaseFontSize}
                    disabled={fontSize === 'normal'}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-slate-700 dark:text-slate-200"
                    aria-label="Smaller text"
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>A−</span>
                  </button>
                  <span className="text-[10px] font-bold text-emerald-600 w-10 text-center capitalize">{fontSize}</span>
                  <button
                    onClick={increaseFontSize}
                    disabled={fontSize === 'xl'}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-slate-700 dark:text-slate-200"
                    aria-label="Larger text"
                  >
                    <span style={{ fontSize: '15px', fontWeight: 800 }}>A+</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 px-2 mb-2 uppercase tracking-wider">Categories</p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('shop', { category: c.id });
                      }}
                      className="text-left p-2 rounded-lg text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 truncate"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold"
                >
                  Admin Management Portal
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
