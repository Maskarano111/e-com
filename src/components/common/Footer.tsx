import React, { useState } from 'react';
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  Send,
  Facebook,
  Instagram,
  Twitter,
  CheckCircle2
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface FooterProps {
  onNavigate: (view: string, param?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800 transition-colors">
      {/* 1. BENEFIT VALUE PROPOSITIONS */}
      <div className="border-b border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Next-Day Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Accra, Kumasi & nationwide across Ghana</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Quality</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct from verified authorized manufacturers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">7-Day Free Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free replacement & money back</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24/7 Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Prompt WhatsApp & Phone assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Nova<span className="text-emerald-500">Mart</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {settings.tagline || 'Ghana’s premier luxury online boutique for designer perfumes, authentic Arabian oud, scented candles, and exclusive accessories.'}
            </p>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{settings.businessAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{settings.storePhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{settings.storeEmail}</span>
              </div>
            </div>

            {/* Social media icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors text-slate-400">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors text-slate-400">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors text-slate-400">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-emerald-400 transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { dealsOnly: true })} className="hover:text-emerald-400 transition-colors">
                  Flash Sales & Discounts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { sortBy: 'newest' })} className="hover:text-emerald-400 transition-colors">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-emerald-400 transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-emerald-400 transition-colors">
                  Customer Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">
                  About NovaMart
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faqs')} className="hover:text-emerald-400 transition-colors">
                  Help & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-emerald-400 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('returns')} className="hover:text-emerald-400 transition-colors">
                  Return & Refund Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Stay In The Loop</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe for weekly superstore flash sales, tech discounts, fashion alerts, and new arrivals across Ghana.
            </p>
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! Check your inbox for 10% welcome coupon.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    id="input-newsletter-email"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 text-white placeholder-slate-500 text-xs border border-slate-800 focus:border-emerald-500 outline-hidden"
                  />
                  <button
                    id="btn-submit-newsletter"
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">We respect your privacy. No spam ever.</p>
              </form>
            )}
          </div>
        </div>

        {/* 3. PAYMENT BADGES & COPYRIGHT */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} NovaMart E-Commerce Ghana Ltd. All rights reserved.</p>

          {/* Accepted payment methods */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 mr-1">Secured Payments:</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-400">
              MTN MoMo
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-rose-400">
              Telecel Cash
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-indigo-400">
              Paystack
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-emerald-400">
              Visa / Mastercard
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
