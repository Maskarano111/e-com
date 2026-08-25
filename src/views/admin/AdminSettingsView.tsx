import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Save,
  DollarSign,
  Truck,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsView: React.FC = () => {
  const { settings, updateSettings, formatPrice } = useSettings();
  const { showToast } = useToast();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(settings.standardDeliveryFee);
  const [expressDeliveryFee, setExpressDeliveryFee] = useState(settings.expressDeliveryFee);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(settings.freeDeliveryThreshold);
  const [momoEnabled, setMomoEnabled] = useState(settings.momoEnabled);
  const [cardEnabled, setCardEnabled] = useState(settings.cardEnabled);
  const [codEnabled, setCodEnabled] = useState(settings.codEnabled);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings({
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      currency,
      currencySymbol,
      standardDeliveryFee: Number(standardDeliveryFee),
      expressDeliveryFee: Number(expressDeliveryFee),
      freeDeliveryThreshold: Number(freeDeliveryThreshold),
      momoEnabled,
      cardEnabled,
      codEnabled
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Store Configuration & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business metadata, currency rates, delivery fees, and gateway integrations
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Business Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Business Identity & Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Support Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Phone Hotline</label>
              <input
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Accra Fulfillment Address</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Delivery & Shipping Fees */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Truck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Shipping & Dispatch Pricing (GH₵)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Standard Delivery Fee (GH₵)</label>
              <input
                type="number"
                min={0}
                value={standardDeliveryFee}
                onChange={(e) => setStandardDeliveryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Express Next-Day Fee (GH₵)</label>
              <input
                type="number"
                min={0}
                value={expressDeliveryFee}
                onChange={(e) => setExpressDeliveryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Free Delivery Threshold (GH₵)</label>
              <input
                type="number"
                min={0}
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payment Gateways */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Payment Gateways</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">MTN Mobile Money & Telecel Cash</p>
                  <p className="text-[10px] text-slate-500">Enable USSD instant payment prompt at checkout</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={momoEnabled}
                onChange={(e) => setMomoEnabled(e.target.checked)}
                className="rounded text-emerald-600 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Debit / Credit Card (Paystack Gateway)</p>
                  <p className="text-[10px] text-slate-500">Accept Visa, Mastercard, GH-Link cards</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={cardEnabled}
                onChange={(e) => setCardEnabled(e.target.checked)}
                className="rounded text-emerald-600 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Cash on Delivery (Accra / Tema)</p>
                  <p className="text-[10px] text-slate-500">Allow customers to pay courier upon physical inspection</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="rounded text-emerald-600 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Live Gateway & API Keys Integration */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">API Keys & Live Integrations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Paystack Public Key (GHS / Card / MoMo)
              </label>
              <input
                type="text"
                placeholder="Your Paystack public key"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Leaves in test mode if blank</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Paystack Secret Key
              </label>
              <input
                type="password"
                placeholder="Your Paystack secret key"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                SMS Provider (Arkesel / Hubtel / Twilio)
              </label>
              <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs">
                <option value="arkesel">Arkesel SMS Gateway (Ghana)</option>
                <option value="hubtel">Hubtel SMS Platform</option>
                <option value="twilio">Twilio Global SMS</option>
                <option value="simulated">Simulated Sandbox (Instant Log)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                SMS Sender ID (Max 11 chars)
              </label>
              <input
                type="text"
                defaultValue="NOVAMART"
                maxLength={11}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs uppercase"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Store Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
