import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  ShoppingBag,
  Search,
  Heart,
  Store,
  User
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  onOpenCart: () => void;
  onOpenCommandPalette: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenCart,
  onOpenCommandPalette
}) => {
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const [tappedId, setTappedId] = useState<string | null>(null);

  // Don't show in admin/vendor portals to preserve workspace
  if (currentView === 'admin' || currentView === 'vendor') return null;

  const handleTap = (id: string, action: () => void) => {
    setTappedId(id);
    action();
    setTimeout(() => setTappedId(null), 200);
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => onNavigate('home'),
      active: currentView === 'home'
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: Store,
      action: () => onNavigate('shop'),
      active: currentView === 'shop'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: onOpenCommandPalette,
      active: false
    },
    {
      id: 'wishlist',
      label: 'Saved',
      icon: Heart,
      badge: wishlistCount,
      action: () => onNavigate('wishlist'),
      active: currentView === 'wishlist'
    },
    {
      id: 'cart',
      label: 'My Bag',
      icon: ShoppingBag,
      badge: itemCount,
      action: () => {
        setIsCartDrawerOpen(true);
        onOpenCart();
      },
      active: currentView === 'cart'
    }
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/97 dark:bg-slate-900/97 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-1 pt-1 pb-[max(env(safe-area-inset-bottom,8px),8px)] shadow-2xl"
    >
      <div className="grid grid-cols-5 items-end justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          const isTapped = tappedId === item.id;

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => handleTap(item.id, item.action)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center min-h-[48px] px-1 py-1 rounded-2xl transition-colors duration-150 cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {/* Active pill background */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="bottomNavActivePill"
                    className="absolute inset-x-1 top-0.5 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon + Badge */}
              <motion.div
                className="relative z-10"
                animate={isTapped ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`relative z-10 text-[11px] mt-0.5 leading-none ${
                  isActive ? 'font-black' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
