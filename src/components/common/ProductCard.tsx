import React from 'react';
import { motion } from 'motion/react';
import { Star, Heart, Eye, ShoppingBag, Check, Zap } from 'lucide-react';
import { Product } from '../../types/index';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
  onNavigateToDetail: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenQuickView,
  onNavigateToDetail
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useSettings();

  const isLiked = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variations && product.variations.length > 0) {
      // If has variations, open quick view so customer chooses size/color
      onOpenQuickView(product);
    } else {
      addToCart(product, undefined, 1);
    }
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onNavigateToDetail(product.id)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent && (
          <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-black tracking-wide shadow-sm flex items-center gap-1">
            <Zap className="w-3 h-3 fill-white" />
            <span>-{discountPercent}% OFF</span>
          </span>
        )}
        {product.isNewArrival && (
          <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
            NEW
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        id={`btn-wishlist-${product.id}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${
          isLiked
            ? 'bg-rose-500 text-white hover:bg-rose-600'
            : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-500'
        }`}
        title={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <img
          src={product.featuredImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View overlay trigger on desktop */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            id={`btn-quick-view-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold shadow-lg backdrop-blur-sm transition-transform active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-rose-900/90 text-white text-xs font-black uppercase tracking-wider border border-rose-700">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            <span className="truncate">{product.categoryName || 'General'}</span>
            <span className="text-slate-600 dark:text-slate-400 font-bold">{product.brand}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              ({product.reviewCount || 12})
            </span>

            {isLowStock && !isOutOfStock && (
              <span className="ml-auto text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                Only {product.stockQuantity} left
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900 dark:text-white">
                {formatPrice(product.discountPrice || product.price)}
              </span>
            </div>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-xs text-slate-600 line-through block">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            id={`btn-add-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all ${
              isOutOfStock
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
            }`}
            title={product.variations?.length ? 'Choose options' : 'Add to cart'}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {product.variations && product.variations.length > 0 ? 'Select' : 'Add'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
