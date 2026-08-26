import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Store,
  Save,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { api } from '../../services/api';
import { Vendor } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const VendorProfileView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const vendorId = user?.vendorId || 'vend-kofi';

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Electronics & Phones');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [banner, setBanner] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'mtn_momo' | 'telecel_cash' | 'airteltigo' | 'bank_transfer'>('mtn_momo');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      setIsLoading(true);
      try {
        const v = await api.getVendorById(vendorId);
        if (v) {
          setVendor(v);
          setStoreName(v.storeName);
          setOwnerName(v.ownerName);
          setEmail(v.email);
          setPhone(v.phone);
          setCategory(v.category);
          setDescription(v.description);
          setLogo(v.logo);
          setBanner(v.banner || '');
          setAddress(v.address);
          setCity(v.city);
          if (v.payoutDetails) {
            setPayoutMethod(v.payoutDetails.method);
            setAccountName(v.payoutDetails.accountName);
            setAccountNumber(v.payoutDetails.accountNumber);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendor();
  }, [vendorId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateVendor(vendorId, {
        storeName,
        ownerName,
        email,
        phone,
        category,
        description,
        logo,
        banner,
        address,
        city,
        payoutDetails: {
          method: payoutMethod,
          accountName,
          accountNumber
        }
      });
      showToast('success', 'Profile Saved', 'Your store profile and payout coordinates have been updated.');
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Storefront Settings &amp; Branding
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize your store identity, logos, banner visuals, and payout destination.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        {/* Banner Preview & URL */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Storefront Banner Visuals</h2>

          <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            {banner ? (
              <img src={banner} alt="Store Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                No Banner Image Provided
              </div>
            )}
            {/* Overlay Logo */}
            <div className="absolute bottom-3 left-4 flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20">
              <img
                src={logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                alt="Logo"
                className="w-12 h-12 rounded-xl object-cover border border-white/40"
              />
              <div className="text-white pr-2">
                <p className="font-black text-sm">{storeName || 'My Store'}</p>
                <p className="text-[10px] text-amber-300 font-bold">{category}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Store Logo URL (Square 1:1)
              </label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Store Banner URL (Wide 16:9)
              </label>
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Business Credentials */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Store Identity &amp; Bio</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Owner / Manager Name *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Store Biography &amp; Guarantee
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers about your products, warranty policies, and location..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Store Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Physical Shop Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Payout Coordinates */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Default Payout Destination</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Payout Method
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
              >
                <option value="mtn_momo">MTN Mobile Money</option>
                <option value="telecel_cash">Telecel Cash</option>
                <option value="airteltigo">AT Money</option>
                <option value="bank_transfer">Ghana Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Account / MoMo Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Subscriber Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Account / MoMo Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="024XXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
