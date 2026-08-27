import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  Navigation,
  Download,
  Key,
  Sparkles,
  RefreshCw,
  Share2,
  Zap,
  Check
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import jsPDF from 'jspdf';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onNavigate: (view: string, param?: any) => void;
}

const TIMELINE_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'Order Placed', label: 'Order Received', description: 'Your order details have been securely logged in our system.' },
  { status: 'Payment Confirmed', label: 'Payment Confirmed', description: 'MoMo / Card transaction cleared and approved.' },
  { status: 'Processing', label: 'Quality Check & Packing', description: 'Items picked and verified at Airport City Fulfillment Hub.' },
  { status: 'Packed', label: 'Packed & Ready', description: 'Package sealed and placed in the dispatch queue.' },
  { status: 'Shipped', label: 'Handed to Courier', description: 'Package dispatched for transit to regional sorting depot.' },
  { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Rider is en route to your specified address.' },
  { status: 'Delivered', label: 'Delivered', description: 'Successfully handed over to recipient and signed.' }
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ initialOrderNumber, onNavigate }) => {
  const { formatPrice, country, countryConfig } = useSettings();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState(initialOrderNumber || 'NM-GH-10928');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [etaMinutes, setEtaMinutes] = useState(24);
  const [courierLocation, setCourierLocation] = useState({ lat: 5.6037, lng: -0.1870, name: 'Airport Residential Area, Accra' });
  const [deliveryOtp, setDeliveryOtp] = useState('7492');

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getOrder(num.trim());
      setOrder(data);
      // Generate deterministic OTP based on order number
      const otp = Math.abs(num.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 9000 + 1000).toString();
      setDeliveryOtp(otp);
    } catch (err: any) {
      setErrorMsg(err.message || 'No matching order found. Please check your order reference number.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchQuery(initialOrderNumber);
      fetchOrder(initialOrderNumber);
    } else {
      fetchOrder('NM-GH-10928');
    }
  }, [initialOrderNumber]);

  // Simulated live ETA countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 5 ? prev - 1 : 28));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchQuery);
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return TIMELINE_STEPS.findIndex((s) => s.status === status);
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 5;

  // Generate downloadable PDF invoice receipt
  const handleDownloadInvoice = () => {
    if (!order) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(5, 150, 105);
      doc.text('NovaMart Ghana — Official Delivery Receipt', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Order Reference: #${order.orderNumber}`, 14, 32);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString('en-GB')}`, 14, 38);
      doc.text(`Customer: ${order.customerName}`, 14, 44);
      doc.text(`Delivery Address: ${order.deliveryAddress?.address || 'Accra, Ghana'}`, 14, 50);
      doc.text(`Payment Method: ${order.paymentMethod?.toUpperCase()} (${order.paymentStatus})`, 14, 56);
      doc.text(`Delivery Handover OTP: ${deliveryOtp}`, 14, 62);

      doc.setDrawColor(200);
      doc.line(14, 68, 196, 68);

      doc.setFontSize(12);
      doc.setTextColor(20);
      doc.text('Order Items:', 14, 76);

      let yPos = 84;
      order.items.forEach((item, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${item.productName} (x${item.quantity})`, 14, yPos);
        doc.text(`GH₵ ${(item.price * item.quantity).toFixed(2)}`, 160, yPos);
        yPos += 8;
      });

      doc.line(14, yPos + 4, 196, yPos + 4);
      yPos += 12;

      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105);
      doc.text(`Grand Total Paid: GH₵ ${order.totalAmount.toFixed(2)}`, 14, yPos);

      doc.setFontSize(9);
      doc.setTextColor(140);
      doc.text('Thank you for shopping with NovaMart Ghana! 100% Authentic Guaranteed.', 14, yPos + 16);

      doc.save(`NovaMart-Receipt-${order.orderNumber}.pdf`);
      showToast('success', 'Receipt Downloaded', 'Official PDF invoice saved to your device.');
    } catch (e) {
      console.error('Invoice download error', e);
      showToast('error', 'Error', 'Failed to generate PDF invoice.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. HEADER & SEARCH */}
      <div className="text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Live GPS Courier Radar
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Enter your order reference code (e.g. <strong>NM-GH-10928</strong>) or courier tracking number.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-2 flex gap-2">
          <div className="relative flex-1">
            <input
              id="input-tracking-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. NM-GH-10928"
              required
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white uppercase outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            id="btn-submit-track"
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. ORDER TRACKING DETAILS */}
      {order && (
        <div className="space-y-6">
          {/* Live Simulated GPS Map Route Card */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-white space-y-6">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Dispatch Feed
                  </span>
                </div>
                <h3 className="text-xl font-black mt-1">Order #{order.orderNumber}</h3>
                <p className="text-xs text-slate-400">
                  Estimated Arrival: <strong className="text-white">Today in ~{etaMinutes} mins</strong>
                </p>
              </div>

              {/* Handover OTP Box */}
              <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3.5 shadow-inner">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                    Handover PIN / OTP
                  </span>
                  <span className="text-xl font-mono font-black text-emerald-400 tracking-widest">
                    {deliveryOtp}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Live Route Graphic */}
            <div className="relative py-4 px-2">
              <div className="flex items-center justify-between relative">
                {/* Connecting Route Line */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 w-3/4 animate-pulse" />
                </div>

                {/* Hub Point */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-md">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold mt-2">
                    {order.deliveryAddress?.country === 'Nigeria' || country === 'NG' ? 'Ikeja Depot' : 'Airport City Hub'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {order.deliveryAddress?.country === 'Nigeria' || country === 'NG' ? 'Lagos Hub' : 'Accra Hub'}
                  </span>
                </div>

                {/* Live Courier Point (In Transit) */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 mt-2">En Route (Express)</span>
                  <span className="text-[10px] text-slate-300">{courierLocation.name}</span>
                </div>

                {/* Destination Point */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold mt-2">Your Doorstep</span>
                  <span className="text-[10px] text-slate-400">
                    {order.deliveryAddress?.city || (country === 'NG' ? 'Lagos' : 'Accra')}
                  </span>
                </div>
              </div>
            </div>

            {/* Courier Rider Profile & Actions */}
            <div className="relative pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Courier Rider"
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">
                      {order.deliveryAddress?.country === 'Nigeria' || country === 'NG' ? 'Chinedu Okafor' : 'Kofi Mensah'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      ★ 4.9 Verified Rider
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Vehicle: <strong>{order.deliveryAddress?.country === 'Nigeria' || country === 'NG' ? 'Bajaj Boxer (LAG-892-JJ)' : 'Honda Ace 125 (GT-4402-23)'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:justify-end">
                <a
                  href={`tel:${order.deliveryAddress?.country === 'Nigeria' || country === 'NG' ? '+2348025550199' : '+233245550199'}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Rider</span>
                </a>
                <a
                  href={`https://wa.me/${order.deliveryAddress?.country === 'Nigeria' || country === 'NG' ? '2348025550199' : '233245550199'}?text=Hello%20NovaMart%20Driver,%20inquiring%20about%20Order%20${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Status Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Order Code</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">#{order.orderNumber}</h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadInvoice}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" /> Download PDF Receipt
                </button>

                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  order.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : order.orderStatus === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  Status: {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Visual 7-Stage Timeline */}
            <div className="py-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
                Delivery Progress & Checkpoints
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      {/* Node Icon */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-white dark:ring-slate-900'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 ring-4 ring-white dark:ring-slate-900'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold leading-tight ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold animate-pulse">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier & Address Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Destination Address</span>
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">{order.deliveryAddress?.name || order.customerName}</p>
                <p className="text-slate-500">{order.deliveryAddress?.address}, {order.deliveryAddress?.city}</p>
                <p className="text-slate-500">{order.deliveryAddress?.region} Region, Ghana</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment & Invoice</span>
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  Total: {formatPrice(order.totalAmount)}
                </p>
                <p className="text-slate-500">Method: <strong>{order.paymentMethod?.toUpperCase()}</strong> ({order.paymentStatus})</p>
                <p className="text-slate-500">Tracking Code: <strong>{order.trackingNumber || 'GH-TRK-77402'}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
