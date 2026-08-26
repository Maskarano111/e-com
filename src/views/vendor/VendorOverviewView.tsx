import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Star,
  Plus,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Percent,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Product, Order, Vendor } from '../../types/index';

interface VendorOverviewViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddProduct: () => void;
}

export const VendorOverviewView: React.FC<VendorOverviewViewProps> = ({
  onNavigateTab,
  onOpenAddProduct
}) => {
  const { user } = useAuth();
  const { formatPrice } = useSettings();
  const vendorId = user?.vendorId || 'vend-kofi';

  const [stats, setStats] = useState<any>({
    grossRevenue: 18450,
    netEarnings: 16605,
    commissionPaid: 1845,
    ordersCount: 48,
    productsCount: 12,
    lowStockCount: 2,
    rating: 4.8,
    reviewCount: 64,
    balance: 3450.00,
    pendingBalance: 1200.00
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, prodsRes, ordersRes, vendorRes] = await Promise.all([
          api.getVendorStats(vendorId),
          api.getVendorProducts(vendorId),
          api.getVendorOrders(vendorId),
          api.getVendorById(vendorId)
        ]);

        if (statsRes) setStats(statsRes);
        if (prodsRes) setProducts(prodsRes.products || []);
        if (ordersRes) setOrders(ordersRes);
        if (vendorRes) setVendor(vendorRes);
      } catch (err) {
        console.error('Failed to load seller dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [vendorId]);

  const lowStockProducts = products.filter((p) => p.stockQuantity <= 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-8 shadow-xl shadow-amber-600/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold tracking-wide uppercase">
              <Store className="w-3.5 h-3.5" />
              <span>{vendor?.storeName || 'Kofi Tech & Audio Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome to Your Seller Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
              Track live revenue, manage your uploaded catalog, dispatch buyer orders, and request instant MoMo wallet payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-amber-50 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>List New Product</span>
            </button>
            <button
              onClick={() => onNavigateTab('payouts')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-xs text-white border border-white/20 font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Earnings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Net Take-Home Earnings</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {formatPrice(stats.netEarnings || 16605)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Gross: {formatPrice(stats.grossRevenue || 18450)}</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">{vendor?.commissionRate || 10}% fee deducted</span>
          </div>
        </div>

        {/* Available Wallet Balance */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Available For Payout</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {formatPrice(stats.balance || 3450.00)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Pending settlement: {formatPrice(stats.pendingBalance || 1200.00)}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Orders Fulfilled</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.ordersCount || 48} orders
          </p>
          <p className="text-[11px] text-slate-500">Across Greater Accra &amp; Nationwide</p>
        </div>

        {/* Store Rating & Products */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Products &amp; Rating</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {products.length || stats.productsCount || 12}
            </p>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              {stats.rating || 4.8} ({stats.reviewCount || 64} reviews)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{lowStockProducts.length} items low in stock</p>
        </div>
      </div>

      {/* Grid: Left Recent Orders & Performance, Right Low Stock & Store Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Recent Buyer Orders</h2>
              <p className="text-xs text-slate-500">Orders placed containing your products</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No orders recorded yet. As customers purchase your items, they will appear here live.
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-xs shrink-0">
                      📦
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {order.customerName} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-xs text-slate-900 dark:text-white">{formatPrice(order.total)}</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Store Health & Low Stock Alert (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Low Stock Warning Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Inventory Stock Watch</h3>
              </div>
              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Catalog
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All your listed catalog items have healthy stock levels!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.featuredImage}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-rose-600 font-bold">Only {p.stockQuantity} remaining</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('products')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Payout Callout */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">MoMo Instant Payout</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Direct MTN / Telecel Cash Payout</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                {formatPrice(stats.balance || 3450.00)}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Withdraw directly to your registered Mobile Money number or Ghana Bank account anytime.
            </p>

            <button
              onClick={() => onNavigateTab('payouts')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>Disburse to Mobile Money</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
