import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { Review } from '../../types/index';
import { useToast } from '../../context/ToastContext';

export const AdminReviewsView: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleStatus = async (reviewId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    try {
      await api.updateReviewStatus(reviewId, nextStatus as any);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: nextStatus as any } : r))
      );
      showToast('success', 'Status Updated', `Review marked as ${nextStatus}.`);
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('Delete this customer review?')) {
      try {
        await api.deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        showToast('info', 'Review Deleted', 'Review removed from product.');
      } catch (err: any) {
        showToast('error', 'Error', err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Customer Review Moderation ({reviews.length})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Approve verified purchaser feedback and maintain transparent community ratings
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Reviewer</th>
                <th className="py-3.5 px-4">Rating & Feedback</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{r.userName}</p>
                    <p className="text-[10px] text-slate-400">Product: {r.productId}</p>
                  </td>

                  <td className="py-3 px-4 max-w-sm">
                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {r.title}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{r.comment}</p>
                  </td>

                  <td className="py-3 px-4 text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString('en-GB')}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(r.id, r.status)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          r.status === 'approved'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {r.status === 'approved' ? 'Unpublish' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
