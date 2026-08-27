import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  X,
  Send,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  ThumbsUp,
  HelpCircle,
  Zap,
  CheckCircle2,
  Phone,
  Truck,
  ShieldCheck,
  ChevronDown,
  Maximize2,
  Minimize2,
  Trash2
} from 'lucide-react';
import { Product } from '../../types/index';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  products?: Product[];
  timestamp: string;
  actionLinks?: { label: string; view: string; params?: any }[];
}

interface NovaAICopilotProps {
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView?: (product: Product) => void;
}

export const NovaAICopilot: React.FC<NovaAICopilotProps> = ({ onNavigate, onOpenQuickView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { formatPrice } = useSettings();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: "Hello! I'm **NovaAI**, your personal shopping assistant & stylist. 🌟\n\nI can help you find products, compare deals, answer questions about shipping, MoMo payments, or recommend personalized gift ideas.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Load products for AI lookup
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.getProducts({ limit: 40 });
        if (res?.products) {
          setCatalogProducts(res.products);
        }
      } catch (e) {
        console.warn('Failed to load products for NovaAI', e);
      }
    };
    fetchCatalog();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const quickPrompts = [
    { label: '🔥 Top Flash Deals', query: 'Show me the best flash deals and discounts' },
    { label: '🎧 Best Headphones', query: 'What are the best wireless headphones in store?' },
    { label: '🚚 Shipping & Delivery', query: 'How does shipping and delivery work?' },
    { label: '💳 Payment Options', query: 'Can I pay with Mobile Money or Cash on Delivery?' },
    { label: '🎁 Gift Idea under GH₵ 500', query: 'Recommend a good gift under 500 cedis' }
  ];

  // Intelligent Copilot response generator
  const generateResponse = async (userQuery: string) => {
    setIsTyping(true);

    const q = userQuery.toLowerCase().trim();

    try {
      const serverRes = await api.chatWithAI(userQuery);
      if (serverRes && serverRes.source === 'gemini' && serverRes.text) {
        const newAiMessage: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: serverRes.text,
          products: serverRes.products && serverRes.products.length > 0 ? serverRes.products : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, newAiMessage]);
        setIsTyping(false);
        return;
      }
    } catch (e) {
      console.warn('AI chat endpoint fallback', e);
    }

    // Small delay for natural conversational feel
    await new Promise((r) => setTimeout(r, 450));

    let replyText = '';
    let matchingProducts: Product[] = [];
    let actionLinks: { label: string; view: string; params?: any }[] = [];

    // 1. Deals / Discounts
    if (q.includes('deal') || q.includes('discount') || q.includes('sale') || q.includes('cheap') || q.includes('flash')) {
      const deals = catalogProducts.filter((p) => p.discountPrice && p.discountPrice < p.price).slice(0, 3);
      if (deals.length > 0) {
        matchingProducts = deals;
        replyText = `Here are some of our hottest deals with instant discounts right now! 🏷️ Save up to **30%** on selected items:`;
        actionLinks = [{ label: 'View All Deals in Shop', view: 'shop', params: { dealsOnly: true } }];
      } else {
        replyText = "We have ongoing promotional offers across Electronics, Fashion, and Home appliances!";
      }
    }
    // 2. Shipping / Delivery
    else if (q.includes('shipping') || q.includes('delivery') || q.includes('courier') || q.includes('how long') || q.includes('arrive')) {
      replyText = `🚚 **NovaMart Fast Delivery Options:**\n\n• **Standard Delivery**: GH₵ 35 (Arrives within 24–48 hours across Greater Accra & Kumasi).\n• **Express Same-Day**: GH₵ 70 (Delivered within 3–6 hours in Accra/Tema).\n• **Free Delivery**: Free shipping automatically applied to all orders above **GH₵ 500**!\n• **Live Tracking**: You can track your parcel on our interactive GPS map anytime.`;
      actionLinks = [{ label: 'Track An Existing Order', view: 'track-order' }];
    }
    // 3. Payment Methods (MoMo, Card, COD)
    else if (q.includes('momo') || q.includes('mobile money') || q.includes('payment') || q.includes('pay') || q.includes('cash on delivery') || q.includes('card')) {
      replyText = `💳 **Supported Payment Methods:**\n\n1. **MTN Mobile Money & Telecel Cash** (Instant automated prompt or OTP).\n2. **Debit/Credit Card** (Visa, Mastercard via 256-bit secure Paystack gateway).\n3. **Cash On Delivery (COD)** (Pay conveniently upon parcel inspection at your doorstep).\n4. **NovaMart Store Credit / Gift Vouchers**.`;
    }
    // 4. Return Policy & Buyer Protection
    else if (q.includes('return') || q.includes('refund') || q.includes('warranty') || q.includes('authentic') || q.includes('fake')) {
      replyText = `🛡️ **Buyer Protection & 7-Day Guarantee:**\n\n• Every product on NovaMart is 100% verified and authentic from approved merchants.\n• You enjoy a **7-day hassle-free return policy** if an item is damaged, defective, or not as described.\n• Instant refunds are processed directly back to your Mobile Money or Card.`;
      actionLinks = [{ label: 'Read Return Policy', view: 'returns' }];
    }
    // 5. Seller / Vendor inquiries
    else if (q.includes('sell') || q.includes('vendor') || q.includes('merchant') || q.includes('register store')) {
      replyText = `🏪 **Sell on NovaMart Ghana:**\n\n• Low 5% commission rate.\n• Reach over 50,000+ active monthly shoppers.\n• Fast weekly/daily payouts via Mobile Money or Bank Transfer.\n• Free store analytics and marketing support.`;
      actionLinks = [{ label: 'Become a Seller Today', view: 'become-seller' }];
    }
    // 6. Fragrance / Perfume / Scent
    else if (q.includes('perfume') || q.includes('scent') || q.includes('fragrance') || q.includes('cologne') || q.includes('oud')) {
      const perfumes = catalogProducts.filter((p) =>
        p.categoryName?.toLowerCase().includes('beauty') ||
        p.name.toLowerCase().includes('fragrance') ||
        p.name.toLowerCase().includes('parfum') ||
        p.name.toLowerCase().includes('perfume') ||
        p.tags?.some((t) => t.toLowerCase().includes('fragrance'))
      ).slice(0, 3);

      matchingProducts = perfumes.length > 0 ? perfumes : catalogProducts.slice(0, 2);
      replyText = `✨ Discover our signature luxury fragrances and discovery sample boxes! Take our AI Scent Quiz for a custom tailored recommendation:`;
      actionLinks = [
        { label: 'Take AI Fragrance Quiz', view: 'scent-quiz' },
        { label: 'Explore Discovery Box', view: 'discovery-box' }
      ];
    }
    // 7. General Product Keyword Matching
    else {
      const keywords = q.split(' ').filter((w) => w.length > 2);
      const matches = catalogProducts.filter((p) => {
        const text = `${p.name} ${p.description} ${p.categoryName} ${p.brand} ${(p.tags || []).join(' ')}`.toLowerCase();
        return keywords.some((k) => text.includes(k));
      }).slice(0, 3);

      if (matches.length > 0) {
        matchingProducts = matches;
        replyText = `I found these products matching your request:`;
      } else {
        replyText = `I couldn't find an exact match for "${userQuery}", but here are our top-rated recommendations:`;
        matchingProducts = catalogProducts.filter((p) => (p.rating || 0) >= 4.5).slice(0, 2);
        actionLinks = [{ label: 'Browse Full Store Catalog', view: 'shop' }];
      }
    }

    const newAiMessage: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      products: matchingProducts.length > 0 ? matchingProducts : undefined,
      actionLinks: actionLinks.length > 0 ? actionLinks : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newAiMessage]);
    setIsTyping(false);
  };

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    generateResponse(textToSend);
  };

  return (
    <>
      {/* 1. Floating AI Trigger Button (Bottom Right) */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40"
        >
          <div className="relative group">
            {/* Glowing ring animation */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse" />

            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-full shadow-2xl border border-emerald-500/30 hover:border-emerald-400 transition-all group-hover:scale-105 cursor-pointer"
            >
              <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <span className="font-bold text-xs tracking-wide">Ask NovaAI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Floating AI Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 md:bottom-6 right-2 sm:right-6 z-50 w-[96vw] sm:w-[400px] h-[580px] max-h-[75vh] sm:max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Bot className="w-5 h-5 text-slate-950" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm">NovaAI Copilot</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      GPT-4o Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online • Ready to assist
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'msg-welcome',
                        sender: 'ai',
                        text: "Conversation cleared. How else can I assist you with your shopping today? ✨",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ])
                  }
                  title="Clear conversation"
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-slate-950/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/20'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>

                    {/* Embedded Product Recommendation Cards */}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        {m.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
                          >
                            <img
                              src={product.featuredImage || product.images?.[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-slate-800 flex-shrink-0 cursor-pointer"
                              onClick={() => {
                                setIsOpen(false);
                                onNavigate('product-detail', { productId: product.id });
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <h5
                                onClick={() => {
                                  setIsOpen(false);
                                  onNavigate('product-detail', { productId: product.id });
                                }}
                                className="text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 truncate cursor-pointer"
                              >
                                {product.name}
                              </h5>
                              <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                {formatPrice(product.discountPrice || product.price)}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                addToCart(product, 1);
                                setIsCartDrawerOpen(true);
                              }}
                              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex-shrink-0 transition-transform active:scale-95"
                              title="Add to Cart"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Links */}
                    {m.actionLinks && m.actionLinks.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1.5">
                        {m.actionLinks.map((link, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setIsOpen(false);
                              if (link.view === 'scent-quiz') {
                                onNavigate('scent-quiz');
                              } else {
                                onNavigate(link.view, link.params);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                          >
                            {link.label} <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="animate-pulse text-[11px]">NovaAI is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about products, orders, delivery..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
