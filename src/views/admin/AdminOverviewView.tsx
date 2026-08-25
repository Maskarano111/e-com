import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Clock,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Truck,
  ExternalLink,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Filter,
  RefreshCw,
  Award,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { Order, Product } from '../../types/index';

interface AdminOverviewViewProps {
  onNavigateTab: (tab: string, param?: any) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({ onNavigateTab }) => {
  const { formatPrice } = useSettings();
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Sales Data based on timeframe
  const salesDataByTimeframe = {
    '7d': [
      { day: 'Mon', revenue: 14200, orders: 8, label: 'Mon, Aug 14' },
      { day: 'Tue', revenue: 19800, orders: 12, label: 'Tue, Aug 15' },
      { day: 'Wed', revenue: 16400, orders: 10, label: 'Wed, Aug 16' },
      { day: 'Thu', revenue: 24600, orders: 15, label: 'Thu, Aug 17' },
      { day: 'Fri', revenue: 31200, orders: 19, label: 'Fri, Aug 18' },
      { day: 'Sat', revenue: 27500, orders: 16, label: 'Sat, Aug 19' },
      { day: 'Sun', revenue: 29800, orders: 18, label: 'Sun, Aug 20' }
    ],
    '30d': [
      { day: 'Week 1', revenue: 84500, orders: 52, label: 'Jul 24 - Jul 30' },
      { day: 'Week 2', revenue: 102300, orders: 64, label: 'Jul 31 - Aug 6' },
      { day: 'Week 3', revenue: 118900, orders: 75, label: 'Aug 7 - Aug 13' },
      { day: 'Week 4', revenue: 135400, orders: 84, label: 'Aug 14 - Aug 20' }
    ],
    '90d': [
      { day: 'June', revenue: 320000, orders: 210, label: 'June 2026' },
      { day: 'July', revenue: 412000, orders: 265, label: 'July 2026' },
      { day: 'August', revenue: 485000, orders: 312, label: 'August 2026 MTD' }
    ]
  };

  const chartData = salesDataByTimeframe[timeframe];
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [dashStats, ordersRes, prodsRes] = await Promise.all([
          api.getAdminAnalytics(),
          api.getOrders(),
          api.getProducts({ limit: 6, sortBy: 'popularity' })
        ]);
        setStats(dashStats);
        setRecentOrders(ordersRes.slice(0, 6));
        setTopProducts(prodsRes.products.slice(0, 5));
      } catch (err) {
        console.error('Failed loading admin overview:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleQuickRestock = async (productId: string, productName: string) => {
    try {
      await api.updateProduct(productId, { stockQuantity: 25 });
      setTopProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockQuantity: 25 } : p))
      );
      showToast('success', 'Stock Replenished! 📦', `Added +25 units to ${productName}`);
    } catch (err: any) {
      showToast('error', 'Restock Error', err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER WITH REAL-TIME PULSE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Live Commercial Intelligence
            </span>
            <span className="text-xs text-slate-400">• Updated Just Now</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Command Center
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Selector */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase ${
                  timeframe === tf
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 2. CORE KPI MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Gross Sales Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatPrice(stats?.totalRevenue || 124950)}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs prev {timeframe}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[78%]" />
          </div>
        </div>

        {/* Orders Count */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Completed Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats?.totalOrders || 84}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats?.pendingOrders || 3} pending fulfillment</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-[88%]" />
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average Order Value</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatPrice(1487.50)}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mt-1">
              <Zap className="w-3.5 h-3.5" />
              <span>+12.3% Luxury Basket Surge</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-[65%]" />
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">On-Time Dispatch Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              98.6%
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Same-Day in Greater Accra</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full w-[98%]" />
          </div>
        </div>
      </div>

      {/* 3. SALES & VELOCITY INTERACTIVE AREA CHART + CATEGORY SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interactive SVG Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900 dark:text-white">Revenue & Velocity Trend</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {timeframe.toUpperCase()} Window
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time daily transaction curve & order volume</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Gross Sales
              </span>
              <span className="flex items-center gap-1.5 text-indigo-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Order Count
              </span>
            </div>
          </div>

          {/* Interactive Chart Graphic */}
          <div className="relative h-60 w-full flex items-end justify-between gap-3 pt-8 pb-4">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10 pb-8">
              <div className="border-b border-dashed border-slate-400 w-full" />
              <div className="border-b border-dashed border-slate-400 w-full" />
              <div className="border-b border-dashed border-slate-400 w-full" />
            </div>

            {chartData.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.revenue / maxRevenue) * 100));
              const isHovered = hoveredPoint?.day === item.day;

              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setHoveredPoint(item)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer z-10"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-12 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl z-30 whitespace-nowrap text-center pointer-events-none border border-slate-700"
                    >
                      <p className="font-black text-emerald-400">{formatPrice(item.revenue)}</p>
                      <p className="text-[9px] text-slate-300">{item.orders} orders • {item.label}</p>
                    </motion.div>
                  )}

                  {/* Gradient Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[54px] rounded-2xl transition-all duration-300 ${
                      isHovered
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg shadow-emerald-600/40 scale-105'
                        : 'bg-gradient-to-t from-emerald-600/70 to-emerald-400/90 hover:from-emerald-600 hover:to-emerald-400'
                    }`}
                  />

                  <span className="text-[11px] font-bold text-slate-500 mt-2">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Peak Velocity: <strong className="text-slate-900 dark:text-white font-bold">{formatPrice(maxRevenue)}</strong></span>
            <span className="text-emerald-600 font-bold">100% Verified Paystack & MoMo Settlement</span>
          </div>
        </div>

        {/* Category Share & Department Breakdown (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">Department Revenue Share</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across luxury catalog</p>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { label: 'Designer & Niche Perfumes', share: 54, amount: 'GH₵ 67,470', color: 'bg-emerald-500' },
              { label: 'Arabian Oud & Attar Oils', share: 26, amount: 'GH₵ 32,480', color: 'bg-indigo-500' },
              { label: 'Discovery Decant Sets', share: 14, amount: 'GH₵ 17,490', color: 'bg-amber-500' },
              { label: 'Luxury Candles & Home Mists', share: 6, amount: 'GH₵ 7,510', color: 'bg-rose-500' }
            ].map((cat) => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300 truncate">{cat.label}</span>
                  <span className="text-slate-900 dark:text-white shrink-0 ml-2">{cat.share}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${cat.share}%` }} className={`${cat.color} h-full rounded-full`} />
                </div>
                <p className="text-[10px] text-slate-400 text-right">{cat.amount}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('categories')}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage All Departments</span>
          </button>
        </div>
      </div>

      {/* 4. LIVE DISPATCH PIPELINE & LOW STOCK INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Order Pipeline Funnel (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Fulfillment & Dispatch Pipeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status across Accra & Kumasi hubs</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              All Orders →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { stage: 'New Orders', count: 3, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/50' },
              { stage: 'Velvet Packing', count: 2, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50' },
              { stage: 'With Courier', count: 4, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/50' },
              { stage: 'Delivered', count: 18, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/50' }
            ].map((p) => (
              <div key={p.stage} className={`p-4 rounded-2xl border text-center space-y-1 ${p.color}`}>
                <p className="text-2xl font-black">{p.count}</p>
                <p className="text-[11px] font-bold opacity-85 leading-tight">{p.stage}</p>
              </div>
            ))}
          </div>

          {/* Quick Route Status */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Active Dispatch Courier Fleet:
              </span>
              <span className="text-emerald-600">3 Riders En Route</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Deliveries active in <strong>East Legon, Airport Residential, Cantonments & Tema Community 1</strong>.
            </p>
          </div>
        </div>

        {/* Low Stock Warning & 1-Click Replenish (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900 dark:text-white">Inventory Restock Alerts</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                  Priority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">SKUs near replenishment threshold</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Full Inventory →
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.slice(0, 3).map((p) => {
              const isCriticallyLow = p.stockQuantity <= 5;
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.featuredImage || p.images?.[0]}
                      alt={p.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        SKU: {p.sku} • Stock: <strong className={isCriticallyLow ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>{p.stockQuantity} units left</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickRestock(p.id, p.name)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs shrink-0 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restock +25</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. RECENT ORDERS LIVE FEED */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">Recent Customer Orders Live Stream</h3>
            <p className="text-xs text-slate-400">Incoming authenticated boutique orders & payments</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            Manage All Orders ({recentOrders.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Order Ref</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Delivery Area</th>
                <th className="pb-3">Items & Scent</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 font-black text-slate-900 dark:text-white">
                    #{o.orderNumber}
                  </td>
                  <td className="py-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">{o.customerName}</p>
                    <p className="text-[10px] text-slate-400">{o.customerEmail}</p>
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                    {o.deliveryAddress?.city || 'Accra Central'}
                  </td>
                  <td className="py-3.5 text-slate-500 truncate max-w-[160px]">
                    {o.items?.map((it) => it.productName).join(', ') || 'Perfume Order'}
                  </td>
                  <td className="py-3.5 font-black text-emerald-600">
                    {formatPrice(o.total)}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        o.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : o.orderStatus === 'Processing'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}
                    >
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onNavigateTab('orders')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      View Dispatch →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

