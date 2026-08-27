import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Flame,
  Zap,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Tv,
  Utensils,
  Shirt,
  HeartPulse,
  Sparkle,
  Laptop,
  ShoppingCart
} from 'lucide-react';
import { Product, Category, Banner } from '../types/index';
import { ProductCard } from '../components/common/ProductCard';
import { FlashSalesSection } from '../components/common/FlashSalesSection';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';

import { initialCategories, initialProducts, initialBanners } from '../data/initialData';

interface HomeViewProps {
  banners?: Banner[];
  categories?: Category[];
  products?: Product[];
  deals?: Product[];
  newArrivals?: Product[];
  bestSellers?: Product[];
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  banners: propBanners,
  categories: propCategories,
  products: propProducts,
  deals: propDeals,
  newArrivals: propNewArrivals,
  bestSellers: propBestSellers,
  onNavigate,
  onOpenQuickView
}) => {
  const { formatPrice } = useSettings();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>(propBanners || initialBanners);
  const [categories, setCategories] = useState<Category[]>(propCategories || initialCategories);
  const [products, setProducts] = useState<Product[]>(propProducts || initialProducts);
  const [deals, setDeals] = useState<Product[]>(propDeals || initialProducts.filter((p) => p.discountPrice && p.discountPrice < p.price));
  const [newArrivals, setNewArrivals] = useState<Product[]>(propNewArrivals || initialProducts.filter((p) => p.isNewArrival));
  const [bestSellers, setBestSellers] = useState<Product[]>(propBestSellers || initialProducts.filter((p) => p.isBestSeller));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (propBanners) setBanners(propBanners);
    if (propCategories) setCategories(propCategories);
    if (propProducts) setProducts(propProducts);
    if (propDeals) setDeals(propDeals);
    if (propNewArrivals) setNewArrivals(propNewArrivals);
    if (propBestSellers) setBestSellers(propBestSellers);
  }, [propBanners, propCategories, propProducts, propDeals, propNewArrivals, propBestSellers]);

  useEffect(() => {
    if (!propProducts || propProducts.length === 0) {
      const loadHomeData = async () => {
        setIsLoading(true);
        try {
          const [bRes, cRes, pRes, dRes, nRes, sRes] = await Promise.all([
            api.getBanners(),
            api.getCategories(),
            api.getProducts({ limit: 12 }),
            api.getDeals(),
            api.getNewArrivals(),
            api.getBestSellers()
          ]);
          setBanners(bRes || []);
          setCategories(cRes || []);
          setProducts(pRes?.products || []);
          setDeals(dRes || []);
          setNewArrivals(nRes || []);
          setBestSellers(sRes || []);
        } catch (err) {
          console.error('Failed to load home data:', err);
        } finally {
          setIsLoading(false);
        }
      };
      loadHomeData();
    }
  }, [propProducts]);

  const safeBanners = Array.isArray(banners) && banners.length > 0 ? banners : initialBanners;
  const heroBanners = safeBanners.filter((b) => b.position === 'hero' && b.status === 'active');
  const activeBannersList = heroBanners.length > 0 ? heroBanners : initialBanners;

  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % activeBannersList.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + activeBannersList.length) % activeBannersList.length);
  };

  // Auto-play timer (slides every 5.5 seconds unless hovered)
  useEffect(() => {
    if (activeBannersList.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextBanner();
    }, 5500);

    return () => clearInterval(interval);
  }, [activeBannersList.length, isPaused, currentBannerIndex]);

  const activeBanner = activeBannersList[currentBannerIndex] || activeBannersList[0];

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe distance threshold (50px)
    if (diff > 50) {
      nextBanner();
    } else if (diff < -50) {
      prevBanner();
    }
    setTouchStart(null);
    setIsPaused(false);
  };

  return (
    <div className="space-y-14 sm:space-y-16 pb-20">

      {/* 1. HERO CAROUSEL */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[460px] md:min-h-[520px] flex items-center shadow-2xl group select-none"
        >
          {/* Animated Background Images with smooth crossfade and slow Ken-Burns zoom */}
          {activeBannersList.map((banner, index) => (
            <div
              key={banner.id || index}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
                index === currentBannerIndex
                  ? 'opacity-40 scale-105 transition-transform duration-[7000ms]'
                  : 'opacity-0 scale-100 pointer-events-none'
              }`}
              style={{ backgroundImage: `url(${banner.image})` }}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          <div className="absolute top-10 right-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-32 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

          {/* Slide Text Content */}
          <div className="relative z-10 max-w-2xl p-5 sm:p-12 lg:p-16 space-y-5 sm:space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`badge-${currentBannerIndex}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {activeBanner.highlight && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>{activeBanner.highlight}</span>
                  </span>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${currentBannerIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight text-white drop-shadow-sm"
              >
                {activeBanner.title}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${currentBannerIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-lg"
              >
                {activeBanner.message || activeBanner.subtitle}
              </motion.p>
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="btn-hero-shop"
                onClick={() => {
                  if (activeBanner.destinationUrl) {
                    const match = activeBanner.destinationUrl.match(/category=([^&]+)/);
                    if (match) {
                      onNavigate('shop', { category: match[1] });
                      return;
                    }
                  }
                  onNavigate('shop');
                }}
                className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/35 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{activeBanner.buttonText || 'Shop All Products'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="btn-hero-deals"
                onClick={() => onNavigate('shop', { dealsOnly: true })}
                className="px-6 py-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-sm backdrop-blur-md border border-rose-500/35 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Today's Flash Deals</span>
              </button>
            </div>
          </div>

          {/* Navigation Controls & Animated Progress Bar */}
          {activeBannersList.length > 1 && (
            <>
              {/* Slide Progress Indicator Pills */}
              <div className="absolute bottom-6 left-6 sm:left-14 flex items-center gap-2 z-20">
                {activeBannersList.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBannerIndex(i)}
                    className="relative cursor-pointer transition-all"
                    title={`Slide ${i + 1}`}
                  >
                    {i === currentBannerIndex ? (
                      <div className="w-10 sm:w-12 h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-emerald-500/40 p-0.5">
                        <motion.div
                          key={`progress-${currentBannerIndex}-${isPaused ? 'paused' : 'running'}`}
                          initial={{ width: '0%' }}
                          animate={{ width: isPaused ? '100%' : '100%' }}
                          transition={{ duration: isPaused ? 0 : 5.5, ease: 'linear' }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-xs"
                        />
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30 hover:bg-white/70 transition-all hover:scale-125" />
                    )}
                  </button>
                ))}
              </div>

              {/* Prev / Next Chevrons */}
              <div className="absolute bottom-5 right-5 sm:right-10 z-20 flex items-center gap-2">
                <button
                  onClick={prevBanner}
                  className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700/70 transition-all backdrop-blur-sm hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextBanner}
                  className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700/70 transition-all backdrop-blur-sm hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 2. TRUST BADGES BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Scrollable on mobile, grid on md+ */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          {[
            { icon: Truck, color: 'emerald', label: 'Express Delivery', sub: 'Same-day in Accra & Tema' },
            { icon: ShieldCheck, color: 'indigo', label: '100% Genuine Goods', sub: 'Verified & Brand Warrantied' },
            { icon: RotateCcw, color: 'amber', label: '7-Day Easy Returns', sub: 'Hassle-free guarantee' },
            { icon: ShoppingBag, color: 'rose', label: 'Secure Payments', sub: 'MTN MoMo, Telecel & Cards' }
          ].map(({ icon: Icon, color, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow shrink-0 min-w-[220px] md:min-w-0"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-${color}-50 dark:bg-${color}-950/40`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{label}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SHOP BY DEPARTMENT (8 CATEGORIES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">
              Explore All Departments
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Categories
            </h2>
          </div>
          <button
            id="btn-see-all-cats"
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40 cursor-pointer"
          >
            <span>All Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onNavigate('shop', { category: cat.id })}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 overflow-hidden cursor-pointer transition-all shadow-xs hover:shadow-xl hover:-translate-y-1 text-center flex flex-col items-center p-3.5 sm:p-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200 dark:border-slate-700">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {cat.productCount || 20}+ items
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. LIVE DEAL TIMER & FLASH SALES CAROUSEL */}
      {deals.length > 0 && (
        <FlashSalesSection
          deals={deals}
          onNavigate={onNavigate}
          onOpenQuickView={onOpenQuickView}
        />
      )}

      {/* 5. PROMOTIONAL DEPARTMENT SHOWCASE BANNERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Electronics & Tech Hub */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white p-8 sm:p-10 flex flex-col justify-between border border-indigo-700/20 shadow-xl min-h-[280px] group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.15)_0%,transparent_60%)]" />
            <div className="space-y-3 z-10 relative">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phones & Tech Week</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Smartphones, Laptops & Audio
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                Shop authentic Apple, Samsung, Sony & HP devices with official warranty and flexible payment options.
              </p>
            </div>
            <div className="pt-6 z-10 relative">
              <button
                onClick={() => onNavigate('shop', { category: 'cat-phones' })}
                className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer group-hover:scale-105"
              >
                <span>Shop Tech Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Home & Appliances */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-black text-white p-8 sm:p-10 flex flex-col justify-between border border-emerald-700/20 shadow-xl min-h-[280px] group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.15)_0%,transparent_60%)]" />
            <div className="space-y-3 z-10 relative">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Utensils className="w-3.5 h-3.5" />
                <span>Modern Home Living</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Kitchen Appliances & Home Tools
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                Rechargeable blenders, air fryers, high-pressure car washers, and everyday household essentials.
              </p>
            </div>
            <div className="pt-6 z-10 relative">
              <button
                onClick={() => onNavigate('shop', { category: 'cat-appliances' })}
                className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer group-hover:scale-105"
              >
                <span>Explore Appliances</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">
              Top Rated Goods
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Superstore Products
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { featured: true })}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.filter((p) => p.featured).slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenQuickView={onOpenQuickView}
              onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })}
            />
          ))}
        </div>
      </section>

      {/* 7. BEST SELLERS & NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Best Sellers */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Top Best Sellers</h3>
                  <p className="text-[10px] text-slate-500">Most purchased items this week</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('shop', { sortBy: 'popularity' })}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                View More →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestSellers.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenQuickView={onOpenQuickView}
                  onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })}
                />
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">New Arrivals</h3>
                  <p className="text-[10px] text-slate-500">Fresh stock added daily</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('shop', { sortBy: 'newest' })}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                View More →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenQuickView={onOpenQuickView}
                  onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/60 dark:to-transparent py-16 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100 dark:border-emerald-900/40 mb-3">
              <Star className="w-3.5 h-3.5 fill-emerald-600" /> Verified Buyer Reviews
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Trusted by 50,000+ Shoppers in Ghana
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Genuine reviews on electronics, fashion, appliances, and personal care.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  '"Ordered the portable blender and digital blood pressure monitor. Both delivered to Airport Residential next day. Excellent quality!"',
                name: 'Abena Osei',
                location: 'East Legon, Accra',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
                rating: 5,
                product: 'Portable USB Blender'
              },
              {
                quote:
                  '"Purchased the iPhone 15 Pro Max. Checked Apple warranty online, 100% genuine and sealed box. Best online store in Ghana."',
                name: 'Kwesi Mensah',
                location: 'Kumasi, Ashanti Region',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                rating: 5,
                product: 'iPhone 15 Pro Max'
              },
              {
                quote:
                  '"The 48V cordless pressure washer gun makes car washing at home effortless. Great battery life and powerful pressure spray."',
                name: 'Eunice Addo',
                location: 'Tema Community 6',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                rating: 5,
                product: '48V Pressure Washer'
              }
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
              >
                <span className="absolute -top-2 -left-1 text-8xl font-serif text-emerald-100 dark:text-emerald-950 leading-none pointer-events-none select-none">
                  "
                </span>
                <div className="flex items-center text-amber-400 gap-0.5 mb-4 relative z-10">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic relative z-10 mb-5">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200 dark:border-emerald-800"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.location}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                      Verified
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
