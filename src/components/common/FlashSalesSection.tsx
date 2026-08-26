import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, ChevronLeft, ChevronRight, ChevronRight as ArrowRightIcon, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product } from '../../types/index';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

interface FlashSalesSectionProps {
  deals: Product[];
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView: (product: Product) => void;
}

export const FlashSalesSection: React.FC<FlashSalesSectionProps> = ({
  deals,
  onNavigate,
  onOpenQuickView
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useSettings();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Live countdown timer state (24-hour cycle calculated to target end of day or deal deadline)
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      // Target next 6-hour flash sale slot (00:00, 06:00, 12:00, 18:00)
      const nextSlot = new Date(now);
      const currentHour = now.getHours();
      const nextSlotHour = (Math.floor(currentHour / 6) + 1) * 6;
      
      if (nextSlotHour >= 24) {
        nextSlot.setDate(nextSlot.getDate() + 1);
        nextSlot.setHours(0, 0, 0, 0);
      } else {
        nextSlot.setHours(nextSlotHour, 0, 0, 0);
      }

      const diffMs = Math.max(0, nextSlot.getTime() - now.getTime());
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!deals || deals.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Card with Red Header and White Content Body */}
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-rose-200/80 dark:border-rose-950/60 bg-white dark:bg-slate-900 transition-colors">
        
        {/* 1. VIBRANT CRIMSON HEADER BAR */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 sm:px-6 py-3 sm:py-3.5 text-white flex items-center justify-between gap-3 select-none">
          {/* Left: Yellow Badge & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 text-red-700 flex items-center justify-center font-black shadow-md shrink-0 animate-bounce">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-tight uppercase drop-shadow-xs">
                Flash Sales
              </h2>
            </div>
          </div>

          {/* Center: Live Deal Countdown Clock */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-semibold text-rose-100 hidden md:inline">
              Time Left:
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm lg:text-base tracking-wider bg-black/20 backdrop-blur-xs px-2.5 sm:px-3.5 py-1 rounded-xl border border-white/20 shadow-inner">
              <span className="bg-white/15 px-1.5 py-0.5 rounded text-amber-300">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span className="text-rose-200 font-bold">:</span>
              <span className="bg-white/15 px-1.5 py-0.5 rounded text-amber-300">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span className="text-rose-200 font-bold">:</span>
              <span className="bg-white/15 px-1.5 py-0.5 rounded text-amber-300 animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Right: See All Link + Desktop Scroll Chevrons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('shop', { dealsOnly: true })}
              className="group flex items-center gap-1 text-xs sm:text-sm font-bold text-white hover:text-amber-300 transition-colors py-1 px-2 rounded-lg hover:bg-white/10 active:scale-95"
            >
              <span>See All</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Scroll buttons for desktop */}
            <div className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-white/20">
              <button
                onClick={() => handleScroll('left')}
                className="w-7 h-7 rounded-full bg-black/20 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-7 h-7 rounded-full bg-black/20 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. HORIZONTAL SCROLLABLE DEALS CAROUSEL / ROW */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 p-4 sm:p-6 overflow-x-auto scrollbar-none scroll-smooth snap-x touch-scroll"
        >
          {deals.map((product) => {
            const isLiked = isInWishlist(product.id);
            const isOutOfStock = product.stockQuantity <= 0;
            
            // Calculate real discount percentage
            const discountPercent =
              product.discountPrice && product.discountPrice < product.price
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 25; // fallback deal badge

            // Calculate mock remaining stock progress (between 10% and 90%)
            const totalDealPool = Math.max(25, product.stockQuantity + (product.salesCount || 15));
            const remaining = Math.max(1, product.stockQuantity || 7);
            const remainingPercent = Math.min(100, Math.max(12, Math.round((remaining / totalDealPool) * 100)));

            return (
              <div
                key={product.id}
                onClick={() => onNavigate('product-detail', { productId: product.id })}
                className="group relative flex-none w-[170px] sm:w-[200px] lg:w-[220px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600/70 p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-lg cursor-pointer snap-start"
              >
                {/* Top Corner Discount Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 text-[11px] font-black tracking-tight border border-amber-300/40 dark:border-amber-700/40 shadow-xs">
                    -{discountPercent}%
                  </span>
                </div>

                {/* Wishlist Quick Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className={`absolute top-2.5 left-2.5 z-10 p-1.5 rounded-lg backdrop-blur-xs transition-colors shadow-xs ${
                    isLiked
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-rose-600 hover:bg-white'
                  }`}
                  title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                {/* Product Image Stage */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 mb-3 flex items-center justify-center">
                  <img
                    src={product.featuredImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuickView(product);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[11px] font-bold shadow-md flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Eye className="w-3 h-3 text-rose-600" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {/* Title & Brand */}
                <div className="space-y-1 mb-2 flex-1 flex flex-col justify-start">
                  <p className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 truncate">
                    {product.brand}
                  </p>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {product.name}
                  </h3>
                </div>

                {/* Pricing Block */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                      {formatPrice(product.discountPrice || product.price)}
                    </span>
                    {product.discountPrice && product.discountPrice < product.price && (
                      <span className="text-[11px] text-slate-600 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Stock Left & Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                      <span>{remaining} items left</span>
                      {remaining <= 5 && (
                        <span className="text-rose-600 dark:text-rose-400 font-bold animate-pulse">Almost sold!</span>
                      )}
                    </div>
                    {/* Progress Bar Track */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${remainingPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.variations && product.variations.length > 0) {
                        onOpenQuickView(product);
                      } else {
                        addToCart(product, undefined, 1);
                      }
                    }}
                    disabled={isOutOfStock}
                    className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-rose-600 dark:hover:bg-rose-600 text-white dark:text-slate-900 dark:hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-xs"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>{product.variations?.length ? 'Select' : 'Add to Bag'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
