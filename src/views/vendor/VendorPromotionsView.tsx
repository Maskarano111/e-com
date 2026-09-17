import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Sparkles,
  Zap,
  TrendingUp,
  Eye,
  MousePointer,
  Percent,
  Coins,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Search,
  Check,
  ChevronRight,
  X,
  CreditCard,
  Wallet,
  Smartphone,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Product, PromotionPlan, VendorPromotionSubscription, PromotionAnalytics } from '../../types/index';

export const VendorPromotionsView: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice, country } = useSettings();
  const { showToast } = useToast();
  const vendorId = user?.vendorId || 'vend-kofi';

  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [subscription, setSubscription] = useState<VendorPromotionSubscription | null>(null);
  const [promotedProducts, setPromotedProducts] = useState<Product[]>([]);
  const [allVendorProducts, setAllVendorProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<PromotionAnalytics>({
    impressions: 0,
    clicks: 0,
    ctr: 0,
    attributedSales: 0,
    revenueGenerated: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'promoted' | 'standard'>('all');
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PromotionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'vendor_balance' | 'momo' | 'card'>('vendor_balance');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);

  const loadPromotionData = async () => {
    setIsLoading(true);
    try {
      const [plansData, statusData] = await Promise.all([
        api.getPromotionPlans(),
        api.getVendorPromotionStatus(vendorId)
      ]);

      if (plansData) setPlans(plansData);
      if (statusData) {
        setSubscription(statusData.subscription);
        setPromotedProducts(statusData.promotedProducts || []);
        setAllVendorProducts(statusData.allVendorProducts || []);
        if (statusData.analytics) setAnalytics(statusData.analytics);
      }
    } catch (err) {
      console.error('Failed to load promotion data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotionData();
  }, [vendorId]);

  const handleToggleProduct = async (product: Product) => {
    if (!subscription || subscription.status !== 'active') {
      showToast('You need an active NovaBoost subscription to promote products.', 'error');
      setIsSubscribeModalOpen(true);
      return;
    }

    if (!product.isPromoted && subscription.slotsUsed >= subscription.slotsTotal) {
      showToast(`Slot limit reached (${subscription.slotsTotal} slots). Upgrade your plan to promote more!`, 'warning');
      setIsSubscribeModalOpen(true);
      return;
    }

    setTogglingProductId(product.id);
    try {
      const res = await api.toggleProductPromotion(product.id, vendorId);
      if (res?.success) {
        showToast(res.message, 'success');
        await loadPromotionData();
      } else {
        showToast(res?.message || 'Failed to update product promotion.', 'error');
      }
    } catch {
      showToast('Network error updating product promotion.', 'error');
    } finally {
      setTogglingProductId(null);
    }
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlanForCheckout) return;
    setIsSubmittingPayment(true);

    try {
      const res = await api.subscribePromotionPlan(vendorId, selectedPlanForCheckout.id, paymentMethod);
      if (res?.success) {
        showToast(`🎉 ${selectedPlanForCheckout.name} activated successfully!`, 'success');
        setIsSubscribeModalOpen(false);
        setSelectedPlanForCheckout(null);
        await loadPromotionData();
      } else {
        showToast(res?.message || 'Failed to complete subscription.', 'error');
      }
    } catch {
      showToast('Error processing subscription payment.', 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const filteredProducts = allVendorProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterTab === 'promoted') return matchesSearch && p.isPromoted;
    if (filterTab === 'standard') return matchesSearch && !p.isPromoted;
    return matchesSearch;
  });

  const slotsRemaining = Math.max(0, (subscription?.slotsTotal || 0) - (subscription?.slotsUsed || 0));
  const slotPercent = subscription?.slotsTotal
    ? Math.min(100, Math.round(((subscription.slotsUsed || 0) / subscription.slotsTotal) * 100))
    : 0;

  const daysLeft = subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              NovaBoost Ads & Marketplace Sponsorship
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Accelerate Sales with Promoted Products
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Boost your listings to the top of search queries, category catalog pages, and the Homepage Sponsored Spotlight to gain up to <strong className="text-amber-400">4.5x more customer orders</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedPlanForCheckout(plans.find((p) => p.tier === 'growth') || plans[0] || null);
                setIsSubscribeModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {subscription ? 'Upgrade / Renew Plan' : 'Subscribe to NovaBoost'}
            </button>
            <button
              onClick={loadPromotionData}
              title="Refresh Analytics"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Subscription & Quota Card ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                Active Promotion Plan
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {subscription?.planName || 'Free Standard Tier'}
                </h2>
                {subscription?.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Plan
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    No Active Subscription
                  </span>
                )}
              </div>
            </div>

            {subscription && (
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatPrice(subscription.price)} / mo
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {daysLeft} days remaining
                </div>
              </div>
            )}
          </div>

          {/* Quota Progress Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span className="text-slate-600 dark:text-slate-300">
                Promoted Product Slots Quota: <strong className="text-slate-900 dark:text-white">{subscription?.slotsUsed || 0}</strong> of <strong className="text-slate-900 dark:text-white">{subscription?.slotsTotal || 0}</strong> used
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {slotsRemaining} slots available
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${slotPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Upsell / Support Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:bg-slate-900 rounded-2xl p-6 border border-amber-500/20 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Need More Promotional Power?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upgrade to <strong>Enterprise Dominance</strong> for unlimited product slots, sticky top-of-category placement, and dedicated marketing concierge.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedPlanForCheckout(plans.find((p) => p.tier === 'enterprise') || plans[0] || null);
              setIsSubscribeModalOpen(true);
            }}
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            Explore Enterprise Tiers
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Performance Analytics Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Sponsored Impressions</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.impressions.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            +38% vs standard catalog
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Product Clicks</span>
            <MousePointer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.clicks.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Shoppers visiting your listings
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Click-Through Rate (CTR)</span>
            <Percent className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.ctr}%
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            2.8x higher than average
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Attributed Revenue</span>
            <Coins className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatPrice(analytics.revenueGenerated)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {analytics.attributedSales} orders driven by boosts
          </div>
        </div>
      </div>

      {/* ── Product Promotion Manager Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Manage Promoted Products
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Toggle which items receive priority visibility in search results and homepage deals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                All ({allVendorProducts.length})
              </button>
              <button
                onClick={() => setFilterTab('promoted')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'promoted' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Boosted ({promotedProducts.length})
              </button>
              <button
                onClick={() => setFilterTab('standard')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'standard' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Standard
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-4 sm:px-6">Product Item</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Promotion Status</th>
                <th className="py-3.5 px-4 text-center">Impressions</th>
                <th className="py-3.5 px-4 text-center">Clicks</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Boost Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isBusy = togglingProductId === prod.id;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={prod.featuredImage || prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-sm">
                              {prod.name}
                            </h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              SKU: {prod.sku} • {prod.brand}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-900 dark:text-white text-sm">
                        {formatPrice(prod.discountPrice || prod.price)}
                      </td>

                      <td className="py-4 px-4">
                        {prod.isPromoted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                            <Sparkles className="w-3 h-3" />
                            Sponsored Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Standard Listing
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        {prod.isPromoted ? (prod.promotionImpressions || 0).toLocaleString() : '—'}
                      </td>

                      <td className="py-4 px-4 text-center font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        {prod.isPromoted ? (prod.promotionClicks || 0).toLocaleString() : '—'}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleToggleProduct(prod)}
                          disabled={isBusy}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                            prod.isPromoted
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800'
                              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-xs'
                          }`}
                        >
                          {isBusy ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : prod.isPromoted ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Boosted (Pause)
                            </>
                          ) : (
                            <>
                              <Flame className="w-3.5 h-3.5 fill-current" />
                              Boost Product
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Subscription / Upgrade Plans Modal ── */}
      <AnimatePresence>
        {isSubscribeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
                    <Sparkles className="w-3 h-3" />
                    NovaBoost Subscription Packages
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Choose Your Growth Tier
                  </h3>
                </div>
                <button
                  onClick={() => setIsSubscribeModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map((p) => {
                  const isSelected = selectedPlanForCheckout?.id === p.id;
                  const priceFormatted = country === 'NG'
                    ? `₦${p.priceNG.toLocaleString()}`
                    : `GH₵${p.priceGH.toLocaleString()}`;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanForCheckout(p)}
                      className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {p.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                          Most Popular
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {p.name}
                          </h4>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {p.description}
                        </p>

                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {priceFormatted}
                          </span>
                          <span className="text-xs text-slate-500">/ month</span>
                        </div>

                        <div className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          {p.maxSlots === 999 ? 'Unlimited Boost Slots' : `${p.maxSlots} Promoted Product Slots`}
                        </div>

                        <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                          {p.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        className={`mt-6 w-full py-2.5 rounded-xl font-semibold text-xs transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {isSelected ? 'Selected Tier' : 'Select Plan'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Payment Method Selector & Confirmation */}
              {selectedPlanForCheckout && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Select Billing Method
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vendor_balance')}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        paymentMethod === 'vendor_balance'
                          ? 'border-amber-500 bg-amber-500/10 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                      }`}
                    >
                      <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Store Wallet Balance</div>
                        <div className="text-[11px] text-slate-500">Deduct from pending payouts</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        paymentMethod === 'momo'
                          ? 'border-amber-500 bg-amber-500/10 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Mobile Money</div>
                        <div className="text-[11px] text-slate-500">MTN MoMo / Telecel Cash</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-amber-500 bg-amber-500/10 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Card / Paystack</div>
                        <div className="text-[11px] text-slate-500">Debit or Credit Card</div>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsSubscribeModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingPayment}
                      onClick={handleConfirmSubscription}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      {isSubmittingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Activating Plan...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm & Activate {selectedPlanForCheckout.name}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorPromotionsView;
