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
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  Lock,
  Star,
  FileText,
  Upload,
  Eye,
  AlertCircle,
  FileCheck,
  Clock,
  ChevronRight,
  Trash2
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

  // Wizard Step State (1: Store & Personal, 2: Document Verification, 3: Payout Setup, 4: Submitted & Pending)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Store & Personal Profile
  const [sellerCountry, setSellerCountry] = useState<'Ghana' | 'Nigeria'>('Ghana');
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Electronics & Phones');
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+233 ');
  const [password, setPassword] = useState('');
  const [stateOrRegion, setStateOrRegion] = useState('Greater Accra');
  const [city, setCity] = useState('Accra');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Legal Verification Documents (Strict Upload Requirements)
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [businessRegDoc, setBusinessRegDoc] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [tin, setTin] = useState('');
  const [nationalIdType, setNationalIdType] = useState('Ghana Card');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [nationalIdFront, setNationalIdFront] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [nationalIdBack, setNationalIdBack] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [proofOfAddressDoc, setProofOfAddressDoc] = useState<{ name: string; size: string; dataUrl: string } | null>(null);

  // Step 3: Payout Setup & Commission
  const [payoutMethod, setPayoutMethod] = useState<'mtn_momo' | 'telecel_cash' | 'airteltigo' | 'bank_transfer'>('mtn_momo');
  const [bankName, setBankName] = useState('Access Bank / GTBank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVendor, setSubmittedVendor] = useState<any>(null);

  // Switch country specific defaults
  const handleCountryChange = (country: 'Ghana' | 'Nigeria') => {
    setSellerCountry(country);
    if (country === 'Nigeria') {
      setPhone('+234 ');
      setStateOrRegion('Lagos State');
      setCity('Ikeja');
      setNationalIdType('National Identification Number (NIN)');
      setPayoutMethod('bank_transfer');
      setBankName('Zenith Bank');
    } else {
      setPhone('+233 ');
      setStateOrRegion('Greater Accra');
      setCity('Accra');
      setNationalIdType('Ghana Card (National ID)');
      setPayoutMethod('mtn_momo');
    }
  };

  // Generic File Upload Handler helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: { name: string; size: string; dataUrl: string } | null) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File Too Large', `${file.name} exceeds the 10MB upload limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      const sizeKB = (file.size / 1024).toFixed(0) + ' KB';
      setter({
        name: file.name,
        size: sizeKB,
        dataUrl
      });
      showToast('success', 'Document Attached', `${file.name} uploaded successfully.`);
    };
    reader.readAsDataURL(file);
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToDocuments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      showToast('error', 'Store Name Required', 'Please enter your business or store name.');
      return;
    }
    if (!ownerFirstName.trim() || !ownerLastName.trim()) {
      showToast('error', 'Legal Owner Name Required', 'Please enter your full legal first and last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('error', 'Invalid Email', 'Please enter a valid business email address.');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      showToast('error', 'Valid Phone Required', 'Please enter an active contact phone number.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      showToast('error', 'Password Too Short', 'Please choose a password with at least 6 characters.');
      return;
    }
    if (!address.trim()) {
      showToast('error', 'Physical Address Required', 'Please provide your physical store or dispatch location.');
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleProceedToPayout = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation rules for documents
    if (!businessRegNumber.trim()) {
      showToast(
        'error',
        'Business Registration Required',
        sellerCountry === 'Nigeria'
          ? 'Please enter your CAC Business Registration / RC Number.'
          : 'Please enter your Registrar General Department (RGD) Registration Number.'
      );
      return;
    }

    if (!businessRegDoc) {
      showToast(
        'error',
        'Registration Certificate Required',
        sellerCountry === 'Nigeria'
          ? 'Please upload your CAC Business Certificate document.'
          : 'Please upload your RGD Certificate of Incorporation or Business Registration document.'
      );
      return;
    }

    if (!tin.trim()) {
      showToast('error', 'Tax ID (TIN) Required', 'Please enter your Tax Identification Number.');
      return;
    }

    if (!nationalIdNumber.trim()) {
      showToast('error', 'National ID Number Required', 'Please enter your Government ID Number.');
      return;
    }

    if (!nationalIdFront) {
      showToast('error', 'National ID Front Required', 'Please upload a clear photo/scan of the front of your ID card.');
      return;
    }

    if (!nationalIdBack) {
      showToast('error', 'National ID Back Required', 'Please upload a clear photo/scan of the back of your ID card.');
      return;
    }

    if (!proofOfAddressDoc) {
      showToast('error', 'Proof of Address Required', 'Please upload a recent utility bill, tenancy agreement, or bank statement.');
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 Submission -> Create Vendor with 'pending' status
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountNumber.trim()) {
      showToast('error', 'Payout Account Required', 'Please provide a valid account number or MoMo mobile number.');
      return;
    }

    if (!agreedToTerms) {
      showToast('error', 'Terms Agreement Required', 'You must agree to NovaMart Marketplace Merchant Terms & Commission.');
      return;
    }

    setIsSubmitting(true);
    try {
      const verificationDocuments = {
        businessRegNumber,
        businessRegDoc: businessRegDoc?.dataUrl || businessRegDoc?.name,
        tin,
        nationalIdType,
        nationalIdNumber,
        nationalIdFront: nationalIdFront?.dataUrl || nationalIdFront?.name,
        nationalIdBack: nationalIdBack?.dataUrl || nationalIdBack?.name,
        proofOfAddressDoc: proofOfAddressDoc?.dataUrl || proofOfAddressDoc?.name,
        stateOrRegion,
        submittedAt: new Date().toISOString()
      };

      const res = await api.createVendor({
        storeName,
        ownerFirstName,
        ownerLastName,
        email,
        phone,
        password,
        category,
        description: description || `Official seller store of ${storeName} on NovaMart West Africa.`,
        country: sellerCountry,
        countryCode: sellerCountry === 'Nigeria' ? 'NG' : 'GH',
        address,
        city,
        stateOrRegion,
        status: 'pending', // Strictly Pending until Admin Approval
        verificationDocuments,
        commissionRate: 10,
        payoutDetails: {
          method: payoutMethod,
          bankName: payoutMethod === 'bank_transfer' ? bankName : undefined,
          accountName: accountName || `${ownerFirstName} ${ownerLastName}`,
          accountNumber: accountNumber || phone
        }
      });

      setSubmittedVendor(res.vendor);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('success', 'Application Submitted!', 'Your compliance documents are now under review.');
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Could not submit seller application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Compliance Review Screen
  if (currentStep === 4) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-xl text-center space-y-6"
        >
          {/* Status Badge */}
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto ring-8 ring-amber-500/10">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Application Under Compliance Review</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Thank You, {ownerFirstName}! Your Application is Received.
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              We have received your verification documents for <strong className="text-slate-900 dark:text-white font-bold">{storeName}</strong> ({sellerCountry === 'Nigeria' ? '🇳🇬 Nigeria' : '🇬🇭 Ghana'}).
            </p>
          </div>

          {/* Verification Timeline */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-left space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Verification Progress Tracker
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">1. Merchant Application & Legal Profile Submitted</p>
                  <p className="text-[11px] text-slate-500">CAC/RGD details, TIN, and address registered successfully.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">2. Compliance & Government ID Verification (In Progress)</p>
                  <p className="text-[11px] text-slate-500">Our compliance officers are verifying your business documents against official registries (24–48 hours).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">3. Admin Approval & Storefront Activation</p>
                  <p className="text-[11px] text-slate-500">Upon approval, you will receive email/SMS confirmation and immediate access to list live products.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              Return to Marketplace
            </button>
            <button
              onClick={() => onNavigate('admin-vendors')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Admin HQ Review Portal (Test Demo)
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NovaMart West Africa Merchant Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Sell Across Ghana & Nigeria
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Open your verified digital storefront, reach 50,000+ buyers, and receive guaranteed payouts. Complete verification below to get approved.
        </p>

        {/* Step Progress Bar */}
        <div className="pt-6 max-w-xl mx-auto">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className={`p-2.5 rounded-xl border transition-all ${
              currentStep === 1
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : currentStep > 1
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
            }`}>
              <span>1. Store & Profile</span>
            </div>

            <div className={`p-2.5 rounded-xl border transition-all ${
              currentStep === 2
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : currentStep > 2
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
            }`}>
              <span>2. Legal Documents</span>
            </div>

            <div className={`p-2.5 rounded-xl border transition-all ${
              currentStep === 3
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
            }`}>
              <span>3. Payout & Terms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
          
          {/* STEP 1: STORE & PERSONAL PROFILE */}
          {currentStep === 1 && (
            <motion.form
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleProceedToDocuments}
              className="p-6 sm:p-10 space-y-8"
            >
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <span>Step 1: Store Details & Country of Operation</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your country to adapt compliance and local logistics hubs.
                </p>
              </div>

              {/* Country Selection Pill */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Business Country <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCountryChange('Ghana')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      sellerCountry === 'Ghana'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl">🇬🇭</span>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Ghana Market</p>
                      <p className="text-[10px] text-slate-500">Accra, Kumasi, Takoradi & 16 Regions (GH₵)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCountryChange('Nigeria')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      sellerCountry === 'Nigeria'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl">🇳🇬</span>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Nigeria Market</p>
                      <p className="text-[10px] text-slate-500">Lagos, Abuja, Port Harcourt & All States (₦)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Store & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Store / Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Tech & Electronics"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Primary Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option>Phones & Tablets</option>
                    <option>Electronics & Audio</option>
                    <option>Home & Kitchen</option>
                    <option>Fashion & Shoes</option>
                    <option>Health & Fitness</option>
                    <option>Beauty & Perfumes</option>
                    <option>Computers & Gaming</option>
                    <option>Supermarket & Groceries</option>
                  </select>
                </div>
              </div>

              {/* Owner Legal Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Legal First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emmanuel"
                    value={ownerFirstName}
                    onChange={(e) => setOwnerFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Legal Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mensah / Adebayo"
                    value={ownerLastName}
                    onChange={(e) => setOwnerLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Email & Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Business Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seller@yourstore.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={sellerCountry === 'Nigeria' ? '+234 803 123 4567' : '+233 24 555 0199'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Location & Physical Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    State / Region <span className="text-rose-500">*</span>
                  </label>
                  {sellerCountry === 'Nigeria' ? (
                    <select
                      value={stateOrRegion}
                      onChange={(e) => setStateOrRegion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option>Lagos State</option>
                      <option>FCT Abuja</option>
                      <option>Rivers State (Port Harcourt)</option>
                      <option>Oyo State (Ibadan)</option>
                      <option>Kano State</option>
                      <option>Anambra State (Onitsha)</option>
                      <option>Edo State (Benin City)</option>
                      <option>Enugu State</option>
                      <option>Ogun State</option>
                    </select>
                  ) : (
                    <select
                      value={stateOrRegion}
                      onChange={(e) => setStateOrRegion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option>Greater Accra</option>
                      <option>Ashanti Region (Kumasi)</option>
                      <option>Western Region (Takoradi)</option>
                      <option>Central Region (Cape Coast)</option>
                      <option>Eastern Region (Koforidua)</option>
                      <option>Northern Region (Tamale)</option>
                      <option>Volta Region (Ho)</option>
                      <option>Bono Region (Sunyani)</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    City / Town <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={sellerCountry === 'Nigeria' ? 'e.g. Ikeja, Lekki, Victoria Island' : 'e.g. Osu, East Legon, Spintex'}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Store / Dispatch Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Plot / Street / Warehouse location"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Submit Step 1 Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Document Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: LEGAL VERIFICATION DOCUMENTS (STRICT UPLOADS) */}
          {currentStep === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleProceedToPayout}
              className="p-6 sm:p-10 space-y-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Step 2: Mandatory Business & Identity Documents</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    To comply with anti-fraud regulations, you must upload all required government documents. Missing or invalid uploads will block activation.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {sellerCountry === 'Nigeria' ? '🇳🇬 Nigeria CAC/NIN' : '🇬🇭 Ghana RGD/Card'}
                </span>
              </div>

              {/* 1. CAC or RGD Business Registration Certificate */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>
                      1. {sellerCountry === 'Nigeria' ? 'CAC Business Certificate (RC / BN Number)' : 'RGD Business Registration Certificate'}
                    </span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] uppercase font-bold text-slate-400">PDF / PNG / JPG</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder={sellerCountry === 'Nigeria' ? 'e.g. RC-1849204 / BN-928401' : 'e.g. BN-2024/09182'}
                    value={businessRegNumber}
                    onChange={(e) => setBusinessRegNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />

                  <div>
                    {businessRegDoc ? (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">{businessRegDoc.name}</span>
                          <span className="text-[10px] text-emerald-600 shrink-0">({businessRegDoc.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBusinessRegDoc(null)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-colors text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Upload CAC/RGD Certificate</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setBusinessRegDoc, 'CAC/RGD Certificate')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Tax Identification Number (TIN) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>2. Taxpayer Identification Number (TIN / GRA PIN)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={sellerCountry === 'Nigeria' ? 'e.g. 23819204-0001 (FIRS TIN)' : 'e.g. P0019284019 (Ghana GRA TIN)'}
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* 3. Valid Government Issued ID (Front & Back Required) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-500" />
                    <span>3. Government ID Card ({sellerCountry === 'Nigeria' ? 'NIN / Passport / Driver License' : 'Ghana Card'})</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] uppercase font-bold text-rose-500">Both Front & Back Required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={nationalIdType}
                    onChange={(e) => setNationalIdType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {sellerCountry === 'Nigeria' ? (
                      <>
                        <option>National Identification Number (NIN Slip / Card)</option>
                        <option>FRSC Driver's License</option>
                        <option>International Passport</option>
                        <option>Voter's Card (INEC)</option>
                      </>
                    ) : (
                      <>
                        <option>Ghana Card (National ID)</option>
                        <option>Ghana Passport</option>
                        <option>DVLA Driver's License</option>
                      </>
                    )}
                  </select>

                  <input
                    type="text"
                    required
                    placeholder={sellerCountry === 'Nigeria' ? 'e.g. 11-digit NIN or License No' : 'e.g. GHA-728192049-2'}
                    value={nationalIdNumber}
                    onChange={(e) => setNationalIdNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* ID Upload Grid: Front & Back */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Front Upload */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Front of ID Document:</span>
                    {nationalIdFront ? (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">{nationalIdFront.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNationalIdFront(null)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-colors text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Upload ID (Front)</span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setNationalIdFront, 'ID Front')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Back Upload */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Back of ID Document:</span>
                    {nationalIdBack ? (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">{nationalIdBack.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNationalIdBack(null)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-colors text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Upload ID (Back)</span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setNationalIdBack, 'ID Back')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Proof of Address / Utility Bill */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>4. Proof of Business Location / Utility Bill</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Electricity / Water / Bank Statement</span>
                </div>

                <div>
                  {proofOfAddressDoc ? (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">{proofOfAddressDoc.name}</span>
                        <span className="text-[10px] text-emerald-600 shrink-0">({proofOfAddressDoc.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProofOfAddressDoc(null)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-colors text-xs font-bold text-slate-600 dark:text-slate-300">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Upload Proof of Address Document</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setProofOfAddressDoc, 'Proof of Address')}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Profile</span>
                </button>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Payout Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: PAYOUT DETAILS & COMMISSION AGREEMENT */}
          {currentStep === 3 && (
            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleFinalSubmit}
              className="p-6 sm:p-10 space-y-8"
            >
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Step 3: Merchant Payout Settlement & Agreement</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your business bank account or Mobile Money wallet for weekly automated payouts.
                </p>
              </div>

              {/* Payout Method */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Payout Method <span className="text-rose-500">*</span>
                </label>

                {sellerCountry === 'Nigeria' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank_transfer')}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        payoutMethod === 'bank_transfer'
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Nigerian Commercial Bank</p>
                        <p className="text-[10px] text-slate-500">NIP Direct Bank Transfer (Zenith, GTB, Access, etc.)</p>
                      </div>
                    </button>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500">Select Bank Name</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium outline-none"
                      >
                        <option>Zenith Bank Plc</option>
                        <option>Guaranty Trust Bank (GTBank)</option>
                        <option>Access Bank Plc</option>
                        <option>First Bank of Nigeria</option>
                        <option>United Bank for Africa (UBA)</option>
                        <option>Wema Bank / ALAT</option>
                        <option>OPay Digital Services</option>
                        <option>PalmPay</option>
                        <option>Kuda Microfinance Bank</option>
                        <option>Stanbic IBTC Bank</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('mtn_momo')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        payoutMethod === 'mtn_momo'
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">MTN Mobile Money</p>
                      <p className="text-[10px] text-amber-600 font-bold">Ghana MoMo</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('telecel_cash')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        payoutMethod === 'telecel_cash'
                          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Telecel Cash</p>
                      <p className="text-[10px] text-rose-600 font-bold">Instant Payout</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank_transfer')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        payoutMethod === 'bank_transfer'
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Ghana Bank Account</p>
                      <p className="text-[10px] text-emerald-600 font-bold">GCB / Ecobank / Stanbic</p>
                    </button>
                  </div>
                )}

                {/* Account Details Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Account Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Account holder name exactly as on bank/MoMo"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Account Number / MoMo Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={sellerCountry === 'Nigeria' ? '10-digit NUBAN account number' : 'e.g. 0244123456'}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Commission Terms Box */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <Percent className="w-4 h-4" />
                  <span>Standard 10% Marketplace Commission</span>
                </div>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                  NovaMart charges a standard 10% platform fee only on completed sales. There are zero listing fees, zero monthly subscription costs, and free customer payment processing.
                </p>
                <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    I agree to the NovaMart Seller Terms & Conditions, 10% sales commission, and confirm that all uploaded government identity documents are authentic.
                  </span>
                </label>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Documents</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Compliance Approval</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

        </div>
      </div>
    </div>
  );
};
