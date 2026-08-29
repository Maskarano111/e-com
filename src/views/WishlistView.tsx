import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingCart, Trash2, Share2, ArrowLeft, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types/index';

interface WishlistViewProps {
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView?: (product: Product) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ onNavigate, onOpenQuickView }) => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useSettings();
  const { showToast } = useToast();

  const handleMoveToCart = (product: Product) => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.featuredImage,
      quantity: 1,
      stockQuantity: product.stockQuantity,
      vendorId: product.vendorId,
      vendorName: product.vendorName
    });
    removeFromWishlist(product.id);
    showToast(`"${product.name}" moved to cart!`, 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'My NovaMart Wishlist', text: 'Check out my wishlist on NovaMart!', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Wishlist link copied!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('home')} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                My Wishlist
                <span className="text-base font-medium text-slate-500 dark:text-slate-400">({wishlistItems.length})</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Items you've saved for later</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wishlistItems.length > 0 && (
              <>
                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Share2 className="w-4 h-4" />Share
                </button>
                <button onClick={() => { clearWishlist(); showToast('Wishlist cleared', 'info'); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-bold hover:bg-rose-100 transition-colors">
                  <Trash2 className="w-4 h-4" />Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <Heart className="w-12 h-12 text-rose-300 dark:text-rose-700" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Save items you love while browsing the store. They'll appear here for easy access.</p>
            <button onClick={() => onNavigate('shop')} className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors">
              Start Shopping
            </button>
          </motion.div>
        )}

        {/* Wishlist Grid */}
        {wishlistItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {wishlistItems.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => onNavigate('product-detail', { productId: product.id })}>
                    <img src={product.featuredImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.discountPrice && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                        -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); removeFromWishlist(product.id); showToast('Removed from wishlist', 'info'); }}
                      className="absolute top-2 right-2 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-[10px] text-slate-400 font-medium mb-1">{product.brand}</p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => onNavigate('product-detail', { productId: product.id })}>
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      ))}
                      <span className="text-[10px] text-slate-400 ml-1">({product.reviewCount})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {formatPrice(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.stockQuantity <= 0}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
