import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

interface CartViewProps {
  onNavigate: (view: string, param?: any) => void;
}

export const CartView: React.FC<CartViewProps> = ({ onNavigate }) => {
  const {
    cart,
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    appliedCoupon,
    deliveryMethod,
    setDeliveryMethod,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { formatPrice, settings } = useSettings();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCode.trim());
    setIsApplying(false);
    setCouponCode('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added any products to your bag yet. Explore our genuine inventory and grab hot deals!
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
        >
          <span>Start Shopping Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your selections before proceeding to secure checkout</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Shopping Bag</span>
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
        {subtotal >= settings.freeDeliveryThreshold ? (
          <span>
            🎉 Congratulations! Your order qualifies for <strong>FREE Delivery</strong> in Accra & Tema.
          </span>
        ) : (
          <span>
            Add <strong>{formatPrice(settings.freeDeliveryThreshold - subtotal)}</strong> more of eligible items to get <strong>FREE Delivery</strong>!
          </span>
        )}
      </div>

      {/* Main Grid: Items Table Left, Summary Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {cart.map((item) => (
              <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3
                      onClick={() => onNavigate('product-detail', { productId: item.productId })}
                      className="font-bold text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-600 transition-colors"
                    >
                      {item.name}
                    </h3>
                    {item.variationName && (
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">{item.variationName}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">SKU: {item.sku}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white mt-1 sm:hidden">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  {/* Stepper */}
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-9 text-center font-bold text-xs text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total item price */}
                  <div className="text-right min-w-[90px] hidden sm:block">
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-slate-400">({formatPrice(item.price)} each)</p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h2 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Summary
            </h2>

            {/* Delivery Method Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Delivery Preference:
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="standard"
                    checked={deliveryMethod === 'standard'}
                    onChange={() => setDeliveryMethod('standard')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>Standard Delivery</span>
                      <span>{subtotal >= settings.freeDeliveryThreshold ? 'FREE' : formatPrice(settings.standardDeliveryFee)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">1-3 business days nationwide</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="express"
                    checked={deliveryMethod === 'express'}
                    onChange={() => setDeliveryMethod('express')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>Express Next-Day</span>
                      <span>{formatPrice(settings.expressDeliveryFee)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Guaranteed priority dispatch within 24h</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> Applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs font-bold text-rose-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="input-cart-coupon"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. WELCOME10)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isApplying || !couponCode.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-900 dark:hover:text-white text-xs font-bold transition-all disabled:opacity-40"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Tax (3.5%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-700 text-base font-black text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-xl text-emerald-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="btn-cart-proceed-checkout"
              onClick={() => onNavigate('checkout')}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Payment security guarantee */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Encrypted & Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
