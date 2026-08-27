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
  Plus,
  Building2,
  Copy,
  Check,
  Clock,
  QrCode,
  Globe
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { DeliveryAddress, Order, PaymentMethod } from '../types/index';
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

const NIGERIA_STATES = [
  'Lagos',
  'Abuja (FCT)',
  'Rivers',
  'Oyo',
  'Ogun',
  'Kano',
  'Kaduna',
  'Edo',
  'Delta',
  'Enugu',
  'Anambra',
  'Ondo',
  'Akwa Ibom',
  'Imo',
  'Abia',
  'Kwara',
  'Plateau',
  'Cross River'
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate }) => {
  const { cart, subtotal, discount, deliveryFee, tax, total, appliedCoupon, deliveryMethod, clearCart } = useCart();
  const { user, token } = useAuth();
  const { formatPrice, settings, country, setCountry, countryConfig } = useSettings();
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
  const [city, setCity] = useState(country === 'NG' ? 'Ikeja, Lagos' : 'Accra');
  const [region, setRegion] = useState(country === 'NG' ? 'Lagos' : 'Greater Accra');
  const [postalCode, setPostalCode] = useState(country === 'NG' ? '100001' : 'GA-183-9022');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'bank_transfer' | 'ussd' | 'opay' | 'cod'>(
    country === 'NG' ? 'bank_transfer' : 'momo'
  );
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'telecel' | 'at'>('mtn');
  const [momoNumber, setMomoNumber] = useState(user?.phone || '0245550199');

  // Card State
  const [cardNumber, setCardNumber] = useState('5399 4123 5678 9010');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Nigeria Bank Transfer State
  const [virtualAccount, setVirtualAccount] = useState({
    bank: 'Wema Bank (Paystack)',
    accountNumber: '9928410294',
    accountName: 'NovaMart / Paystack Checkout'
  });
  const [hasCopiedAccount, setHasCopiedAccount] = useState(false);
  const [transferTimer, setTransferTimer] = useState(1800); // 30 mins
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Modals & Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMomoPrompt, setShowMomoPrompt] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [showUssdModal, setShowUssdModal] = useState(false);
  const [momoStep, setMomoStep] = useState<'prompt' | 'pin' | 'authorized'>('prompt');
  const [momoPin, setMomoPin] = useState('');

  // Synchronize country defaults
  useEffect(() => {
    if (country === 'NG') {
      setCity('Ikeja, Lagos');
      setRegion('Lagos');
      setPostalCode('100001');
      if (paymentMethod === 'momo') setPaymentMethod('bank_transfer');
    } else {
      setCity('Accra');
      setRegion('Greater Accra');
      setPostalCode('GA-183-9022');
      if (paymentMethod === 'bank_transfer' || paymentMethod === 'ussd' || paymentMethod === 'opay') {
        setPaymentMethod('momo');
      }
    }
  }, [country]);

  // Sync user details if logged in
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

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
      let mappedMethod: PaymentMethod = 'card';
      if (paymentMethod === 'momo') mappedMethod = momoProvider === 'mtn' ? 'mtn_momo' : 'telecel_cash';
      else if (paymentMethod === 'bank_transfer') mappedMethod = 'bank_transfer';
      else if (paymentMethod === 'ussd') mappedMethod = 'ussd';
      else if (paymentMethod === 'opay') mappedMethod = 'opay';
      else if (paymentMethod === 'cod') mappedMethod = 'cash_on_delivery';

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
        deliveryMethod: deliveryMethod || 'standard',
        tax,
        total,
        paymentMethod: mappedMethod,
        paymentStatus: confirmedPaymentStatus === 'paid' ? 'successful' as const : 'pending' as const,
        paymentReference: transactionId || `PAY-${country}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        deliveryAddress: {
          name: `${firstName} ${lastName}`,
          phone,
          email,
          country: country === 'NG' ? 'Nigeria' : 'Ghana',
          region,
          city,
          address: streetAddress,
          deliveryInstructions: deliveryNotes
        }
      };

      const result: any = await api.createOrder(orderPayload);
      const createdOrder = result.order || result;

      // Send SMS confirmation notification
      api.sendOrderSMS({
        phone,
        message: `Your NovaMart order #${createdOrder.orderNumber} for ${formatPrice(total)} has been received and confirmed. Track at ${window.location.origin}/#track-${createdOrder.orderNumber}`,
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
      setShowBankTransferModal(false);
      setShowUssdModal(false);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (country === 'GH' && paymentMethod === 'momo') {
      setShowMomoPrompt(true);
      setMomoStep('prompt');
    } else if (country === 'NG' && paymentMethod === 'bank_transfer') {
      setShowBankTransferModal(true);
    } else if (country === 'NG' && (paymentMethod === 'ussd' || paymentMethod === 'opay')) {
      setShowUssdModal(true);
    } else if (paymentMethod === 'card') {
      handleCreateOrder('paid', `PSTK-${country}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
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
      {/* Header & Market Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Secure Checkout
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {countryConfig.flag} {countryConfig.name} Market
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Complete your delivery address and localized payment</p>
        </div>

        {/* Market Switcher Tab */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCountry('GH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                country === 'GH'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>🇬🇭</span>
              <span>Ghana</span>
            </button>
            <button
              type="button"
              onClick={() => setCountry('NG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                country === 'NG'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>🇳🇬</span>
              <span>Nigeria</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder}>
        {/* Mobile-Only Collapsible Order Summary Bar */}
        <div className="lg:hidden mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{showMobileSummary ? 'Hide Order Summary' : 'Show Order Summary'} ({cart.length} items)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-black">{formatPrice(total)}</span>
              <span className="text-slate-400">{showMobileSummary ? '▲' : '▼'}</span>
            </div>
          </button>

          {showMobileSummary && (
            <div className="p-4 space-y-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="max-h-48 overflow-y-auto space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2">
                    <span className="truncate flex-1 text-slate-700 dark:text-slate-300">
                      {item.name} <strong className="text-slate-500 font-normal">x{item.quantity}</strong>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({countryConfig.name}):</span>
                  <span className="font-bold">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

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
                  <span>Already have an account? Sign in for saved addresses.</span>
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
                    id="input-checkout-firstname"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Abena / Chinedu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input
                    id="input-checkout-lastname"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Mensah / Okafor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number ({countryConfig.phoneCode}) *
                  </label>
                  <div className="relative">
                    <input
                      id="input-checkout-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={country === 'NG' ? '0802 555 0199' : '024 555 0199'}
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      {countryConfig.flag}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping & Delivery Address */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Delivery Address ({countryConfig.name})
                  </h2>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {countryConfig.hubName}
                </span>
              </div>

              {/* Saved addresses selector if user has saved addresses */}
              {userAddresses.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Choose Saved Address:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {userAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <p className="font-bold">{addr.name}</p>
                        <p className="text-slate-500 text-[11px] truncate">{addr.address}, {addr.city}</p>
                      </div>
                    ))}
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
                    placeholder={
                      country === 'NG'
                        ? 'e.g. 14 Admiralty Way, Lekki Phase 1 / Allen Avenue, Ikeja'
                        : 'e.g. House 42, 14th Close, Airport Residential Area'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                      placeholder={country === 'NG' ? 'e.g. Ikeja, Lagos' : 'e.g. Accra'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {country === 'NG' ? 'State *' : 'Region *'}
                    </label>
                    <select
                      id="select-checkout-region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {(country === 'NG' ? NIGERIA_STATES : GHANA_REGIONS).map((r) => (
                        <option key={r} value={r}>
                          {r} {country === 'NG' ? 'State' : 'Region'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {country === 'NG' ? 'Postal / Area Code' : 'GhanaPost GPS (Optional)'}
                    </label>
                    <input
                      id="input-checkout-gps"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder={country === 'NG' ? 'e.g. 100001' : 'e.g. GA-183-9022'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
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
                    placeholder="e.g. Call before arrival; leave with estate gate security"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Payment Method ({countryConfig.flag} {countryConfig.name})
                </h2>
              </div>

              {/* GHANA PAYMENT METHODS */}
              {country === 'GH' && (
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
                        Accra & Kumasi
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      Pay conveniently upon inspection at your doorstep
                    </p>
                  </div>
                </div>
              )}

              {/* NIGERIA PAYMENT METHODS */}
              {country === 'NG' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Pay with Bank Transfer (NIP Virtual Account) */}
                  <div
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        <span>Pay with Bank Transfer</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 text-[10px] font-bold">
                        ★ Popular (#1 in Nigeria)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      Instant Virtual NIP Account (Wema / Providus Bank)
                    </p>
                  </div>

                  {/* Naira Card (Verve / Visa / Mastercard) */}
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
                        <span>Naira Debit Card</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 text-[10px] font-bold">
                        Verve / Visa
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      Verve, Mastercard, Visa via Paystack
                    </p>
                  </div>

                  {/* USSD / OPay / PalmPay */}
                  <div
                    onClick={() => setPaymentMethod('ussd')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'ussd'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Smartphone className="w-4 h-4 text-purple-500" />
                        <span>USSD & OPay / PalmPay</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 text-[10px] font-bold">
                        *737# / Wallet
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      GTBank, Zenith, Access, Moniepoint & Wallets
                    </p>
                  </div>

                  {/* Cash on Delivery (Lagos & Abuja) */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Banknote className="w-4 h-4 text-emerald-500" />
                        <span>Pay On Delivery</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 text-[10px] font-bold">
                        Lagos & Abuja
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      Card / Transfer upon arrival at your doorstep
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary & Pay Button (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5 sticky top-24">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order Summary ({cart.length} items)
              </h2>

              {/* Items preview */}
              <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-slate-400 text-[11px]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
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
                  <span>Delivery ({countryConfig.name})</span>
                  <span className="font-bold">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Grand Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="btn-place-order"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing Secure Payment...</span>
                ) : (
                  <>
                    <span>Confirm & Pay {formatPrice(total)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by NovaMart 7-Day Buyer Guarantee</span>
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* ------------------------------------------------------------------ */}
      {/* 1. NIGERIA BANK TRANSFER MODAL (VIRTUAL NIP ACCOUNT) */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showBankTransferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Paystack NIP Instant Transfer
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                  Transfer {formatPrice(total)}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Send exact amount to this dedicated virtual account from your bank app (OPay, Kuda, GTBank, Zenith, Access, etc.).
                </p>
              </div>

              {/* Account Details Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Bank Name</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{virtualAccount.bank}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Number</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                      {virtualAccount.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(virtualAccount.accountNumber);
                        setHasCopiedAccount(true);
                        setTimeout(() => setHasCopiedAccount(false), 2000);
                        showToast('info', 'Copied!', 'Account number copied to clipboard.');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {hasCopiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopiedAccount ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Name</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    NovaMart / {firstName} {lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Account expires in <strong>29:45 mins</strong></span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleCreateOrder('paid', `NIP-NG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Sent The Money (Verify)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBankTransferModal(false)}
                  className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                >
                  Cancel & Choose Another Method
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* 2. GHANA MOMO PUSH APPROVAL MODAL */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showMomoPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
                <Smartphone className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Mobile Money USSD Prompt Sent
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  A payment authorization prompt for <strong>{formatPrice(total)}</strong> was sent to <strong>{momoNumber || phone}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 text-left space-y-2">
                <p className="font-bold">Instructions to Authorize:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  <li>Check your phone screen for the MTN/Telecel USSD approval prompt.</li>
                  <li>Enter your MoMo PIN and press 1 to confirm payment.</li>
                  <li>Click the button below once approved.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleCreateOrder('paid', `MOMO-GH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Approved on My Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMomoPrompt(false)}
                  className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* 3. NIGERIA USSD / OPAY WALLET MODAL */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showUssdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center">
                <Smartphone className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Pay via USSD & OPay Wallet
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Dial your bank's USSD code or pay with OPay/PalmPay wallet for {formatPrice(total)}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span>GTBank:</span> <strong>*737*50*Amount*001#</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Zenith Bank:</span> <strong>*966*60#</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Access Bank:</span> <strong>*901*000#</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>OPay / PalmPay:</span> <strong>Open App → Scan QR</strong>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleCreateOrder('paid', `USSD-NG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Completed Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUssdModal(false)}
                  className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
