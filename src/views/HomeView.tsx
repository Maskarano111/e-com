import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Flame, Zap, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, Sparkles, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { Product, Category, Banner } from '../types/index';
import { ProductCard } from '../components/common/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';

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
  const [banners, setBanners] = useState<Banner[]>(propBanners || []);
  const [categories, setCategories] = useState<Category[]>(propCategories || []);
  const [products, setProducts] = useState<Product[]>(propProducts || []);
  const [deals, setDeals] = useState<Product[]>(propDeals || []);
  const [newArrivals, setNewArrivals] = useState<Product[]>(propNewArrivals || []);
  const [bestSellers, setBestSellers] = useState<Product[]>(propBestSellers || []);
  const [isLoading, setIsLoading] = useState(!propProducts || propProducts.length === 0);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

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
            api.getBanners(), api.getCategories(), api.getProducts({ limit: 12 }),
            api.getDeals(), api.getNewArrivals(), api.getBestSellers()
          ]);
          setBanners(bRes || []);
          setCategories(cRes || []);
          setProducts(pRes?.products || []);
          setDeals(dRes || []);
          setNewArrivals(nRes || []);
          setBestSellers(sRes || []);
        } catch (err) { console.error('Failed to load home data:', err); }
        finally { setIsLoading(false); }
      };
      loadHomeData();
    }
  }, [propProducts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const safeBanners = Array.isArray(banners) ? banners : [];
  const heroBanners = safeBanners.filter((b) => b.position === 'hero' && b.status === 'active');
  const nextBanner = () => setCurrentBannerIndex((prev) => (prev + 1) % (heroBanners.length || 1));
  const prevBanner = () => setCurrentBannerIndex((prev) => (prev - 1 + heroBanners.length) % (heroBanners.length || 1));

  const activeBanner = heroBanners[currentBannerIndex] || {
    id: 'hero-default',
    title: 'Signature Luxury Fragrances & Arabian Oud',
    subtitle: '100% Authentic Designer Scents & Lifestyle',
    highlight: 'NEW LUXURY COLLECTION 2026',
    message: 'Explore Baccarat Rouge 540, Creed Aventus, Tom Ford, Arabian Oud, Scented Candles & Lifestyle Gifts.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=80',
    buttonText: 'Explore Perfumes & Oud',
    destinationUrl: '/shop'
  };

  return (
    <div className="space-y-16 pb-20">

      {/* 1. HERO */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[480px] md:min-h-[560px] flex items-center shadow-2xl">
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-45" style={{ backgroundImage: `url(${activeBanner.image})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-900/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          <div className="absolute top-10 right-16 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-32 w-48 h-48 rounded-full bg-amber-500/8 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl p-8 sm:p-12 lg:p-16 space-y-6">
            {activeBanner.highlight && (
              <motion.span initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeBanner.highlight}</span>
              </motion.span>
            )}
            <motion.h1 key={currentBannerIndex} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-white">
              {activeBanner.title}
            </motion.h1>
            <motion.p key={`sub-${currentBannerIndex}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-lg">
              {activeBanner.message || activeBanner.subtitle}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center gap-3 pt-2">
              <button id="btn-hero-shop" onClick={() => onNavigate('shop')}
                className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/35 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                <span>{activeBanner.buttonText || 'Shop Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button id="btn-hero-scent-quiz" onClick={() => onNavigate('scent-quiz')}
                className="px-6 py-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-sm backdrop-blur-md border border-amber-500/35 flex items-center gap-2 transition-all">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Find Your Scent</span>
              </button>
            </motion.div>
          </div>

          {heroBanners.length > 1 && (
            <>
              <div className="absolute bottom-6 left-8 sm:left-16 flex items-center gap-2 z-20">
                {heroBanners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBannerIndex(i)}
                    className={`transition-all rounded-full ${i === currentBannerIndex ? 'w-6 h-2 bg-emerald-500' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
                ))}
              </div>
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
                <button onClick={prevBanner} className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700/70 transition-all backdrop-blur-sm hover:scale-110">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextBanner} className="p-2.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700/70 transition-all backdrop-blur-sm hover:scale-110">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 1.5 TRUST BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Truck,       color: 'emerald', label: 'Express Delivery',  sub: 'Same-day in Accra' },
            { icon: ShieldCheck, color: 'indigo',  label: '100% Authentic',    sub: 'Guaranteed genuine' },
            { icon: RotateCcw,   color: 'amber',   label: '14-Day Returns',    sub: 'Hassle-free policy' },
            { icon: ShoppingBag, color: 'rose',    label: 'Secure Payments',   sub: 'Paystack & MoMo' },
          ].map(({ icon: Icon, color, label, sub }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
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

      {/* 2. CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Shop By Department</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Featured Categories</h2>
          </div>
          <button id="btn-see-all-cats" onClick={() => onNavigate('shop')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <span>All Categories</span><ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => onNavigate('shop', { category: cat.id })}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 overflow-hidden cursor-pointer transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 text-center flex flex-col items-center p-4 pb-3">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 img-zoom-container border border-slate-200 dark:border-slate-700">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">{cat.name}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{cat.productCount || 0} items</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FLASH DEALS */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.2)_0%,transparent_60%)]" />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-rose-800/40">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-700/40 animate-pulse">
                    <Flame className="w-8 h-8 fill-white text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Flash Deals</h2>
                    <p className="text-xs text-rose-200/80 mt-0.5">Limited quantities — best prices in Ghana</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-rose-200 uppercase tracking-widest">Ends in</span>
                  <div className="flex items-center gap-1.5">
                    {[{ val: timeLeft.hours, label: 'HRS' }, { val: timeLeft.minutes, label: 'MIN' }, { val: timeLeft.seconds, label: 'SEC' }].map(({ val, label }, i) => (
                      <React.Fragment key={label}>
                        <div className="flex flex-col items-center">
                          <div className="bg-rose-600/90 text-white px-3 py-2 rounded-xl font-black text-xl w-14 text-center tabular-nums shadow-lg">
                            {String(val).padStart(2, '0')}
                          </div>
                          <span className="text-[9px] font-bold text-rose-300/70 mt-1 tracking-widest">{label}</span>
                        </div>
                        {i < 2 && <span className="text-rose-400 font-black text-xl mb-3">:</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {deals.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} onOpenQuickView={onOpenQuickView}
                    onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Hand-Picked Collection</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Featured Products</h2>
          </div>
          <button onClick={() => onNavigate('shop', { featured: true })}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <span>View All</span><ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.filter((p) => p.featured).slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} onOpenQuickView={onOpenQuickView}
              onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })} />
          ))}
        </div>
      </section>

      {/* 5. BOUTIQUE SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950 via-slate-950 to-black text-white p-8 sm:p-10 flex flex-col justify-between border border-amber-700/20 shadow-xl min-h-[280px] group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.12)_0%,transparent_60%)]" />
            <div className="space-y-3 z-10 relative">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/25">
                <Sparkles className="w-3.5 h-3.5" /><span>60-Second Scent Match</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">Find Your Bespoke Scent</h3>
              <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-sm">Answer 4 lifestyle questions to reveal your signature scent — from fresh citruses to deep Arabian Oud.</p>
            </div>
            <div className="pt-6 z-10 relative">
              <button onClick={() => onNavigate('scent-quiz')}
                className="px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer group-hover:scale-105">
                <span>Launch Scent Concierge</span><ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-black text-white p-8 sm:p-10 flex flex-col justify-between border border-emerald-700/20 shadow-xl min-h-[280px] group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.12)_0%,transparent_60%)]" />
            <div className="space-y-3 z-10 relative">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                <Gift className="w-3.5 h-3.5" /><span>Bespoke Decant Studio</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">Curate A Discovery Box</h3>
              <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-sm">Choose 3 or 5 luxury 10ml atomizers from French & Arabian perfumes in a velvet keepsake box.</p>
            </div>
            <div className="pt-6 z-10 relative">
              <button onClick={() => onNavigate('discovery-box')}
                className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer group-hover:scale-105">
                <span>Build Discovery Box</span><ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS & NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Best Sellers</h3>
                  <p className="text-[10px] text-slate-500">Top-rated by customers</p>
                </div>
              </div>
              <button onClick={() => onNavigate('shop', { sortBy: 'popularity' })} className="text-xs font-bold text-emerald-600 hover:underline">View More →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestSellers.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} onOpenQuickView={onOpenQuickView}
                  onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })} />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">New Arrivals</h3>
                  <p className="text-[10px] text-slate-500">Fresh from our buyers</p>
                </div>
              </div>
              <button onClick={() => onNavigate('shop', { sortBy: 'newest' })} className="text-xs font-bold text-emerald-600 hover:underline">View More →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} onOpenQuickView={onOpenQuickView}
                  onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/60 dark:to-transparent py-16 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100 dark:border-emerald-900/40 mb-3">
              <Star className="w-3.5 h-3.5 fill-emerald-600" /> Verified Reviews
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Loved Across Ghana</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Join thousands of happy customers from Accra to Kumasi to Takoradi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: '"Baccarat Rouge 540 Extrait arrived the next day with exquisite magnetic gift packaging. The sillage lasts over 24 hours!"', name: 'Abena Osei', location: 'East Legon, Accra', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', rating: 5 },
              { quote: '"Lattafa Khamrah is 100% authentic Dubai batch. Courier called me when 5 minutes away. Best fragrance shop in Kumasi. 10/10!"', name: 'Kofi Appiah', location: 'Kumasi, Ashanti Region', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', rating: 5 },
              { quote: '"Used SCENT10 code and saved GH¢ 180 instantly. Diptyque Baies candle makes my home smell divine. Will absolutely order again!"', name: 'Eunice Addo', location: 'Tema Community 6', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', rating: 5 },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
                <span className="absolute -top-2 -left-1 text-8xl font-serif text-emerald-100 dark:text-emerald-950 leading-none pointer-events-none select-none">"</span>
                <div className="flex items-center text-amber-400 gap-0.5 mb-4 relative z-10">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic relative z-10 mb-5">{t.quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200 dark:border-emerald-800" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.location}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">Verified</span>
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
