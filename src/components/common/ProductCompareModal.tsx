import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale,
  X,
  Trash2,
  ShoppingCart,
  Star,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight
} from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { Product } from '../../types/index';

interface ProductCompareModalProps {
  onNavigateToProduct: (productId: string) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({ onNavigateToProduct }) => {
  const {
    compareItems,
    removeFromCompare,
    clearCompare,
    isCompareModalOpen,
    setIsCompareModalOpen,
    compareCount
  } = useCompare();

  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { formatPrice } = useSettings();

  if (compareCount === 0) return null;

  // Determine lowest price product for 'Best Price' badge
  const lowestPriceItem = [...compareItems].sort(
    (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
  )[0];

  // Highest rated product
  const highestRatedItem = [...compareItems].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

  // Extract all unique specification keys
  const allSpecKeys: string[] = Array.from(
    new Set<string>(
      compareItems.flatMap((p) =>
        Array.isArray(p.specifications) ? p.specifications.map((s) => s.name || '') : []
      )
    )
  ).filter(Boolean);

  return (
    <>
      {/* 1. Floating Bottom Compare Dock (Visible when items selected and modal closed) */}
      {!isCompareModalOpen && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3 sm:gap-6 max-w-[94vw] sm:max-w-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                Compare Products
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {compareCount}/4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Side-by-side specs, price & ratings
              </p>
            </div>
          </div>

          {/* Mini Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {compareItems.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.featuredImage || item.images?.[0]}
                  alt={item.name}
                  className="w-9 h-9 rounded-lg object-cover bg-white/10 border border-white/20 flex-shrink-0"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCompare(item.id);
                  }}
                  title="Remove"
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              Compare <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearCompare}
              title="Clear all comparison items"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Full Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Product Comparison Matrix
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                        {compareCount} products selected
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Compare pricing, features, specifications, and customer feedback side by side
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCompare}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Matrix Table */}
              <div className="flex-1 overflow-auto p-6">
                <div className="min-w-[680px]">
                  {/* Grid for Products */}
                  <div
                    className="grid gap-4 items-start"
                    style={{ gridTemplateColumns: `180px repeat(${compareItems.length}, minmax(200px, 1fr))` }}
                  >
                    {/* Row 1: Product Header */}
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-3">
                      Overview
                    </div>
                    {compareItems.map((product) => (
                      <div
                        key={product.id}
                        className="relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center group"
                      >
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {lowestPriceItem?.id === product.id && compareItems.length > 1 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                              Best Value
                            </span>
                          )}
                          {highestRatedItem?.id === product.id && compareItems.length > 1 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                              Top Rated ★
                            </span>
                          )}
                        </div>

                        <img
                          src={product.featuredImage || product.images?.[0]}
                          alt={product.name}
                          className="w-28 h-28 object-contain rounded-lg mb-3 bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 cursor-pointer group-hover:scale-105 transition-transform"
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            onNavigateToProduct(product.id);
                          }}
                        />

                        <h4
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            onNavigateToProduct(product.id);
                          }}
                          className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 line-clamp-2 cursor-pointer mb-2"
                        >
                          {product.name}
                        </h4>

                        {/* Price */}
                        <div className="mb-3">
                          <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(product.discountPrice || product.price)}
                          </div>
                          {product.discountPrice && (
                            <div className="text-xs text-slate-400 line-through">
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </div>

                        {/* Direct Add to Cart */}
                        <button
                          onClick={() => {
                            addToCart(product, 1);
                            setIsCartDrawerOpen(true);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                      </div>
                    ))}

                    {/* Divider */}
                    <div className="col-span-full border-b border-slate-200 dark:border-slate-800 my-2" />

                    {/* Row 2: Customer Rating */}
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> Customer Rating
                    </div>
                    {compareItems.map((product) => (
                      <div key={`rating-${product.id}`} className="text-xs text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-amber-500">★</span>
                          <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                          <span className="text-slate-400 text-[11px] font-normal">
                            ({product.reviewCount || 12} reviews)
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Divider */}
                    <div className="col-span-full border-b border-slate-100 dark:border-slate-800 my-2" />

                    {/* Row 3: Availability & Stock */}
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Stock Availability
                    </div>
                    {compareItems.map((product) => (
                      <div key={`stock-${product.id}`} className="text-xs">
                        {product.stockQuantity > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Check className="w-3.5 h-3.5" /> In Stock ({product.stockQuantity} units)
                          </span>
                        ) : (
                          <span className="text-rose-500 font-semibold">Out of Stock</span>
                        )}
                      </div>
                    ))}

                    {/* Divider */}
                    <div className="col-span-full border-b border-slate-100 dark:border-slate-800 my-2" />

                    {/* Row 4: Brand & Category */}
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Brand / Category
                    </div>
                    {compareItems.map((product) => (
                      <div key={`brand-${product.id}`} className="text-xs text-slate-800 dark:text-slate-200">
                        <div className="font-semibold">{product.brand || 'Original Brand'}</div>
                        <div className="text-[11px] text-slate-400">{product.categoryName}</div>
                      </div>
                    ))}

                    {/* Divider */}
                    <div className="col-span-full border-b border-slate-100 dark:border-slate-800 my-2" />

                    {/* Row 5: Delivery & Buyer Protection */}
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Delivery & Warranty
                    </div>
                    {compareItems.map((product) => (
                      <div key={`shipping-${product.id}`} className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-emerald-500" />
                          <span>Same-Day & Express Dispatch</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-500" />
                          <span>7-Day Return & Authentic Guarantee</span>
                        </div>
                      </div>
                    ))}

                    {/* Dynamic Specifications */}
                    {allSpecKeys.length > 0 && (
                      <>
                        <div className="col-span-full border-b border-slate-200 dark:border-slate-700 my-3" />
                        <div className="col-span-full text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Technical Specifications
                        </div>
                        {allSpecKeys.map((specKey) => (
                          <React.Fragment key={specKey}>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
                              {specKey}
                            </div>
                            {compareItems.map((product) => {
                              const spec = Array.isArray(product.specifications)
                                ? product.specifications.find((s) => s.name.toLowerCase() === specKey.toLowerCase())
                                : null;
                              return (
                                <div key={`${specKey}-${product.id}`} className="text-xs text-slate-800 dark:text-slate-200 py-1">
                                  {spec ? spec.value : '—'}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Tip: Click on any product name or image to view full details.</span>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Close Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
