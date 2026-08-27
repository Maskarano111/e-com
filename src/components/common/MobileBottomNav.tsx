import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  ShoppingBag,
  Search,
  Heart,
  Store,
  Sparkles,
  User,
  Scale
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

  // Don't show in admin/vendor portals to preserve workspace
  if (currentView === 'admin' || currentView === 'vendor') return null;

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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 shadow-2xl safe-area-bottom"
    >
      <div className="grid grid-cols-5 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                item.active
                  ? 'text-emerald-600 dark:text-emerald-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${item.active ? 'scale-110' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${item.active ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
              {item.active && (
                <motion.div
                  layoutId="activeMobileIndicator"
                  className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
