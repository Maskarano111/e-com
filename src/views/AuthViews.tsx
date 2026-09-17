import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  UserCheck,
  Loader2,
  Package,
  Zap,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthViewsProps {
  mode: 'login' | 'register' | 'forgot-password';
  onNavigate: (view: string, param?: any) => void;
}

/* ── Password Strength Helper ── */
function getPasswordStrength(pw: string): { label: string; level: 0 | 1 | 2 | 3 } {
  if (pw.length === 0) return { label: '', level: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', level: 1 };
  if (score === 2 || score === 3) return { label: 'Fair', level: 2 };
  return { label: 'Strong', level: 3 };
}

export const AuthViews: React.FC<AuthViewsProps> = ({ mode = 'login', onNavigate }) => {
  const { login, register, adminLogin, googleLogin, user } = useAuth();
  const { showToast } = useToast();

  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'forgot-password'>(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Password strength (register only)
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Sync mode whenever prop changes
  useEffect(() => {
    setCurrentMode(mode);
    setErrorMessage(null);
  }, [mode]);

  // If user is already logged in, offer quick navigation
  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin' || user.role === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('home');
      }
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(cleanEmail, cleanPass);
      setIsLoading(false);
      if (success) {
        if (cleanEmail.toLowerCase().startsWith('admin@')) {
          onNavigate('admin');
        } else {
          onNavigate('home');
        }
      } else {
        setErrorMessage('Invalid email or password. Please check your credentials or use the Quick Demo buttons below.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanFirst || !cleanLast || !cleanEmail || !cleanPass) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (confirmPassword && cleanPass !== confirmPassword.trim()) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await register({
        email: cleanEmail,
        password: cleanPass,
        firstName: cleanFirst,
        lastName: cleanLast,
        phone: cleanPhone
      });
      setIsLoading(false);
      if (success) {
        onNavigate('home');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('error', 'Email Required', 'Please enter your account email.');
      return;
    }
    setForgotSubmitted(true);
    showToast('success', 'Reset Link Dispatched', `Instructions have been sent to ${email.trim()}`);
  };

  // Quick 1-Click Demo Logins
  const handleQuickDemo = async (demoRole: 'admin' | 'customer' | 'manager') => {
    setIsLoading(true);
    setErrorMessage(null);
    if (demoRole === 'admin') {
      setEmail('admin@novamart.com.gh');
      setPassword('admin123');
      const success = await adminLogin('admin@novamart.com.gh', 'admin123');
      setIsLoading(false);
      if (success) onNavigate('admin');
    } else if (demoRole === 'manager') {
      setEmail('manager@novamart.com.gh');
      setPassword('manager123');
      const success = await adminLogin('manager@novamart.com.gh', 'manager123');
      setIsLoading(false);
      if (success) onNavigate('admin');
    } else {
      setEmail('maskarano111@gmail.com');
      setPassword('customer123');
      const success = await login('maskarano111@gmail.com', 'customer123');
      setIsLoading(false);
      if (success) onNavigate('home');
    }
  };

  /* ── Shared input class ── */
  const inputBase =
    'w-full py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500';

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Luxury Brand Panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=1400&auto=format&fit=crop&q=85')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-emerald-950/40" />
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-1 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/40">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">Nova<span className="text-emerald-400">Mart</span></span>
            </div>
            <p className="text-xs text-emerald-300/80 font-semibold tracking-widest uppercase mt-1">Online Superstore &amp; Marketplace</p>
          </div>

          <div className="space-y-5 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Genuine Products Guaranteed
            </span>
            <h2 className="text-4xl font-black leading-tight text-white">
              Everything You Need,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Delivered Across Ghana
              </span>
            </h2>
            <p className="text-sm text-slate-300/80 leading-relaxed">
              Sign in to manage orders, track real-time dispatch, redeem loyalty points, and checkout faster with MTN MoMo, Telecel &amp; Cards.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Apple', 'Samsung', 'Sony', 'Nike', 'NovaKitchen', 'MedCheck'].map((b) => (
                <span key={b} className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-[11px] font-bold text-slate-200 backdrop-blur-md">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
            <span>&copy; {new Date().getFullYear()} NovaMart Ghana</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Accra &amp; Kumasi Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: Interactive Form Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 lg:p-10">
        <div className="w-full max-w-md">

          {/* ── Mobile Brand Header (hidden on desktop) ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mb-6"
          >
            {/* Logo row */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 mb-4"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Nova<span className="text-emerald-600">Mart</span>
                </span>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-tight">
                  Ghana&apos;s Online Superstore
                </p>
              </div>
            </button>

            {/* Trust badges row */}
            <div className="flex gap-2 flex-wrap">
              {[
                { icon: ShieldCheck, label: 'Secure Checkout' },
                { icon: Zap, label: 'Fast Dispatch' },
                { icon: Star, label: '4.9★ Rated' }
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-100 dark:border-emerald-900"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Card Container ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-5"
          >
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => { setCurrentMode('login'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setCurrentMode('register'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentMode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mb-3 shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentMode === 'login' && 'Welcome Back'}
                {currentMode === 'register' && 'Create Account'}
                {currentMode === 'forgot-password' && 'Reset Password'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {currentMode === 'login' && 'Sign in to access your orders, wishlist & discounts'}
                {currentMode === 'register' && 'For shoppers to track orders, save items & get exclusive discounts'}
                {currentMode === 'forgot-password' && 'Enter your email to receive recovery instructions'}
              </p>
            </div>

            {/* Error Message Banner */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick 1-Click Demo Logins */}
            {currentMode === 'login' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick 1-Click Demo Accounts:</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Fast Test</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    disabled={isLoading}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all hover:shadow-sm group cursor-pointer min-h-[48px]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 block">Super Admin</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Kwame (Full Control)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('customer')}
                    disabled={isLoading}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all hover:shadow-sm group cursor-pointer min-h-[48px]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 block">Customer</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Abena (Orders & Wishlist)</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ── 1. SIGN IN FORM ── */}
            {currentMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <input
                      id="input-login-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@novamart.com.gh or customer"
                      className={`${inputBase} pl-10 pr-3.5`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => { setCurrentMode('forgot-password'); setErrorMessage(null); }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="input-login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pl-10 pr-11`}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin-btn" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to NovaMart</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center text-xs pt-1">
                  <span className="text-slate-500 dark:text-slate-400">New customer? </span>
                  <button
                    type="button"
                    onClick={() => { setCurrentMode('register'); setErrorMessage(null); }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>

                {/* ── Divider ── */}
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">or continue with</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* ── Google Sign-In ── */}
                <button
                  id="btn-google-login"
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    const ok = await googleLogin();
                    setIsLoading(false);
                    if (ok) onNavigate('home');
                  }}
                  className="w-full py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-70 cursor-pointer"
                >
                  {/* Google SVG logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {/* ── 2. REGISTRATION FORM ── */}
            {currentMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                    <div className="relative">
                      <input
                        id="input-reg-firstname"
                        name="firstName"
                        type="text"
                        required
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Kwame"
                        className={`${inputBase} pl-9 pr-3`}
                      />
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                    <input
                      id="input-reg-lastname"
                      name="lastName"
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Mensah"
                      className={`${inputBase} px-3`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      id="input-reg-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kwame@example.com"
                      className={`${inputBase} pl-9 pr-3.5`}
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <input
                      id="input-reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 24 555 0199"
                      className={`${inputBase} pl-9 pr-3.5`}
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password * (Min 6 chars)</label>
                  <div className="relative">
                    <input
                      id="input-reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pl-9 pr-10`}
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="strength-bar-track">
                        <div
                          className={`strength-bar-fill ${
                            passwordStrength.level === 1 ? 'strength-weak' :
                            passwordStrength.level === 2 ? 'strength-fair' :
                            'strength-strong'
                          }`}
                        />
                      </div>
                      <p className={`text-[11px] font-bold mt-1 ${
                        passwordStrength.level === 1 ? 'text-rose-500' :
                        passwordStrength.level === 2 ? 'text-amber-500' :
                        'text-emerald-600'
                      }`}>
                        Password strength: {passwordStrength.label}
                        {passwordStrength.level === 3 && ' ✓'}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="input-reg-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      minLength={6}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pl-9 pr-10 ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : confirmPassword && confirmPassword === password
                          ? 'border-emerald-400 focus:border-emerald-500'
                          : ''
                      }`}
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPassword.length > 0 && (
                    <p className={`text-[11px] font-bold mt-1 ${
                      confirmPassword === password ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer mt-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin-btn" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center text-xs pt-2 space-y-3">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => { setCurrentMode('login'); setErrorMessage(null); }}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Want to sell products on NovaMart?
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('become-seller')}
                      className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <span>Register as a Merchant / Seller instead</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ── 3. FORGOT PASSWORD FORM ── */}
            {currentMode === 'forgot-password' && (
              <div className="space-y-4">
                {forgotSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-center space-y-3"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                    <p className="font-black text-sm">Password Reset Dispatched</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox or spam folder.
                    </p>
                    <button
                      onClick={() => { setForgotSubmitted(false); setCurrentMode('login'); }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500 transition-colors"
                    >
                      Back to Sign In
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="kwame@example.com"
                          className={`${inputBase} pl-10 pr-3.5`}
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      Send Password Reset Link
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => { setCurrentMode('login'); setErrorMessage(null); }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
