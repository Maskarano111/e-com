import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (view: string, param?: any) => void;
  onNavigateToCart?: () => void;
  onNavigateToCheckout?: () => void;
  onNavigateToShop?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onNavigateToCart,
  onNavigateToCheckout,
  onNavigateToShop
}) => {
  const {
    cart,
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    total,
    appliedCoupon,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { formatPrice, settings } = useSettings();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const isVisible = (isOpen !== undefined ? isOpen : false) || isCartDrawerOpen;

  const handleClose = () => {
    setIsCartDrawerOpen(false);
    if (onClose) onClose();
  };

  const handleGoToShop = () => {
    handleClose();
    if (onNavigate) onNavigate('shop');
    else if (onNavigateToShop) onNavigateToShop();
  };

  const handleGoToCheckout = () => {
    handleClose();
    if (onNavigate) onNavigate('checkout');
    else if (onNavigateToCheckout) onNavigateToCheckout();
  };

  const handleGoToCart = () => {
    handleClose();
    if (onNavigate) onNavigate('cart');
    else if (onNavigateToCart) onNavigateToCart();
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    setCouponInput('');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          onClick={handleClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Shopping Bag</h3>
                  <p className="text-xs text-slate-400">{itemCount} items selected</p>
                </div>
              </div>
              <button
                id="btn-close-cart-drawer"
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Delivery Bar */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 px-5 py-2.5 border-b border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Truck className="w-4 h-4 shrink-0" />
              {subtotal >= settings.freeDeliveryThreshold ? (
                <span>🎉 You qualify for <strong>FREE Delivery</strong> in Accra!</span>
              ) : (
                <span>
                  Add <strong>{formatPrice(settings.freeDeliveryThreshold - subtotal)}</strong> more for <strong>FREE Delivery</strong>!
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Your shopping bag is empty</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Discover electronics, fashion, beauty, perfumes, phones, home appliances, and groceries.
                    </p>
                  </div>
                  <button
                    onClick={handleGoToShop}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Start Shopping Now
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-18 h-18 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.selectedVariation && (
                          <span className="inline-block mt-0.5 text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.selectedVariation.name}
                          </span>
                        )}
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 dark:text-white px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stockQuantity}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                {/* Coupon input */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> Applied</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      id="input-drawer-coupon"
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Promo / Coupon (e.g. WELCOME10)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white uppercase placeholder-slate-400 outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Subtotal lines */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Estimated Delivery</span>
                    <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Estimated Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2">
                  <button
                    id="btn-drawer-checkout"
                    onClick={handleGoToCheckout}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="btn-drawer-view-cart"
                    onClick={handleGoToCart}
                    className="w-full py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    View Shopping Cart Details
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
