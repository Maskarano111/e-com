import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Phone,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Smartphone,
  Banknote,
  Plus
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { DeliveryAddress, Order } from '../types/index';
import { api } from '../services/api';

interface CheckoutViewProps {
  onNavigate: (view: string, param?: any) => void;
}

const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Oti',
  'Savannah',
  'North East',
  'Western North'
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate }) => {
  const { cart, subtotal, discount, deliveryFee, tax, total, appliedCoupon, deliveryMethod, clearCart } = useCart();
  const { user, token } = useAuth();
  const { formatPrice, settings } = useSettings();
  const { showToast } = useToast();

  // Contact Info
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Address State
  const [userAddresses, setUserAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Accra');
  const [region, setRegion] = useState('Greater Accra');
  const [postalCode, setPostalCode] = useState('GA-183-9022');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'paystack' | 'cod'>('momo');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'telecel' | 'at'>('mtn');
  const [momoNumber, setMomoNumber] = useState(user?.phone || '0245550199');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Processing state & simulated payment popup
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMomoPrompt, setShowMomoPrompt] = useState(false);
  const [momoStep, setMomoStep] = useState<'prompt' | 'pin' | 'authorized'>('prompt');
  const [momoPin, setMomoPin] = useState('');

  // Sync user details if logged in
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

      // Load user addresses
      api.getAddresses(user.id).then((addresses) => {
        setUserAddresses(addresses);
        const def = addresses.find((a) => a.isDefault);
        if (def) {
          setSelectedAddressId(def.id || 'custom');
          setStreetAddress(def.address);
          setCity(def.city);
          setRegion(def.region);
        }
      }).catch(console.error);
    }
  }, [user]);

  const handleSelectSavedAddress = (addr: DeliveryAddress) => {
    setSelectedAddressId(addr.id || 'custom');
    setStreetAddress(addr.address);
    setCity(addr.city);
    setRegion(addr.region);
  };

  const handleCreateOrder = async (confirmedPaymentStatus: 'paid' | 'pending' | 'failed' = 'pending', transactionId?: string) => {
    if (!firstName || !lastName || !email || !phone || !streetAddress || !city) {
      showToast('error', 'Missing Information', 'Please complete all customer and delivery address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        userId: user?.id,
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        items: cart,
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        deliveryFee,
        tax,
        total,
        deliveryMethod,
        shippingAddress: {
          id: selectedAddressId !== 'custom' ? selectedAddressId : `addr-${Date.now()}`,
          userId: user?.id || 'guest',
          name: `${firstName} ${lastName}`,
          phone: phone,
          address: streetAddress,
          city,
          region,
          country: 'Ghana',
          isDefault: true
        },
        paymentMethod,
        paymentStatus: confirmedPaymentStatus,
        transactionId: transactionId || `TXN-${Date.now()}`,
        notes: deliveryNotes
      };

      const result: any = await api.createOrder(orderPayload);
      const createdOrder = result.order || result;
      
      // Auto dispatch customer confirmation SMS
      api.sendOrderSMS({
        phone,
        message: `Your NovaMart order #${createdOrder.orderNumber} for GH₵ ${total.toLocaleString()} has been received and confirmed. Track at ${window.location.origin}/#track-${createdOrder.orderNumber}`,
        orderNumber: createdOrder.orderNumber,
        type: 'order_confirmed'
      }).catch(console.warn);

      clearCart();
      showToast('success', 'Order Placed Successfully! 🎉', `Order #${createdOrder.orderNumber || ''} is confirmed.`);
      onNavigate('order-confirmation', { order: createdOrder });
    } catch (err: any) {
      showToast('error', 'Order Failed', err.message || 'Could not process order. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowMomoPrompt(false);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'momo') {
      // Trigger interactive Mobile Money push approval modal
      setShowMomoPrompt(true);
      setMomoStep('prompt');
    } else if (paymentMethod === 'card' || paymentMethod === 'paystack') {
      // Simulate direct Paystack/Card clearance
      handleCreateOrder('paid', `PSTK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    } else {
      // Cash on Delivery
      handleCreateOrder('pending');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Steps */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-1">Complete your delivery and payment details</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Secured</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Sections (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Customer Contact */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Customer Contact Details</h2>
              </div>

              {!user && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                  <span>Already have an account? Sign in for fast checkout.</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="font-bold text-amber-700 dark:text-amber-300 underline"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    id="input-checkout-fname"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Kwame"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input
                    id="input-checkout-lname"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Mensah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    id="input-checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kwame@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone Number *</label>
                  <input
                    id="input-checkout-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +233 24 555 0199"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">Shipping & Delivery Address</h2>
                </div>
              </div>

              {/* Saved addresses selector if user has any */}
              {userAddresses.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select a Saved Address:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {userAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <p className="font-bold text-slate-900 dark:text-white">{addr.title}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{addr.street}, {addr.city}</p>
                        <p className="text-[10px] text-slate-500">{addr.region} • {addr.phoneNumber}</p>
                      </div>
                    ))}
                    <div
                      onClick={() => setSelectedAddressId('custom')}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer flex items-center justify-center gap-2 ${
                        selectedAddressId === 'custom'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-700'
                          : 'border-dashed border-slate-300 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Use New Address</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Street & Region Inputs */}
              <div className="space-y-3 text-xs pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Street Address & House / Landmark *
                  </label>
                  <input
                    id="input-checkout-street"
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. House 42, 14th Close, Airport Residential Area"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City / Town *</label>
                    <input
                      id="input-checkout-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Accra"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Region *</label>
                    <select
                      id="select-checkout-region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      {GHANA_REGIONS.map((r) => (
                        <option key={r} value={r}>{r} Region</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GhanaPost GPS (Optional)</label>
                    <input
                      id="input-checkout-gps"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. GA-183-9022"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Special Rider Delivery Instructions (Optional)
                  </label>
                  <input
                    id="input-checkout-notes"
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Call before arrival; leave with security gate"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Payment Method (Ghana & International)</h2>
              </div>

              {/* Payment Methods selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* MTN Mobile Money / Telecel */}
                <div
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Smartphone className="w-4 h-4 text-amber-500" />
                      <span>Mobile Money</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 text-[10px] font-bold">
                      Instant Push
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    MTN MoMo, Telecel Cash, AT Money
                  </p>
                </div>

                {/* Card / Paystack */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                      <span>Credit / Debit Card</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 text-[10px] font-bold">
                      Paystack
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Visa, Mastercard, GH-Link
                  </p>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all sm:col-span-2 ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Banknote className="w-4 h-4 text-emerald-500" />
                      <span>Cash / MoMo On Delivery</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 text-[10px] font-bold">
                      Accra Only
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Inspect your physical goods before paying the courier.
                  </p>
                </div>
              </div>

              {/* MoMo Input Details */}
              {paymentMethod === 'momo' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-3 text-xs">
                  <div className="flex gap-3">
                    {['mtn', 'telecel', 'at'].map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setMomoProvider(prov as any)}
                        className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] border transition-all ${
                          momoProvider === prov
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {prov === 'mtn' ? 'MTN MoMo' : prov === 'telecel' ? 'Telecel Cash' : 'AT Money'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Wallet Number for Payment Prompt:
                    </label>
                    <input
                      id="input-momo-number"
                      type="tel"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="024 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold tracking-wider"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      You will receive a USSD prompt on this phone to authorize the transaction.
                    </p>
                  </div>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-5 sticky top-24">
              <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order Review ({cart.length} items)
              </h3>

              {/* Items mini preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400">Qty: {item.quantity} {item.variationName && `• ${item.variationName}`}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery ({deliveryMethod === 'express' ? 'Express Next-Day' : 'Standard'})</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Statutory Tax</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-700 text-base font-black text-slate-900 dark:text-white">
                  <span>Final Total</span>
                  <span className="text-2xl text-emerald-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="btn-place-order"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{isSubmitting ? 'Processing Order...' : `Place Order • ${formatPrice(total)}`}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('cart')}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ← Return to Shopping Bag
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Interactive Mobile Money Push Simulator Modal */}
      <AnimatePresence>
        {showMomoPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                <Smartphone className="w-7 h-7 animate-bounce" />
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Authorize MoMo Payment</h3>
                <p className="text-xs text-slate-500 mt-1">
                  A payment prompt of <strong>{formatPrice(total)}</strong> has been sent to <strong>{momoNumber}</strong> ({momoProvider.toUpperCase()}).
                </p>
              </div>

              {momoStep === 'prompt' ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
                    <p>Authorize payment of {formatPrice(total)} to NovaMart GH?</p>
                    <p className="text-[10px] text-slate-500 mt-1">Ref: NM-{Date.now().toString().slice(-6)}</p>
                  </div>

                  <button
                    onClick={() => setMomoStep('pin')}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Simulate Approval on Phone
                  </button>
                </div>
              ) : momoStep === 'pin' ? (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter MoMo 4-digit PIN (Demo):</p>
                  <input
                    type="password"
                    maxLength={4}
                    value={momoPin}
                    onChange={(e) => setMomoPin(e.target.value)}
                    placeholder="••••"
                    className="w-32 mx-auto text-center text-xl font-bold py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 tracking-widest"
                  />

                  <button
                    onClick={() => handleCreateOrder('paid', `MOMO-${Date.now().toString().slice(-8)}`)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Confirm PIN & Finalize Order
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setShowMomoPrompt(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel Transaction
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
