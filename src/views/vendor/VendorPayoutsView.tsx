import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Plus,
  X,
  History,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { Vendor, VendorPayoutRequest } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const VendorPayoutsView: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice } = useSettings();
  const { showToast } = useToast();
  const vendorId = user?.vendorId || 'vend-kofi';

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [payouts, setPayouts] = useState<VendorPayoutRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [payoutMethod, setPayoutMethod] = useState<'mtn_momo' | 'telecel_cash' | 'airteltigo' | 'bank_transfer'>('mtn_momo');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vendorRes, payoutsRes] = await Promise.all([
        api.getVendorById(vendorId),
        api.getVendorPayouts(vendorId)
      ]);
      setVendor(vendorRes);
      setPayouts(payoutsRes || []);
      if (vendorRes?.payoutDetails) {
        setPayoutMethod(vendorRes.payoutDetails.method || 'mtn_momo');
        setAccountName(vendorRes.payoutDetails.accountName || '');
        setAccountNumber(vendorRes.payoutDetails.accountNumber || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const available = vendor?.balance || 0;
    if (amount <= 0 || amount > available) {
      showToast('error', 'Invalid Amount', `You can request up to ${formatPrice(available)}.`);
      return;
    }

    try {
      await api.requestVendorPayout({
        vendorId,
        amount,
        payoutDetails: {
          method: payoutMethod,
          accountName: accountName || vendor?.ownerName || 'Vendor',
          accountNumber: accountNumber || vendor?.phone || '0248881234'
        },
        notes
      });

      showToast('success', 'Payout Requested', `Disbursement request for ${formatPrice(amount)} has been submitted.`);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message || 'Could not process payout request.');
    }
  };

  const totalPaidOut = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Wallet Balance &amp; MoMo Disbursements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your merchant earnings, view cleared funds, and request instant Mobile Money withdrawals.
          </p>
        </div>

        <button
          id="btn-vendor-request-payout"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white shadow-xl shadow-emerald-600/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
              Available For Withdrawal
            </span>
            <Wallet className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-3xl font-black">{formatPrice(vendor?.balance || 3450.00)}</p>
          <p className="text-[11px] text-emerald-100">Ready to transfer to your MTN MoMo / Bank</p>
        </div>

        {/* Pending Settlement */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Order Clearing
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {formatPrice(vendor?.pendingBalance || 1200.00)}
          </p>
          <p className="text-[11px] text-slate-500">Releases upon buyer delivery confirmation</p>
        </div>

        {/* Total Lifetime Paid Out */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Lifetime Disbursed
            </span>
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {formatPrice(totalPaidOut || 4000.00)}
          </p>
          <p className="text-[11px] text-slate-500">Successfully sent to your Mobile Money</p>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Withdrawal &amp; Payout History</h2>
            <p className="text-xs text-slate-500">Record of all disbursement requests and transaction receipts</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Payout Ref</th>
                  <th className="py-3.5 px-4">Amount (GH₵)</th>
                  <th className="py-3.5 px-4">Destination Account</th>
                  <th className="py-3.5 px-4">Date Requested</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading payout ledger...
                    </td>
                  </tr>
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No payout requests found yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {p.transactionRef || p.id}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                        {formatPrice(p.amount)}
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                          {p.payoutDetails?.method?.replace('_', ' ') || 'MTN MoMo'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {p.payoutDetails?.accountNumber} ({p.payoutDetails?.accountName})
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : p.status === 'processing'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="capitalize">{p.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => showToast('info', 'Receipt', `Transaction ${p.transactionRef || p.id} verified.`)}
                          className="text-xs text-amber-600 font-bold hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Payout Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 text-xs"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Request Funds Withdrawal</h2>
                  <p className="text-slate-500">
                    Available balance: <strong>{formatPrice(vendor?.balance || 3450.00)}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Withdrawal Amount (GH₵) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max={vendor?.balance || 3450.00}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Disbursement Channel *
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-hidden"
                  >
                    <option value="mtn_momo">MTN Mobile Money (Ghana)</option>
                    <option value="telecel_cash">Telecel Cash</option>
                    <option value="airteltigo">AT Money</option>
                    <option value="bank_transfer">Ghana Commercial Bank Transfer</option>
                  </select>
                </div>

                {/* MoMo / Account Name */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Account / Subscriber Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Kofi Boateng"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Mobile Money / Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="024XXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
                  >
                    Confirm &amp; Disburse
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
