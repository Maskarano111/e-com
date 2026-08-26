import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Percent,
  DollarSign,
  Package,
  Star,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { Vendor } from '../../types/index';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

interface AdminVendorsViewProps {
  onNavigateToVendorPortal?: (vendorId: string) => void;
}

export const AdminVendorsView: React.FC<AdminVendorsViewProps> = () => {
  const { formatPrice } = useSettings();
  const { showToast } = useToast();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('seller123');
  const [category, setCategory] = useState('Electronics & Phones');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Accra');
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [payoutMethod, setPayoutMethod] = useState<'mtn_momo' | 'telecel_cash' | 'airteltigo' | 'bank_transfer'>('mtn_momo');
  const [payoutAccountName, setPayoutAccountName] = useState('');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState('');
  const [payoutBankName, setPayoutBankName] = useState('');

  const loadVendors = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVendors();
      setVendors(res);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setStoreName('');
    setOwnerFirstName('');
    setOwnerLastName('');
    setEmail('');
    setPhone('+233 ');
    setPassword('seller123');
    setCategory('Electronics & Phones');
    setDescription('');
    setAddress('Osu, Accra');
    setCity('Accra');
    setCommissionRate(10);
    setPayoutMethod('mtn_momo');
    setPayoutAccountName('');
    setPayoutAccountNumber('');
    setPayoutBankName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setStoreName(v.storeName);
    const names = v.ownerName.split(' ');
    setOwnerFirstName(names[0] || '');
    setOwnerLastName(names.slice(1).join(' ') || '');
    setEmail(v.email);
    setPhone(v.phone);
    setCategory(v.category);
    setDescription(v.description);
    setAddress(v.address);
    setCity(v.city);
    setCommissionRate(v.commissionRate);
    setPayoutMethod(v.payoutDetails?.method || 'mtn_momo');
    setPayoutAccountName(v.payoutDetails?.accountName || '');
    setPayoutAccountNumber(v.payoutDetails?.accountNumber || '');
    setPayoutBankName(v.payoutDetails?.bankName || '');
    setIsModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !email.trim() || !ownerFirstName.trim()) {
      showToast('error', 'Missing Information', 'Please complete the required vendor fields.');
      return;
    }

    try {
      if (editingVendor) {
        await api.updateVendor(editingVendor.id, {
          storeName,
          ownerName: `${ownerFirstName} ${ownerLastName}`.trim(),
          email,
          phone,
          category,
          description,
          address,
          city,
          commissionRate,
          payoutDetails: {
            method: payoutMethod,
            accountName: payoutAccountName || `${ownerFirstName} ${ownerLastName}`,
            accountNumber: payoutAccountNumber || phone,
            bankName: payoutBankName
          }
        });
        showToast('success', 'Vendor Updated', `${storeName} profile has been updated.`);
      } else {
        await api.createVendor({
          storeName,
          ownerFirstName,
          ownerLastName,
          email,
          phone,
          password,
          category,
          description,
          address,
          city,
          commissionRate,
          payoutDetails: {
            method: payoutMethod,
            accountName: payoutAccountName || `${ownerFirstName} ${ownerLastName}`,
            accountNumber: payoutAccountNumber || phone,
            bankName: payoutBankName
          }
        });
        showToast('success', 'Vendor Account Created', `${storeName} account created with login credentials.`);
      }

      setIsModalOpen(false);
      loadVendors();
    } catch (err: any) {
      showToast('error', 'Operation Failed', err.message || 'Could not save vendor.');
    }
  };

  const handleToggleStatus = async (vendor: Vendor) => {
    const nextStatus = vendor.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateVendor(vendor.id, { status: nextStatus });
      showToast('info', 'Status Changed', `${vendor.storeName} is now ${nextStatus}.`);
      loadVendors();
    } catch {
      showToast('error', 'Error', 'Failed to update vendor status.');
    }
  };

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to delete ${vendor.storeName}?`)) return;
    try {
      await api.deleteVendor(vendor.id);
      showToast('info', 'Vendor Removed', `${vendor.storeName} has been deleted.`);
      loadVendors();
    } catch {
      showToast('error', 'Error', 'Failed to remove vendor.');
    }
  };

  // Filtered list
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSalesAll = vendors.reduce((sum, v) => sum + (v.totalRevenue || 0), 0);
  const totalCommissionAll = vendors.reduce(
    (sum, v) => sum + ((v.totalRevenue || 0) * (v.commissionRate || 10)) / 100,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Vendors &amp; Merchants Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-seller storefront accounts, set custom commission rates, and track store performance.
          </p>
        </div>

        <button
          id="btn-admin-add-vendor"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Vendor Account</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Merchants</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{vendors.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Active Stores</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {vendors.filter((v) => v.status === 'active').length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Vendor GMV Sales</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(totalSalesAll)}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Platform Commission</p>
            <p className="text-2xl font-black text-emerald-600">{formatPrice(totalCommissionAll)}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by store name, owner, email, or category..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Vendor / Store</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Total Revenue</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading vendors directory...
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No vendors found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Store info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={vendor.logo}
                          alt={vendor.storeName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{vendor.storeName}</span>
                            <span className="flex items-center gap-0.5 text-amber-500 text-[11px]">
                              <Star className="w-3 h-3 fill-current" />
                              {vendor.rating.toFixed(1)}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500">Owner: {vendor.ownerName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{vendor.email}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{vendor.phone}</span>
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                        {vendor.category}
                      </span>
                    </td>

                    {/* Commission */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {vendor.commissionRate}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">platform fee</span>
                    </td>

                    {/* Products */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {vendor.totalProducts || 0} items
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3.5 px-4">
                      <p className="font-black text-slate-900 dark:text-white">
                        {formatPrice(vendor.totalRevenue || 0)}
                      </p>
                      <p className="text-[10px] text-slate-500">{vendor.totalSales || 0} orders</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          vendor.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {vendor.status === 'active' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{vendor.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(vendor)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            vendor.status === 'active'
                              ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
                          }`}
                          title={vendor.status === 'active' ? 'Suspend Store' : 'Activate Store'}
                        >
                          {vendor.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleOpenEdit(vendor)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors border border-slate-200 dark:border-slate-700"
                          title="Edit Vendor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-slate-200 dark:border-slate-700"
                          title="Delete Vendor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Vendor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {editingVendor ? 'Edit Vendor Account' : 'Create New Vendor Account'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingVendor
                      ? 'Update store commission rate, status, and contact profile'
                      : 'Set up credentials, category, and payout method for the new seller'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
                {/* Store Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Store / Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Accra Tech Hub"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Primary Store Category *
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

                {/* Owner Name */}
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
                      placeholder="e.g. Kofi"
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

                {/* Contact Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Vendor Email (Login) *
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
                      Commission Rate (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      required
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      placeholder="10"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                {!editingVendor && (
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Initial Seller Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="seller123"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Store Address / Landmark
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Shop 4B, Osu Oxford Street"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
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
                      placeholder="e.g. Accra"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Payout Details Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Vendor Payout Account (Disbursements)</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Payout Method
                      </label>
                      <select
                        value={payoutMethod}
                        onChange={(e) => setPayoutMethod(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
                      >
                        <option value="mtn_momo">MTN Mobile Money</option>
                        <option value="telecel_cash">Telecel Cash</option>
                        <option value="airteltigo">AT Money</option>
                        <option value="bank_transfer">Ghana Bank Transfer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Account / MoMo Name
                      </label>
                      <input
                        type="text"
                        value={payoutAccountName}
                        onChange={(e) => setPayoutAccountName(e.target.value)}
                        placeholder="Registered Name"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Account / MoMo Number
                      </label>
                      <input
                        type="text"
                        value={payoutAccountNumber}
                        onChange={(e) => setPayoutAccountNumber(e.target.value)}
                        placeholder="024XXXXXXX"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
                  >
                    {editingVendor ? 'Save Changes' : 'Create Vendor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
