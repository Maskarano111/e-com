import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  ChevronDown,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

interface StaticPageProps {
  page: 'about' | 'contact' | 'faq' | 'terms' | 'privacy' | 'returns';
  onNavigate: (view: string, param?: any) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ page, onNavigate }) => {
  const { settings } = useSettings();
  const { showToast } = useToast();

  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      showToast('success', 'Message Dispatched', 'Our Accra support team will respond within 2 business hours.');
    }, 600);
  };

  const FAQS = [
    {
      q: 'How fast is delivery within Accra & Tema?',
      a: 'Same-day or next-day delivery (within 24 hours) is available for all orders within Greater Accra. Standard deliveries to Kumasi, Takoradi, and other regional capitals take 2 to 3 business days.'
    },
    {
      q: 'Which payment methods do you accept?',
      a: 'We accept MTN Mobile Money (MoMo), Telecel Cash, AT Money, Visa, Mastercard, and Cash on Delivery for eligible items within Accra.'
    },
    {
      q: 'Are all products 100% genuine with warranty?',
      a: 'Yes! Every product sold on NovaMart is authentic and covered by an official 12 to 24-month manufacturer warranty. We inspect every batch before delivery.'
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We provide a hassle-free 7-day return policy. If your product is defective or does not match the description, contact our support team for a free pickup and immediate refund or replacement.'
    },
    {
      q: 'Can I track my delivery rider in real-time?',
      a: 'Yes! Simply use the "Track Order" link in the top menu and enter your Order Number (e.g. #NM-GH-10928) to see live progress and rider details.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. ABOUT US */}
      {page === 'about' && (
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
              Our Journey & Heritage
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Building West Africa's Most Trusted Retail Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Founded in Accra, Ghana, NovaMart connects discerning shoppers with genuine global brands, fast local dispatch, and transparent pricing.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Genuine Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct partnerships with authorized manufacturers in Tokyo, Seoul, Cupertino, and Frankfurt. Zero counterfeits.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Rapid Nationwide Courier</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Modern logistics hub located in Airport City, Accra, offering lightning dispatch across all 16 regions of Ghana.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Human-First Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Call, WhatsApp, or email our Accra concierge team 7 days a week for expert guidance and post-sale care.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTACT US */}
      {page === 'contact' && (
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Get In Touch</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              We’re Here to Assist You
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Have questions regarding an order, wholesale inquiry, or warranty service? Reach out to us.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Info Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Accra Flagship & Warehouse</h4>
                    <p className="text-slate-500 mt-0.5">Plot 44, Airport City Business Park, Accra, Ghana</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Customer Support Hotline</h4>
                    <p className="text-slate-500 mt-0.5">{settings.storePhone} (8am – 8pm GMT)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Email Inquiries</h4>
                    <p className="text-slate-500 mt-0.5">{settings.storeEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                {isSent ? (
                  <div className="text-center py-10 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Message Dispatched</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Thank you for contacting NovaMart. An agent from our customer team will get back to you shortly.
                    </p>
                    <button
                      onClick={() => setIsSent(false)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Nana Ama"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nana@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Inquiry regarding Order #NM-GH-10928"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Message *</label>
                      <textarea
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us how we can help..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FAQ ACCORDION */}
      {page === 'faq' && (
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Help Center</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Find instant answers to common questions regarding shopping, delivery, payment, and warranties.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 sm:px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TERMS / PRIVACY / RETURNS */}
      {(page === 'terms' || page === 'privacy' || page === 'returns') && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
            {page === 'terms' ? 'Terms & Conditions of Service' : page === 'privacy' ? 'Privacy & Data Protection Policy' : '7-Day Return & Replacement Policy'}
          </h1>
          <p>Last Updated: August 2026 • NovaMart Ghana Operations</p>

          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Authenticity & Warranty</h3>
            <p>
              All physical merchandise sold through NovaMart is certified 100% authentic and procured through authorized distributors. Warranties cover manufacturer defects for 12 to 24 months depending on the product tier.
            </p>

            <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Payments & Currency</h3>
            <p>
              Prices are denominated in Ghanaian Cedi (GH₵ / GHS). Transactions via MTN Mobile Money, Telecel Cash, AT Money, and Visa/Mastercard are processed securely via 256-bit encrypted gateways.
            </p>

            <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Returns & Refunds</h3>
            <p>
              Items may be returned within 7 calendar days of delivery if they remain unopened with factory seals intact or exhibit verifiable manufacturer malfunctions upon unboxing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
