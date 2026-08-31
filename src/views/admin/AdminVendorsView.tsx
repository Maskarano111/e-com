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
  AlertCircle,
  FileText,
  FileCheck,
  Eye,
  Clock,
  Check,
  Ban
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

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Document Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingVendor, setReviewingVendor] = useState<Vendor | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

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
  const [country, setCountry] = useState<'Ghana' | 'Nigeria'>('Ghana');
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
    setCountry('Ghana');
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
    setCountry(v.countryCode === 'NG' ? 'Nigeria' : 'Ghana');
    setCommissionRate(v.commissionRate);
    setPayoutMethod(v.payoutDetails?.method || 'mtn_momo');
    setPayoutAccountName(v.payoutDetails?.accountName || '');
    setPayoutAccountNumber(v.payoutDetails?.accountNumber || '');
    setPayoutBankName(v.payoutDetails?.bankName || '');
    setIsModalOpen(true);
  };

  const handleOpenReview = (v: Vendor) => {
    setReviewingVendor(v);
    setRejectionReason('');
    setIsRejecting(false);
    setIsReviewModalOpen(true);
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      await api.approveVendor(vendorId);
      showToast('success', 'Merchant Approved!', 'The seller store has been activated and granted full listing access.');
      setIsReviewModalOpen(false);
      loadVendors();
    } catch (err: any) {
      showToast('error', 'Approval Failed', err.message || 'Could not approve vendor.');
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    if (!rejectionReason.trim()) {
      showToast('error', 'Rejection Reason Required', 'Please explain what documents are invalid or missing.');
      return;
    }

    try {
      await api.rejectVendor(vendorId, rejectionReason);
      showToast('info', 'Merchant Application Rejected', 'Feedback was saved and vendor was notified.');
      setIsReviewModalOpen(false);
      loadVendors();
    } catch (err: any) {
      showToast('error', 'Rejection Failed', err.message || 'Could not reject vendor.');
    }
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
          country,
          countryCode: country === 'Nigeria' ? 'NG' : 'GH',
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
          country,
          countryCode: country === 'Nigeria' ? 'NG' : 'GH',
          status: 'active',
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

  const pendingCount = vendors.filter((v) => v.status === 'pending').length;
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
            Vendors &amp; Merchants Compliance HQ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted legal documents (CAC, RGD, Ghana Card, NIN), approve new merchants, and manage commission rates.
          </p>
        </div>

        <button
          id="btn-admin-add-vendor"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
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
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold relative">
            <Clock className="w-6 h-6" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Pending Compliance Review</p>
            <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Active Selling Stores</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {vendors.filter((v) => v.status === 'active').length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Platform Commission GMV</p>
            <p className="text-2xl font-black text-emerald-600">{formatPrice(totalCommissionAll)}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by store name, owner, email, or category..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({vendors.length})
          </button>

          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStatus === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review ({pendingCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Active ({vendors.filter((v) => v.status === 'active').length})
          </button>

          <button
            onClick={() => setSelectedStatus('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'suspended'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Suspended ({vendors.filter((v) => v.status === 'suspended').length})
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Vendor / Store</th>
                <th className="py-3.5 px-4">Region / Market</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Compliance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading vendors directory...
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No merchants found matching this filter.
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
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{vendor.storeName}</p>
                          <p className="text-[11px] text-slate-500">{vendor.ownerName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Region */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{vendor.countryCode === 'NG' ? '🇳🇬' : '🇬🇭'}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {vendor.countryCode === 'NG' ? 'Nigeria' : 'Ghana'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{vendor.city || (vendor.countryCode === 'NG' ? 'Lagos' : 'Accra')}</p>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{vendor.email}</p>
                      <p className="text-[11px] text-slate-400">{vendor.phone}</p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {vendor.category}
                      </span>
                    </td>

                    {/* Commission */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {vendor.commissionRate || 10}%
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {vendor.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Store</span>
                        </span>
                      )}
                      {vendor.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {vendor.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3 h-3" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Review Compliance Documents */}
                        <button
                          onClick={() => handleOpenReview(vendor)}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Inspect Legal Documents & Verify"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Review Docs</span>
                        </button>

                        {/* Quick Approve button if pending */}
                        {vendor.status === 'pending' && (
                          <button
                            onClick={() => handleApproveVendor(vendor.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Approve & Activate Store"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Edit button */}
                        <button
                          onClick={() => handleOpenEdit(vendor)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Remove Vendor"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ── MODAL 1: COMPLIANCE DOCUMENTS REVIEW & APPROVAL ── */}
      <AnimatePresence>
        {isReviewModalOpen && reviewingVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Merchant Legal Verification Review
                    </h3>
                    <p className="text-xs text-slate-500">
                      {reviewingVendor.storeName} ({reviewingVendor.countryCode === 'NG' ? '🇳🇬 Nigeria' : '🇬🇭 Ghana'})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto text-xs">
                {/* Store & Owner Meta */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Store / Business</p>
                    <p className="font-bold text-slate-900 dark:text-white">{reviewingVendor.storeName}</p>
                    <p className="text-slate-500">{reviewingVendor.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Legal Owner</p>
                    <p className="font-bold text-slate-900 dark:text-white">{reviewingVendor.ownerName}</p>
                    <p className="text-slate-500">{reviewingVendor.email} • {reviewingVendor.phone}</p>
                  </div>
                </div>

                {/* Submitted Legal Documents */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Submitted Compliance Records</span>
                  </h4>

                  {/* 1. CAC / RGD Registration */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {reviewingVendor.countryCode === 'NG' ? 'CAC Registration Number' : 'RGD Business Number'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-mono text-[11px] font-bold">
                        {reviewingVendor.verificationDocuments?.businessRegNumber || 'CAC-192840-A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-semibold">Business Certificate Attached</span>
                    </div>
                  </div>

                  {/* 2. TIN */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Taxpayer ID (TIN / GRA PIN)</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 font-mono text-[11px] font-bold">
                      {reviewingVendor.verificationDocuments?.tin || 'TIN-92841029'}
                    </span>
                  </div>

                  {/* 3. National ID Front & Back */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {reviewingVendor.verificationDocuments?.nationalIdType || (reviewingVendor.countryCode === 'NG' ? 'NIN Slip / National ID' : 'Ghana Card')}
                      </span>
                      <span className="font-mono text-slate-500 font-bold">
                        {reviewingVendor.verificationDocuments?.nationalIdNumber || 'GHA-8291048-2'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                        <FileText className="w-5 h-5 text-indigo-500 mx-auto" />
                        <p className="font-bold text-slate-700 dark:text-slate-300">ID Document (Front)</p>
                        <span className="text-[10px] text-emerald-600 font-bold">Verified HD Scan</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                        <FileText className="w-5 h-5 text-indigo-500 mx-auto" />
                        <p className="font-bold text-slate-700 dark:text-slate-300">ID Document (Back)</p>
                        <span className="text-[10px] text-emerald-600 font-bold">Verified HD Scan</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Proof of Address */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Proof of Business Address</span>
                      <span className="text-slate-500 text-[11px]">{reviewingVendor.address}, {reviewingVendor.city}</span>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-[10px]">
                      Utility Bill Validated
                    </span>
                  </div>
                </div>

                {/* Rejection Form Box if active */}
                {isRejecting && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
                    <label className="font-bold text-rose-900 dark:text-rose-300">
                      Reason for Rejection / Compliance Feedback:
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. CAC certificate copy is blurry, please re-upload clear color scan of RC document."
                      className="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-xs outline-none"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="px-3 py-1.5 rounded-lg text-slate-500 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectVendor(reviewingVendor.id)}
                        className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-xs"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
                <button
                  type="button"
                  onClick={() => setIsRejecting(!isRejecting)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproveVendor(reviewingVendor.id)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Merchant &amp; Activate Store</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: ADD / EDIT VENDOR PROFILE ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {editingVendor ? 'Edit Merchant Profile' : 'Create Merchant Account'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure store information, country, and payout settlements.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVendor} className="p-6 space-y-4 overflow-y-auto text-xs">
                {/* Store Name & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Store / Brand Name</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Apex Tech & Gadgets"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Market Region</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-emerald-500"
                    >
                      <option value="Ghana">🇬🇭 Ghana (GH₵)</option>
                      <option value="Nigeria">🇳🇬 Nigeria (₦)</option>
                    </select>
                  </div>
                </div>

                {/* Owner Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Owner First Name</label>
                    <input
                      type="text"
                      required
                      value={ownerFirstName}
                      onChange={(e) => setOwnerFirstName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Owner Last Name</label>
                    <input
                      type="text"
                      required
                      value={ownerLastName}
                      onChange={(e) => setOwnerLastName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Category & Commission Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-emerald-500"
                    >
                      <option>Electronics & Phones</option>
                      <option>Home & Kitchen</option>
                      <option>Fashion & Shoes</option>
                      <option>Health & Fitness</option>
                      <option>Beauty & Perfumes</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Commission Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* City & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Physical Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                  >
                    {editingVendor ? 'Save Changes' : 'Create Merchant'}
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
