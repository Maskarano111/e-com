import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Download, Search, Filter, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { PaymentTransaction } from '../../types/index';

export const AdminPaymentsView: React.FC = () => {
  const { formatPrice } = useSettings();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminPayments();
      setPayments(res || []);
    } catch { } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = payments.filter(p => {
    const matchSearch = !search ||
      p.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionReference?.toLowerCase().includes(search.toLowerCase()) ||
      p.orderNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.filter(p => p.status === 'successful').reduce((s, p) => s + p.amount, 0);

  const statusBadge = (status: string) => {
    if (status === 'successful') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 className="w-3 h-3" />SUCCESS
      </span>
    );
    if (status === 'pending') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        <Clock className="w-3 h-3" />PENDING
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300">
        <XCircle className="w-3 h-3" />FAILED
      </span>
    );
  };

  const exportCSV = () => {
    const headers = ['Transaction Ref', 'Order #', 'Customer', 'Amount', 'Method', 'Status', 'Date'];
    const rows = filtered.map(p => [
      p.transactionReference, p.orderNumber, p.customerName, p.amount,
      p.paymentMethod, p.status, new Date(p.createdAt).toLocaleString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'novamart-payments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payments & Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Full transaction log for all payment methods</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
            <Download className="w-4 h-4" />Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Transactions', value: payments.length, color: 'from-blue-500 to-indigo-500' },
          { label: 'Successful Payments', value: payments.filter(p => p.status === 'successful').length, color: 'from-emerald-500 to-teal-500' },
          { label: 'Total Revenue', value: formatPrice(totalRevenue), color: 'from-purple-500 to-pink-500' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className={`text-2xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer, order #, or reference..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
          <option value="all">All Statuses</option>
          <option value="successful">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading payment transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 font-semibold">No transactions found</p>
            <p className="text-slate-400 text-sm">Payment records appear here once orders are placed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['Transaction Ref', 'Order #', 'Customer', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(p => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{p.transactionReference}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">#{p.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{p.customerName}</p>
                        <p className="text-[10px] text-slate-400">{p.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-black text-emerald-600">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                        {p.paymentMethod?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString('en-GH', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
