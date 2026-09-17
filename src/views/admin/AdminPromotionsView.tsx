import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  MousePointer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  FastForward,
  Pause,
  RotateCcw,
  Plus,
  Edit2,
  Save,
  X,
  RefreshCw,
  Wallet,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { api, AdminSubscriptionOverviewResponse, AdminSubscriptionVendorItem } from '../../services/api';
import { PromotionPlan } from '../../types/index';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const AdminPromotionsView: React.FC = () => {
  const { formatPrice, country } = useSettings();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<AdminSubscriptionOverviewResponse | null>(null);
  const [activityLogs, setActivityLogs] = useState<string[]>([
    'Automated Billing Daemon initialized and monitoring vendor wallet balances.'
  ]);
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Edit Plan Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PromotionPlan | null>(null);
  const [editPriceGH, setEditPriceGH] = useState(0);
  const [editPriceNG, setEditPriceNG] = useState(0);
  const [editMaxSlots, setEditMaxSlots] = useState(0);
  const [editMultiplier, setEditMultiplier] = useState(1.0);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminSubscriptionOverview();
      if (data) {
        setOverview(data);
      }
    } catch (err) {
      console.error('Failed to load subscription overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Run the Lifecycle Engine Check
  const handleProcessRenewals = async () => {
    setIsRunningEngine(true);
    try {
      const res = await api.processSubscriptionRenewals();
      if (res?.success) {
        showToast('success', 'Lifecycle Checked', res.message);
        addLog(res.message);
        if (res.result.actions.length > 0) {
          res.result.actions.forEach((a) => {
            addLog(`⚡ Vendor "${a.vendorName}": ${a.message}`);
          });
        } else {
          addLog('All subscriptions are current and within their active billing window.');
        }
        await loadData();
      }
    } catch {
      showToast('error', 'Lifecycle Error', 'Failed to execute auto-renewal engine');
    } finally {
      setIsRunningEngine(false);
    }
  };

  // Simulate Fast-Forward Expiry (Test Auto-Deduct with sufficient funds)
  const handleSimulateAutoDeduct = async (vendorId: string) => {
    setIsSimulating(true);
    try {
      const res = await api.simulateSubscriptionExpiry(vendorId, false);
      if (res?.success) {
        showToast('success', 'Auto-Deduct Simulated', res.message);
        addLog(`🧪 SIMULATION (Funds Available): ${res.message}`);
        await loadData();
      }
    } catch {
      showToast('error', 'Error', 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Simulate Fast-Forward Expiry (Test Auto-Cancel with zero balance)
  const handleSimulateAutoCancel = async (vendorId: string) => {
    setIsSimulating(true);
    try {
      const res = await api.simulateSubscriptionExpiry(vendorId, true);
      if (res?.success) {
        showToast('warning', 'Auto-Cancel Simulated', res.message);
        addLog(`🧪 SIMULATION (Zero Balance): ${res.message}`);
        await loadData();
      }
    } catch {
      showToast('error', 'Error', 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Moderate Vendor (Pause / Resume / Grant Days)
  const handleModerate = async (vendorId: string, action: 'pause' | 'resume' | 'grant_days', daysToAdd?: number) => {
    try {
      const res = await api.moderateVendorSubscription(vendorId, action, daysToAdd);
      if (res?.success) {
        showToast('success', 'Vendor Updated', res.message);
        addLog(`Admin moderation: ${res.message}`);
        await loadData();
      }
    } catch {
      showToast('error', 'Error', 'Failed to update vendor subscription');
    }
  };

  // Save edited plan pricing
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    setIsSavingPlan(true);
    try {
      const res = await api.updatePromotionPlan(editingPlan.id, {
        priceGH: editPriceGH,
        priceNG: editPriceNG,
        maxSlots: editMaxSlots,
        searchBoostMultiplier: editMultiplier
      });
      if (res?.success) {
        showToast('success', 'Plan Updated', res.message);
        addLog(`Admin updated plan "${editingPlan.name}" (GH₵${editPriceGH} / ₦${editPriceNG}, ${editMaxSlots} slots)`);
        setIsEditModalOpen(false);
        await loadData();
      }
    } catch {
      showToast('error', 'Error', 'Failed to update plan pricing');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const openPlanEditor = (plan: PromotionPlan) => {
    setEditingPlan(plan);
    setEditPriceGH(plan.priceGH);
    setEditPriceNG(plan.priceNG);
    setEditMaxSlots(plan.maxSlots);
    setEditMultiplier(plan.searchBoostMultiplier);
    setIsEditModalOpen(true);
  };

  const primaryVendor = overview?.subscribedVendors[0];

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            NovaBoost Monetization Engine & Auto-Billing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Marketplace Ads & Vendor Subscriptions
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Oversee recurring subscription revenue, manage package pricing, enforce ad quality control, and monitor the automated <strong>auto-deduct & auto-cancel</strong> billing lifecycle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleProcessRenewals}
            disabled={isRunningEngine}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {isRunningEngine ? 'Checking Subscriptions...' : 'Run Auto-Billing Check'}
          </button>
        </div>
      </div>

      {/* ── Top Financial & Operational KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatPrice(overview?.mrrGH || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ₦{(overview?.mrrNG || 0).toLocaleString()} NGN pipeline
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Subscribers</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {overview?.activeCount || 0}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {overview?.expiredCount || 0} expired / free tiers
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Sponsored Impressions</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {(overview?.totalPlatformImpressions || 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Delivered across search & catalog
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Product Ad Clicks</span>
            <MousePointer className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {(overview?.totalPlatformClicks || 0).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            High-intent customer visits
          </div>
        </div>
      </div>

      {/* ── Automated Billing Lifecycle Engine & Simulator Controller ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Automated Billing & Expiry Engine
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evaluates vendor wallet balances and auto-deducts renewals or auto-cancels boost slots.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hourly Cron Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Rule 1: Auto-Deduct */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                Case 1: Auto-Deduct & Renew
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                If the vendor has <strong>enough wallet balance</strong> on the renewal date, the system auto-deducts the monthly plan fee, logs an invoice, and advances validity by 30 days.
              </p>
            </div>

            {/* Rule 2: Auto-Cancel */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                Case 2: Auto-Cancel & Unboost
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                If the vendor has <strong>insufficient funds</strong>, the subscription is automatically cancelled, all promoted products are paused immediately, and slots are revoked.
              </p>
            </div>
          </div>

          {/* Test Simulation Controls */}
          {primaryVendor && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-500">
                Test Simulator for <strong>{primaryVendor.storeName}</strong>:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulateAutoDeduct(primaryVendor.vendorId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  Test Auto-Deduct (₵{primaryVendor.balance} Balance)
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulateAutoCancel(primaryVendor.vendorId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Test Auto-Cancel (₵0 Balance)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Engine Activity Logs */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 border border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Live Billing Audit Log
              </span>
              <button
                onClick={() => setActivityLogs(['Log cleared. Monitoring background daemon.'])}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="h-44 overflow-y-auto space-y-1.5 text-[11px] font-mono pr-1 scrollbar-thin">
              {activityLogs.map((log, idx) => (
                <div key={idx} className="leading-snug text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-800">
            Last cycle ran at {new Date().toLocaleTimeString()} • All checks logged
          </div>
        </div>
      </div>

      {/* ── Subscribed Vendors Management Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Subscribed Vendors & Ad Quotas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect vendor wallet balances, active boost slots, and manage moderation overrides.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Merchant Store</th>
                <th className="py-3.5 px-4">Active Plan</th>
                <th className="py-3.5 px-4">Renewal Fee</th>
                <th className="py-3.5 px-4">Wallet Balance Health</th>
                <th className="py-3.5 px-4 text-center">Boost Slots Used</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {overview?.subscribedVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No subscribed vendors found.
                  </td>
                </tr>
              ) : (
                overview?.subscribedVendors.map((vendor) => {
                  const sub = vendor.subscription;
                  const daysLeft = sub?.expiresAt
                    ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86400000))
                    : 0;

                  return (
                    <tr key={vendor.vendorId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {vendor.storeName}
                          </p>
                          <p className="text-[11px] text-slate-500">{vendor.email} • {vendor.phone}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          sub?.status === 'active'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          {sub?.planName} ({sub?.status})
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {sub?.status === 'active' ? `${daysLeft} days until renewal` : 'Cancelled / Expired'}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                        {formatPrice(vendor.renewalFee)} / mo
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {formatPrice(vendor.balance)}
                            </p>
                            {vendor.hasSufficientFunds ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready for Auto-Deduct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                                <AlertTriangle className="w-3 h-3" />
                                Low Balance (Will Auto-Cancel)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-slate-900 dark:text-white">
                        {vendor.promotedProductCount} / {sub?.slotsTotal || 0}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub?.status === 'active' ? (
                            <button
                              onClick={() => handleModerate(vendor.vendorId, 'pause')}
                              className="px-2.5 py-1.5 rounded-lg border border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-[11px] font-semibold cursor-pointer"
                              title="Pause Boost"
                            >
                              Pause
                            </button>
                          ) : (
                            <button
                              onClick={() => handleModerate(vendor.vendorId, 'resume')}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-[11px] font-semibold cursor-pointer"
                              title="Resume Boost"
                            >
                              Resume
                            </button>
                          )}
                          <button
                            onClick={() => handleModerate(vendor.vendorId, 'grant_days', 30)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px] font-semibold cursor-pointer"
                            title="Grant +30 Free Days"
                          >
                            +30 Days Free
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Plan Pricing & Quota Management Cards ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Manage Package Tiers & Monetization
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize prices, boost slot quotas, and catalog search ranking priority multipliers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overview?.plans.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {p.name}
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {p.tier}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    GH₵{p.priceGH}
                  </span>
                  <span className="text-xs text-slate-500">/ ₦{p.priceNG.toLocaleString()}</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Slots: <strong>{p.maxSlots === 999 ? 'Unlimited' : p.maxSlots}</strong> • Search Boost: <strong>{p.searchBoostMultiplier}x</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openPlanEditor(p)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-amber-500 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Pricing & Slots
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit Plan Modal ── */}
      <AnimatePresence>
        {isEditModalOpen && editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Edit {editingPlan.name}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Price in Ghana (GH₵)
                  </label>
                  <input
                    type="number"
                    value={editPriceGH}
                    onChange={(e) => setEditPriceGH(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Price in Nigeria (₦ NGN)
                  </label>
                  <input
                    type="number"
                    value={editPriceNG}
                    onChange={(e) => setEditPriceNG(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Max Promoted Slots Quota
                  </label>
                  <input
                    type="number"
                    value={editMaxSlots}
                    onChange={(e) => setEditMaxSlots(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Search Ranking Boost Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editMultiplier}
                    onChange={(e) => setEditMultiplier(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingPlan}
                  onClick={handleSavePlan}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-xs active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingPlan ? 'Saving Changes...' : 'Save Plan Settings'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPromotionsView;
