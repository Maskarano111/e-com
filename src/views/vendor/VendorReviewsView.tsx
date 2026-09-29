import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Search,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Package,
  Calendar,
  Reply,
  Send,
  X,
  Store
} from 'lucide-react';
import { api } from '../../services/api';
import { Review } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface VendorReviewItem extends Review {
  vendorReply?: string;
  vendorReplyDate?: string;
}

export const VendorReviewsView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const vendorId = user?.vendorId || '';

  const [reviews, setReviews] = useState<VendorReviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSavingReply, setIsSavingReply] = useState(false);

  // Reply Modal State
  const [replyingReview, setReplyingReview] = useState<VendorReviewItem | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const [productsRes, allReviews] = await Promise.all([api.getVendorProducts(vendorId), api.getReviews()]);
        const vendorProducts = productsRes.products || [];
        const productIds = new Set(vendorProducts.map((product) => product.id));
        setReviews(allReviews.filter((review) => productIds.has(review.productId)).map((review) => ({
          ...review,
          productName: vendorProducts.find((product) => product.id === review.productId)?.name || review.productName || 'Product'
        })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } catch (err) {
        console.error(err);
        setLoadError('Could not load reviews. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadReviews();
  }, [vendorId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;

    setIsSavingReply(true);
    try {
      const saved = await api.saveVendorReviewReply(replyingReview.id, replyText.trim());
      setReviews((prev) => prev.map((review) => review.id === saved.id ? { ...review, ...saved } : review));
      showToast('success', 'Reply Published', `Your reply to ${replyingReview.userName} has been posted.`);
      setReplyingReview(null);
      setReplyText('');
    } catch (err: any) {
      showToast('error', 'Reply Failed', err.message || 'Could not save your reply.');
    } finally {
      setIsSavingReply(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.productName && r.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating = ratingFilter === 0 || r.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const verifiedPercent = reviews.length ? Math.round(reviews.filter((review) => review.verifiedPurchase).length / reviews.length * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Feedback &amp; Product Ratings ({reviews.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified shopper reviews, feedback ratings, and comments on your products.
          </p>
        </div>
      </div>

      {/* Ratings KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center font-black text-xl">
            ★
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Average Store Rating</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{avgRating} / 5.0</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Verified Purchases</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{verifiedPercent}%</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Reviews</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{reviews.length}</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading && <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">Loading reviews…</div>}
        {!isLoading && loadError && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{loadError}<button onClick={() => window.location.reload()} className="ml-3 font-bold underline">Retry</button></div>}
        {!isLoading && !loadError && filteredReviews.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center"><p className="font-bold text-slate-800 dark:text-white">{reviews.length ? 'No reviews match these filters' : 'No customer reviews yet'}</p><p className="mt-1 text-sm text-slate-500">Reviews for your products will appear here.</p></div>}
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                  {rev.userName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{rev.userName}</p>
                  <p className="text-[11px] text-slate-500">
                    Reviewed: <strong className="text-slate-700 dark:text-slate-300">{rev.productName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-slate-900 dark:text-white text-xs">{rev.title}</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
            </div>

            {/* Vendor Reply if exists */}
            {rev.vendorReply && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-[11px]">
                    <Store className="w-3.5 h-3.5" />
                    <span>Your Store Response</span>
                  </span>
                  {rev.vendorReplyDate && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">
                      {new Date(rev.vendorReplyDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{rev.vendorReply}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {rev.verifiedPurchase ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Buyer Purchase</span>
                </span>
              ) : <div />}

              <button
                onClick={() => {
                  setReplyingReview(rev);
                  setReplyText(rev.vendorReply || '');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold transition-colors cursor-pointer"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>{rev.vendorReply ? 'Edit Reply' : 'Reply to Buyer'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Reply to {replyingReview.userName}
                  </h3>
                  <p className="text-slate-500 text-[11px]">{replyingReview.productName}</p>
                </div>
                <button
                  onClick={() => setReplyingReview(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 italic">
                "{replyingReview.comment}"
              </div>

              <form onSubmit={handleSendReply} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Your Official Store Response
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank the customer, provide warranty info, or offer assistance..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReplyingReview(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingReply}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSavingReply ? 'Saving…' : 'Post Reply'}</span>
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
