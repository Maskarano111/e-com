import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Eye, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const AdminReturnRequestsView: React.FC = () => {
  const { formatPrice } = useSettings();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try { const res = await api.getAdminReturnRequests(); setRequests(res || []); }
    catch { } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.customerName?.toLowerCase().includes(search.toLowerCase()) || r.orderNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdate = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    setIsProcessing(true);
    try {
      await api.updateReturnRequest(selected.id, { status, adminNote });
      showToast(`Return request ${status}!`, 'success');
      setSelected(null);
      await load();
    } catch { showToast('Failed to update', 'error'); }
    finally { setIsProcessing(false); }
  };

  const badge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Return & Refund Requests</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review and process customer return requests</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or order #..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
          {['all', 'pending', 'approved', 'rejected'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading return requests...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <RotateCcw className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 font-semibold">No return requests</p>
            <p className="text-slate-400 text-sm">Customer return requests will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">#{r.orderNumber}</span>
                    {badge(r.status)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{r.customerName} · Reason: {r.reason}</p>
                  <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString('en-GH')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-emerald-600">{formatPrice(r.refundAmount || 0)}</p>
                  <button onClick={() => { setSelected(r); setAdminNote(r.adminNote || ''); }}
                    className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    <Eye className="w-3 h-3" />Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Return Request — #{selected.orderNumber}</h2>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-semibold text-slate-900 dark:text-white">{selected.customerName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Refund Amount</span><span className="font-black text-emerald-600">{formatPrice(selected.refundAmount || 0)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Refund To</span><span className="font-semibold text-slate-900 dark:text-white">{selected.refundPreference?.replace(/_/g, ' ') || 'Original method'}</span></div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Reason</p>
                  <p className="text-slate-900 dark:text-white text-xs">{selected.reason}</p>
                  {selected.additionalNotes && <p className="text-slate-500 text-xs mt-1">{selected.additionalNotes}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Admin Note</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2} placeholder="Add a note for this decision..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
              </div>
              {selected.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => handleUpdate('rejected')} disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50">
                    <XCircle className="w-4 h-4" />Reject
                  </button>
                  <button onClick={() => handleUpdate('approved')} disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    <CheckCircle2 className="w-4 h-4" />{isProcessing ? 'Processing...' : 'Approve Refund'}
                  </button>
                </div>
              )}
              {selected.status !== 'pending' && (
                <button onClick={() => setSelected(null)} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Close</button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
