import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthViewsProps {
  mode: 'login' | 'register' | 'forgot-password';
  onNavigate: (view: string, param?: any) => void;
}

export const AuthViews: React.FC<AuthViewsProps> = ({ mode = 'login', onNavigate }) => {
  const { login, register, adminLogin, user } = useAuth();
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
        // Redirection will occur via the useEffect or direct navigation
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

  return (
    <div className="min-h-screen flex">
      {/* Left: Luxury Brand Image Panel */}
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
            <p className="text-xs text-emerald-300/80 font-semibold tracking-widest uppercase mt-1">Online Superstore & Marketplace</p>
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
              Sign in to manage orders, track real-time dispatch, redeem loyalty points, and checkout faster with MTN MoMo, Telecel & Cards.
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
              <Sparkles className="w-3.5 h-3.5" /> Accra & Kumasi Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* Right: Interactive Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setCurrentMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentMode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                {currentMode === 'login' ? <Lock className="w-6 h-6" /> : currentMode === 'register' ? <UserCheck className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentMode === 'login'
                  ? 'Welcome to NovaMart'
                  : currentMode === 'register'
                  ? 'Create Your Account'
                  : 'Reset Your Password'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentMode === 'login'
                  ? 'Access your saved cart, orders, and wishlist'
                  : currentMode === 'register'
                  ? 'Create an account for instant order tracking, discounts & perks'
                  : 'Enter your account email to receive a password reset link'}
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
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick 1-Click Demo Accounts:</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Fast Test</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    disabled={isLoading}
                    className="flex flex-col items-start p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all hover:shadow-sm group cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Super Admin
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Kwame (Full Control)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('customer')}
                    disabled={isLoading}
                    className="flex flex-col items-start p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-all hover:shadow-sm group cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Abena (Orders & Wishlist)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {currentMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
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
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentMode('forgot-password');
                        setErrorMessage(null);
                      }}
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
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In to NovaMart'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <span className="text-slate-500 dark:text-slate-400">New customer? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMode('register');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* 2. REGISTRATION FORM */}
            {currentMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
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
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                      />
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                    <input
                      id="input-reg-lastname"
                      name="lastName"
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Mensah"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
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
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <input
                      id="input-reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 24 555 0199"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password * (Min 6 chars)</label>
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
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
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
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer mt-1"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {currentMode === 'forgot-password' && (
              <div className="space-y-4 text-xs">
                {forgotSubmitted ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                    <p className="font-black text-sm">Password Reset Dispatched</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox or spam folder.
                    </p>
                    <button
                      onClick={() => {
                        setForgotSubmitted(false);
                        setCurrentMode('login');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500 transition-colors"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="kwame@example.com"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      Send Password Reset Link
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentMode('login');
                          setErrorMessage(null);
                        }}
                        className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
