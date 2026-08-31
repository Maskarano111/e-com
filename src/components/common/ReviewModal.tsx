import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, CheckCircle2, Upload, Trash2, Camera, MapPin, ShieldCheck } from 'lucide-react';
import { Product } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface ReviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  product,
  isOpen,
  onClose,
  onReviewSubmitted
}) => {
  const { user } = useAuth();
  const { country } = useSettings();
  const { showToast } = useToast();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [buyerLocation, setBuyerLocation] = useState(country === 'NG' ? 'Lagos, Nigeria' : 'Accra, Ghana');
  const [images, setImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      showToast('info', 'Photo Limit', 'You can upload up to 3 photos per review.');
      return;
    }

    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File Too Large', `${file.name} is larger than 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = (loadEvt.target?.result as string) || '';
        setImages((prev) => [...prev, { name: file.name, dataUrl }].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });

  };

  const removePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      showToast('error', 'Incomplete Review', 'Please fill in both a headline and detailed feedback.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitReview({
        productId: product.id,
        productName: product.name,
        userId: user?.id || `usr-cust-${Date.now().toString().slice(-4)}`,
        userName: user ? `${user.firstName} ${user.lastName}` : (country === 'NG' ? 'Verified Nigerian Buyer' : 'Verified Ghanaian Buyer'),
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images: images.map((img) => img.dataUrl),
        country: country,
        location: buyerLocation
      });

      showToast('success', 'Review Published! ⭐', 'Thank you for helping fellow shoppers.');
      setTitle('');
      setComment('');
      setImages([]);
      setRating(5);
      onClose();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Could not submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto"
        >
          <button
            id="btn-close-review-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <img
              src={product.featuredImage}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Buyer Review</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{product.name}</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Star selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Overall Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                  {rating === 5 ? '5.0 - Excellent' : rating === 4 ? '4.0 - Very Good' : rating === 3 ? '3.0 - Good' : `${rating}.0`}
                </span>
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Review Headline <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-review-headline"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Excellent build quality, tested and works perfectly!"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your City &amp; Region
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={buyerLocation}
                  onChange={(e) => setBuyerLocation(e.target.value)}
                  placeholder="e.g. East Legon, Accra / Lekki, Lagos"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Detailed feedback */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Experience <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="textarea-review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="How was the product performance, packaging, or delivery speed?"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Attach Real Product Photos (Optional - Max 3)</span>
                </label>
                <span className="text-[10px] text-slate-400">{images.length}/3 photos</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={img.dataUrl} alt="Review attachment" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ))}

                {images.length < 3 && (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/20 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-review"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Publishing...' : 'Submit Verified Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
