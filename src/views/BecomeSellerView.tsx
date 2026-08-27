import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  CheckCircle2,
  ShieldCheck,
  Zap,
  DollarSign,
  Truck,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  Lock,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface BecomeSellerViewProps {
  onNavigate: (view: string, param?: any) => void;
}

export const BecomeSellerView: React.FC<BecomeSellerViewProps> = ({ onNavigate }) => {
  const { switchDemoRole } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Electronics & Phones');
  const [sellerCountry, setSellerCountry] = useState<'Ghana' | 'Nigeria'>('Ghana');
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+233 ');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Accra');
  const [description, setDescription] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'mtn_momo' | 'telecel_cash' | 'airteltigo' | 'bank_transfer'>('mtn_momo');
  const [bankName, setBankName] = useState('Access Bank / GTBank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !email.trim() || !ownerFirstName.trim() || !password.trim()) {
      showToast('error', 'Missing Fields', 'Please complete all required registration fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createVendor({
        storeName,
        ownerFirstName,
        ownerLastName,
        email,
        phone,
        password,
        category,
        description: description || `Official seller store of ${storeName} on NovaMart.`,
        country: sellerCountry,
        countryCode: sellerCountry === 'Nigeria' ? 'NG' : 'GH',
        address: address || (sellerCountry === 'Nigeria' ? 'Lagos, Nigeria' : 'Accra, Ghana'),
        city: city || (sellerCountry === 'Nigeria' ? 'Lagos' : 'Accra'),
        commissionRate: 10,
        payoutDetails: {
          method: payoutMethod,
          bankName: sellerCountry === 'Nigeria' ? bankName : undefined,
          accountName: accountName || `${ownerFirstName} ${ownerLastName}`,
          accountNumber: accountNumber || phone
        }
      });

      setIsSuccess(true);
      showToast('success', 'Merchant Account Created!', `Welcome to NovaMart Seller Hub, ${ownerFirstName}!`);

      // Auto login as the new vendor
      setTimeout(async () => {
        await switchDemoRole('vendor');
        onNavigate('vendor');
      }, 1800);
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Could not register seller account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Congratulations, {storeName}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your merchant storefront is activated. Redirecting you into your dedicated Seller Dashboard...
          </p>
        </div>
        <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Store className="w-3.5 h-3.5" />
          <span>NovaMart Multi-Vendor Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Start Selling Your Products on <span className="text-emerald-600">NovaMart</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Open your verified digital store, upload your inventory, receive orders from buyers nationwide across Ghana, and enjoy direct Mobile Money wallet payouts.
        </p>
      </div>

      {/* 4 Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Zero Upfront Setup Fees</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Free store registration. You only pay a small commission percentage when an order is completed.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Instant MoMo Withdrawals</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Disburse earnings straight to your MTN Mobile Money, Telecel Cash, or Ghana Commercial Bank account.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dispatch &amp; Delivery Network</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Seamless order management with dispatch rider tracking across Accra, Tema, Kumasi, and nationwide.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dedicated Seller Portal</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Complete dashboard to upload products, track real-time stock levels, view reviews, and manage financials.
          </p>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-3xl mx-auto space-y-8">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-6 text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Register Your Merchant Storefront
          </h2>
          <p className="text-xs text-slate-500">
            Fill in your store details below to begin uploading your catalog products.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Store Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>1. Store Identity &amp; Location</span>
            </h3>

            {/* Country Selector */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Merchant Country of Operation *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSellerCountry('Ghana');
                    setCity('Accra');
                    setPhone('+233 ');
                    setPayoutMethod('mtn_momo');
                  }}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    sellerCountry === 'Ghana'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">🇬🇭</span>
                  <div>
                    <p className="text-xs">Ghana Merchant</p>
                    <p className="text-[10px] opacity-70">Accra / Kumasi Warehouses</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSellerCountry('Nigeria');
                    setCity('Lagos');
                    setPhone('+234 ');
                    setPayoutMethod('bank_transfer');
                  }}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    sellerCountry === 'Nigeria'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">🇳🇬</span>
                  <div>
                    <p className="text-xs">Nigeria Merchant</p>
                    <p className="text-[10px] opacity-70">Lagos / Abuja Depots</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={sellerCountry === 'Nigeria' ? 'e.g. Lagos Gadget Den' : 'e.g. Kwame Tech Hub'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Primary Store Department *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                >
                  <option value="Electronics & Phones">Electronics &amp; Phones</option>
                  <option value="Beauty & Perfumes">Beauty &amp; Perfumes</option>
                  <option value="Fashion & Shoes">Fashion &amp; Shoes</option>
                  <option value="Home & Kitchen">Home &amp; Kitchen</option>
                  <option value="Health & Fitness">Health &amp; Fitness</option>
                  <option value="Computers & Gaming">Computers &amp; Gaming</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Warehouse City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={sellerCountry === 'Nigeria' ? 'e.g. Ikeja, Lagos / Abuja' : 'e.g. Accra / Kumasi'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Physical Store / Warehouse Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={sellerCountry === 'Nigeria' ? 'e.g. 14 Allen Avenue, Ikeja, Lagos' : 'e.g. Ring Road Central, Accra'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Store Description &amp; Warranty Policy
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the genuine items you sell..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Owner & Login Credentials */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Owner Profile &amp; Login Security</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Owner First Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerFirstName}
                  onChange={(e) => setOwnerFirstName(e.target.value)}
                  placeholder="e.g. Kwame"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Owner Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerLastName}
                  onChange={(e) => setOwnerLastName(e.target.value)}
                  placeholder="e.g. Mensah"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Email (Login ID) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Phone (WhatsApp) *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payout Coordinates */}
          {/* Section 3: Payout Coordinates */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>
                3. {sellerCountry === 'Nigeria' ? 'Nigerian Bank Payout Account (₦)' : 'Ghana Mobile Money Payout Account (GH₵)'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Payout Channel
                </label>
                {sellerCountry === 'Nigeria' ? (
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="bank_transfer">Direct NIP Bank Transfer</option>
                    <option value="bank_transfer">OPay Merchant Wallet</option>
                    <option value="bank_transfer">PalmPay Business Account</option>
                  </select>
                ) : (
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="mtn_momo">MTN Mobile Money</option>
                    <option value="telecel_cash">Telecel Cash</option>
                    <option value="airteltigo">AT Money</option>
                    <option value="bank_transfer">Ghana Commercial Bank</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Account / Beneficiary Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Official Account Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {sellerCountry === 'Nigeria' ? 'NUBAN Account Number' : 'MoMo / Account Number'}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={sellerCountry === 'Nigeria' ? '0123456789 (10-digits)' : '024XXXXXXX'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-500">
              By registering, you agree to NovaMart's Merchant Terms of Service &amp; 10% platform commission policy.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>{isSubmitting ? 'Activating Store...' : 'Launch My Store'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
