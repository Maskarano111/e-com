import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  MapPin,
  Phone,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';

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
  const { formatPrice } = useSettings();

  const [searchQuery, setSearchQuery] = useState(initialOrderNumber || 'NM-GH-10928');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getOrder(num.trim());
      setOrder(data);
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
      fetchOrder('NM-GH-10928'); // Demo prefill
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchQuery);
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return TIMELINE_STEPS.findIndex((s) => s.status === status);
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. HEADER & SEARCH */}
      <div className="text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
          Live Shipment Status
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
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white uppercase outline-hidden focus:border-emerald-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            id="btn-submit-track"
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
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
          {/* Status Top Badge Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Order Code</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">#{order.orderNumber}</h2>
              </div>

              <div className="flex items-center gap-3">
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

            {/* Visual 6-Stage Timeline */}
            <div className="py-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
                Delivery Progress
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
                          <h4 className={`text-xs font-bold leading-tight ${isCurrent ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold animate-pulse">
                              In Progress
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
                <p className="text-slate-500">{order.deliveryAddress?.region} Region</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dispatch & Rider Details</span>
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">NovaMart Express Courier Hub</p>
                <p className="text-slate-500">Tracking Code: <strong>{order.trackingNumber || 'GH-TRK-77402'}</strong></p>
                <p className="text-slate-500">Estimated: <strong>{new Date(order.estimatedDeliveryDate).toLocaleDateString('en-GB')}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
