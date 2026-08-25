import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  Truck,
  ArrowRight,
  ShieldCheck,
  Copy,
  MapPin,
  Clock,
  Download,
  MessageSquare
} from 'lucide-react';
import { Order } from '../types/index';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { generateOrderInvoicePDF } from '../utils/pdfGenerator';

interface OrderConfirmationViewProps {
  order: Order | null;
  onNavigate: (view: string, param?: any) => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({ order, onNavigate }) => {
  const { formatPrice, settings } = useSettings();
  const { showToast } = useToast();

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Order Found</h2>
        <p className="text-xs text-slate-500">You do not have an active order session.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleCopyOrderNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(order.orderNumber);
      showToast('success', 'Copied!', `Order #${order.orderNumber} copied to clipboard.`);
    }
  };

  const handleDownloadPDF = () => {
    try {
      generateOrderInvoicePDF(order, settings);
      showToast('success', 'PDF Generated', 'Your official commercial tax invoice has been downloaded.');
    } catch (err) {
      showToast('error', 'Download Failed', 'Could not generate PDF invoice.');
    }
  };

  const handleWhatsAppUpdates = () => {
    const message = `Hello NovaMart! I just placed order #${order.orderNumber} for GH₵ ${order.total.toLocaleString()}. Please send me live WhatsApp dispatch updates.`;
    window.open(`https://wa.me/233245550199?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. CELEBRATION HEADER */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Order Confirmed</span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Thank You For Your Order!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          We’ve received your order and our fulfilment team at Airport City, Accra is currently packaging your items.
        </p>

        {/* Order Number Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white mt-2">
          <span>Order Number: <strong>#{order.orderNumber}</strong></span>
          <button
            onClick={handleCopyOrderNumber}
            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
            title="Copy order number"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. RECEIPT / INVOICE CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* Receipt Top Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Date</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Status</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              order.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}>
              {order.paymentStatus}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
            <span className="font-bold text-slate-900 dark:text-white capitalize">
              {order.paymentMethod === 'momo' ? 'Mobile Money (MoMo)' : order.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Delivery</span>
            <span className="font-bold text-emerald-600">
              {new Date(order.estimatedDelivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Shipping Address & Customer details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delivery Address</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-slate-500">{order.shippingAddress.street}</p>
            <p className="text-slate-500">{order.shippingAddress.city}, {order.shippingAddress.region} Region</p>
            <p className="text-slate-500">Contact: {order.shippingAddress.phoneNumber}</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dispatch Method</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300 capitalize font-semibold">
              {order.deliveryMethod === 'express' ? 'Express Next-Day Dispatch' : 'Standard Courier Delivery'}
            </p>
            <p className="text-slate-500">Tracking Code: <strong>{order.trackingNumber || 'Assigned on Dispatch'}</strong></p>
            <p className="text-slate-500">Confirmation email sent to: <strong>{order.customerEmail}</strong></p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Purchased Items</h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} {item.variationName && `• ${item.variationName}`}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Promo Discount ({order.couponCode})</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>Delivery Fee</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Tax (3.5%)</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-700 text-base font-black text-slate-900 dark:text-white">
            <span>Total Paid</span>
            <span className="text-xl text-emerald-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* 3. ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Invoice (PDF)</span>
          </button>

          <button
            onClick={handleWhatsAppUpdates}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Updates</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('track-order', { orderNumber: order.orderNumber })}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
          >
            <Truck className="w-4 h-4 text-emerald-500" />
            <span>Track Order Progress</span>
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
