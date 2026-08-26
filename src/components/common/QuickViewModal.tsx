import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Check,
  Zap,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { Product, ProductVariation } from '../../types/index';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDetail: (productId: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onNavigateToDetail
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useSettings();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      if (product.variations && product.variations.length > 0) {
        setSelectedVariation(product.variations[0]);
      } else {
        setSelectedVariation(undefined);
      }
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const rawImages = product.images && product.images.length > 0 ? product.images : [product.featuredImage];
  const imagesList = Array.from(new Set(rawImages.filter(Boolean)));
  const currentImage = imagesList[selectedImageIndex] || product.featuredImage;

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const isLiked = isInWishlist(product.id);
  const currentPrice = selectedVariation
    ? selectedVariation.discountPrice || selectedVariation.price
    : product.discountPrice || product.price;

  const regularPrice = selectedVariation ? selectedVariation.price : product.price;
  const discountPercent = regularPrice > currentPrice
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : null;

  const availableStock = selectedVariation ? selectedVariation.stockQuantity : product.stockQuantity;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (addToCart(product, selectedVariation, quantity)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Close button */}
          <button
            id="btn-close-quickview"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
            {/* Gallery Left */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 shadow-inner flex items-center justify-center group">
                {discountPercent && (
                  <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black tracking-wide shadow-md flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-white" />
                    <span>SAVE {discountPercent}%</span>
                  </span>
                )}

                {imagesList.length > 1 && (
                  <span className="absolute bottom-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                    Photo {selectedImageIndex + 1} of {imagesList.length}
                  </span>
                )}

                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-md hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-md hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {imagesList.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImageIndex === i
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Right */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span className="uppercase tracking-wider text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    {product.brand}
                  </span>
                  <span>SKU: {selectedVariation?.sku || product.sku}</span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {(product.rating ?? 5).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">({product.reviewCount || 0} reviews)</span>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatPrice(currentPrice)}
                  </span>
                  {regularPrice > currentPrice && (
                    <span className="text-sm text-slate-500 line-through">
                      {formatPrice(regularPrice)}
                    </span>
                  )}
                  {availableStock > 0 ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      In Stock ({availableStock} units)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 leading-relaxed line-clamp-3">
                  {product.shortDescription || product.description}
                </p>

                {/* Top Specifications Preview */}
                {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Key Specs:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.specifications.slice(0, 3).map((spec: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <strong className="text-slate-900 dark:text-white">{spec.name}:</strong> {spec.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variations picker */}
                {product.variations && product.variations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                      Select Option / Variation:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.variations.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariation(v)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            selectedVariation?.id === v.id
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
                    <button
                      id="btn-qty-minus"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      id="btn-qty-plus"
                      onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                      disabled={quantity >= availableStock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    id="btn-quickview-add-cart"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add To Bag</span>
                  </button>

                  {/* Wishlist button */}
                  <button
                    id="btn-quickview-wishlist"
                    onClick={() => toggleWishlist(product)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isLiked
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <button
                  id="btn-quickview-view-full"
                  onClick={() => {
                    onClose();
                    onNavigateToDetail(product.id);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <span>View Full Product Specifications & Customer Reviews</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
