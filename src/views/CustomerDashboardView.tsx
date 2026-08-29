import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Bell,
  User,
  KeyRound,
  LogOut,
  ChevronRight,
  Truck,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Sparkles,
  Award,
  Crown,
  Gift,
  Flame,
  ShieldCheck,
  Compass,
  ShoppingBag,
  RotateCcw,
  Star,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { Order, DeliveryAddress, NotificationItem, Product } from '../types/index';
import { api } from '../services/api';

interface CustomerDashboardViewProps {
  initialTab?: string;
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView: (product: any) => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  initialTab = 'overview',
  onNavigate,
  onOpenQuickView
}) => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Add Address Modal
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addrName, setAddrName] = useState('Home Residence');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrCity, setAddrCity] = useState('Accra');
  const [addrRegion, setAddrRegion] = useState('Greater Accra');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');

      // Load user data
      api.getOrders({ userId: user.id })
        .then((res) => setOrders(Array.isArray(res) ? res : []))
        .catch(console.error);
      api.getAddresses(user.id)
        .then((res) => setAddresses(Array.isArray(res) ? res : []))
        .catch(console.error);
      api.getNotifications({ userId: user.id })
        .then((res) => setNotifications(Array.isArray(res) ? res : []))
        .catch(console.error);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">VIP Membership Portal</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please sign in to access your NovaMart rewards, active dispatch trackers, and order history.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Calculate VIP Tier metrics
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const tier = totalSpent >= 10000 ? 'Diamond Privé' : totalSpent >= 4000 ? 'Platinum Member' : 'Gold Member';
  const tierProgress = Math.min(100, Math.round((totalSpent / 10000) * 100));
  const points = Math.round(totalSpent * 0.2);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    await updateProfile({ firstName, lastName, phone });
    setIsUpdatingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'Mismatch', 'New passwords do not match.');
      return;
    }
    setIsChangingPass(true);
    const success = await changePassword(currentPassword, newPassword);
    setIsChangingPass(false);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.createAddress({
        userId: user.id,
        name: addrName,
        phone: addrPhone,
        address: addrAddress,
        city: addrCity,
        region: addrRegion,
        country: 'Ghana',
        isDefault: addresses.length === 0
      });
      const saved = res.address || res;
      setAddresses((prev) => [...prev, saved]);
      setIsAddAddressOpen(false);
      setAddrAddress('');
      showToast('success', 'Address Saved', 'Your delivery location has been registered.');
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    try {
      await api.deleteAddress(addrId);
      setAddresses((prev) => prev.filter((a) => a.id !== addrId));
      showToast('info', 'Address Removed', 'Location was deleted from your address book.');
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    }
  };

  const activeOrder = orders.find((o) => (o.orderStatus || (o as any).status || '') !== 'Delivered' && (o.orderStatus || (o as any).status || '') !== 'Cancelled') || orders[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* 1. LUXURY CUSTOMER PRIVÉ HEADER & VIP STATUS */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-700 shadow-xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
                alt={user.firstName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/40 ring-4 ring-emerald-500/10 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px] ring-2 ring-slate-900">
                ★
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  <Crown className="w-3 h-3 text-amber-400" />
                  {tier}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{user.email} • {user.phone || '+233 24 555 0199'}</p>
              <div className="flex items-center gap-3 text-[11px] text-emerald-400 font-bold mt-2">
                <span>{points} Privé Reward Points</span>
                <span>•</span>
                <span>Ghana Priority Concierge Active</span>
              </div>
            </div>
          </div>

          {/* Right VIP Perks Pill */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl md:max-w-xs w-full space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">VIP Tier Spend</span>
              <span className="font-black text-emerald-400">{formatPrice(totalSpent)} / GH₵ 10k</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${tierProgress}%` }}
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {totalSpent >= 10000
                ? '★ Maximum Diamond Privé perks unlocked'
                : `Spend ${formatPrice(10000 - totalSpent)} more to unlock Diamond Privé privileges.`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN PORTAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Nav Tabs (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
              { id: 'wishlist', label: 'Saved Items', icon: Heart, count: wishlist.length },
              { id: 'loyalty', label: 'Loyalty Points', icon: Award, count: points },
              { id: 'addresses', label: 'Delivery Locations', icon: MapPin, count: addresses.length },
              { id: 'notifications', label: 'Alerts', icon: Bell, count: notifications.filter((n) => !n.read).length },
              { id: 'profile', label: 'Profile & Account Info', icon: User },
              { id: 'security', label: 'Security & Access', icon: KeyRound }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`customer-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Pane (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 3 Metric Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{orders.length}</h4>
                  <p className="text-xs text-slate-500">Superstore Orders Placed</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{wishlist.length}</h4>
                  <p className="text-xs text-slate-500">Saved in Wishlist</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Gift className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{points} pts</h4>
                  <p className="text-xs text-slate-500">NovaMart VIP Reward Points</p>
                </div>
              </div>

              {/* VIP Membership & Buyer Perks Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-7 shadow-lg text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-black text-base tracking-tight">NovaMart VIP Shopper Tier</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                    Gold Member
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Enjoy free express shipping on orders over GH₵ 500, early access to Flash Sales, and 1% cashback reward points on all electronics, appliances & fashion purchases.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {['Free Express Delivery', 'Flash Sale Priority', 'VIP Support Concierge', 'Cashback Points', 'Extended 14-Day Returns'].map((perk) => (
                    <span
                      key={perk}
                      className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-slate-200 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {perk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Order Live Step-by-Step Delivery Tracker */}
              {activeOrder && (
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">Active Dispatch Tracker</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          #{activeOrder.orderNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Destination: {activeOrder.deliveryAddress?.city || 'Airport Residential, Accra'}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('track-order', { orderNumber: activeOrder.orderNumber })}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold transition-all self-start sm:self-auto flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Rider Map</span>
                    </button>
                  </div>

                  {/* 5 Step Visual Progress Bar */}
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                      {[
                        { label: 'Confirmed', desc: 'Payment Verified', active: true },
                        { label: 'Inspected', desc: 'Quality Check', active: true },
                        { label: 'Secure Packed', desc: 'Transit Boxed', active: true },
                        { label: 'Out for Delivery', desc: 'With Courier', active: true, pulse: true },
                        { label: 'Delivered', desc: 'Handed to You', active: false }
                      ].map((step, i) => (
                        <div key={step.label} className="space-y-1.5 flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                              step.active
                                ? step.pulse
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 animate-pulse'
                                  : 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {step.active && !step.pulse ? <Check className="w-3.5 h-3.5" /> : i + 1}
                          </div>
                          <p className={`font-black ${step.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                          <p className="text-[9px] text-slate-400 hidden sm:block">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Orders Overview Table */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Recent Purchases</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    All Orders ({orders.length}) →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No previous orders found.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:white">#{o.orderNumber}</p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(o.createdAt).toLocaleDateString('en-GB')} • {o.items?.length || 1} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 dark:text-white">{formatPrice(o.total)}</p>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {String(o.orderStatus || (o as any).status || 'Confirmed').replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Order History & Receipts ({orders.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Authenticity receipts, live tracking, and easy 1-click reorders</p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">You haven't placed any orders yet.</p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                  >
                    Explore Superstore Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <span className="font-black text-slate-900 dark:text-white text-sm">#{o.orderNumber}</span>
                          <span className="text-slate-400 ml-2">
                            {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {String(o.orderStatus || (o as any).status || 'Confirmed').replace('_', ' ')}
                          </span>
                          <span className="font-black text-slate-900 dark:text-white ml-2 text-sm">
                            {formatPrice(o.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items Thumbnails */}
                      <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {o.items?.map((it) => (
                          <div key={it.id} className="flex items-center gap-2.5 shrink-0 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <img src={it.productImage} alt={it.productName} className="w-11 h-11 rounded-lg object-cover" />
                            <div className="text-[11px] pr-2">
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{it.productName}</p>
                              <p className="text-slate-400">Qty: {it.quantity} • {formatPrice(it.unitPrice)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button
                          onClick={() => setSelectedOrderDetails(o)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                        >
                          View Receipt
                        </button>
                        {(String(o.orderStatus || (o as any).status || '') === 'Delivered') && (
                          <button
                            onClick={async () => {
                              const reason = prompt('Please describe the reason for return:');
                              if (!reason) return;
                              try {
                                await api.createReturnRequest(o.id, { reason, refundPreference: 'original_method' });
                                showToast('Return request submitted! We will review it within 24 hours.', 'success');
                              } catch {
                                showToast('Failed to submit return request', 'error');
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-bold flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Return
                          </button>
                        )}
                        <button
                          onClick={() => onNavigate('track-order', { orderNumber: o.orderNumber })}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Rider</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: LOYALTY POINTS */}
          {activeTab === 'loyalty' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-base text-slate-900 dark:text-white">Loyalty Rewards</h3>
                <p className="text-xs text-slate-400 mt-0.5">Earn points on every purchase and redeem for discounts</p>
              </div>

              {/* Points Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-6 text-white">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-100 mb-1">Available Points</p>
                    <p className="text-5xl font-black">{points.toLocaleString()}</p>
                    <p className="text-xs text-emerald-200 mt-2">≈ {formatPrice(points / 10)} in discount value</p>
                  </div>
                  <div className="text-right">
                    <Award className="w-16 h-16 text-white/30" />
                    <p className="text-[10px] text-emerald-200 mt-2 font-bold uppercase tracking-wider">{tier}</p>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: ShoppingBag, title: 'Earn Points', desc: 'Get 2 points for every ₵1 spent on orders', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600' },
                  { icon: Gift, title: 'Redeem Rewards', desc: 'Redeem 100 points = ₵10 off on any order', color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' },
                  { icon: Crown, title: 'Tier Upgrades', desc: 'Unlock better rates as you reach higher tiers', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600' },
                ].map(item => (
                  <div key={item.title} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Points history placeholder */}
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3">Points History</h4>
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Order #{o.orderNumber}</p>
                        <p className="text-slate-400">{new Date(o.createdAt).toLocaleDateString('en-GB')}</p>
                      </div>
                      <span className="font-black text-emerald-600">+{Math.round((o.total || 0) * 0.2)} pts</span>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">Place orders to start earning loyalty points!</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                My Saved Wishlist ({wishlist.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Quickly move your favorite products to your shopping bag</p>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Heart className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">Your wishlist is currently empty.</p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                  >
                    Explore Superstore Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex gap-3.5 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <img
                        src={product.featuredImage}
                        alt={product.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase text-emerald-600">{product.brand}</p>
                          <h4
                            onClick={() => onNavigate('product-detail', { productId: product.id })}
                            className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-600 transition-colors"
                          >
                            {product.name}
                          </h4>
                          <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                            {formatPrice(product.discountPrice || product.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => addToCart(product, undefined, 1)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 shadow-xs"
                          >
                            Add to Bag
                          </button>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Delivery Addresses in Ghana ({addresses.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Saved destinations for 1-click expedited dispatch</p>
                </div>
                <button
                  onClick={() => setIsAddAddressOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-500 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Location</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs relative bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                          Default Address
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">{addr.address}</p>
                    <p className="text-slate-500">{addr.city}, {addr.region} Region, Ghana</p>
                    <p className="text-slate-500">Contact: {addr.phone}</p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-rose-600 hover:underline text-[11px] font-bold"
                      >
                        Remove Location
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                VIP Concierge & Dispatch Notifications ({notifications.length})
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No new notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-3.5 flex items-start gap-3 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-black text-slate-900 dark:text-white">{n.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  VIP Profile & Contact Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage your shipping and communication credentials</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs max-w-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghana Phone Number (Mobile Money & Dispatch)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Security & Access Credentials
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Protect your account and update your password</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-lg">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  {isChangingPass ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {isAddAddressOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setIsAddAddressOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-base text-slate-900 dark:text-white">Add Delivery Location</h3>
                <button onClick={() => setIsAddAddressOpen(false)} className="text-slate-400 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location Label (e.g. Home, Office, Cantonments Hub)</label>
                  <input
                    type="text"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Street Address & Landmark</label>
                  <input
                    type="text"
                    required
                    value={addrAddress}
                    onChange={(e) => setAddrAddress(e.target.value)}
                    placeholder="e.g. 14 Senchi St, Airport Residential"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Region</label>
                    <input
                      type="text"
                      required
                      value={addrRegion}
                      onChange={(e) => setAddrRegion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setSelectedOrderDetails(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Order Receipt #{selectedOrderDetails.orderNumber}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {new Date(selectedOrderDetails.createdAt).toLocaleString('en-GB')}
                  </p>
                </div>
                <button onClick={() => setSelectedOrderDetails(null)} className="text-slate-400 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {selectedOrderDetails.items?.map((it) => (
                  <div key={it.id} className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={it.productImage} alt={it.productName} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{it.productName}</p>
                        <p className="text-slate-400">Qty: {it.quantity} • {formatPrice(it.unitPrice)}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">{formatPrice(it.unitPrice * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrderDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ghana Express Delivery</span>
                  <span>{formatPrice(selectedOrderDetails.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-1">
                  <span>Grand Total</span>
                  <span className="text-emerald-600">{formatPrice(selectedOrderDetails.total)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const num = selectedOrderDetails.orderNumber;
                    setSelectedOrderDetails(null);
                    onNavigate('track-order', { orderNumber: num });
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Live Dispatch Rider Tracking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

