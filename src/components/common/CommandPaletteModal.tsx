import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Mic,
  MicOff,
  X,
  Package,
  FolderTree,
  Store,
  Compass,
  Flame,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  History,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Product, Category } from '../../types/index';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, param?: any) => void;
  onOpenCart?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCart
}) => {
  const { formatPrice } = useSettings();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'categories' | 'vendors' | 'actions'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('novamart_recent_searches');
      return stored ? JSON.parse(stored) : ['Sony WH-1000XM5', 'Blender', 'iPhone', 'Perfume'];
    } catch {
      return ['Sony WH-1000XM5', 'Blender', 'iPhone', 'Perfume'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadInitialData();
    } else {
      setQuery('');
      setIsListening(false);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.getCategories(),
        api.getProducts({ limit: 8 })
      ]);
      if (catRes) setCategories(catRes);
      if (prodRes?.products) setProducts(prodRes.products);
    } catch (e) {
      console.warn('Command palette preload error', e);
    }
  };

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.getProducts({ search: query.trim(), limit: 10 });
        if (res?.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Command search error', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Voice Search Web Speech API
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        saveRecentSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Voice recognition error', e);
      setIsListening(false);
    }
  };

  const saveRecentSearch = (text: string) => {
    if (!text.trim()) return;
    const updated = [text.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== text.trim().toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('novamart_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectProduct = (product: Product) => {
    saveRecentSearch(product.name);
    onClose();
    onNavigate('product-detail', { productId: product.id });
  };

  const handleSelectCategory = (cat: Category) => {
    saveRecentSearch(cat.name);
    onClose();
    onNavigate('shop', { category: cat.id });
  };

  const handleSelectAction = (actionView: string, params?: any) => {
    onClose();
    if (actionView === 'cart' && onOpenCart) {
      onOpenCart();
    } else {
      onNavigate(actionView, params);
    }
  };

  const quickActions = [
    {
      title: 'Track Your Order',
      desc: 'Enter order number for live GPS tracking & courier ETA',
      icon: <Package className="w-5 h-5 text-emerald-500" />,
      action: () => handleSelectAction('track-order')
    },
    {
      title: 'Flash Sales & Hot Deals',
      desc: 'Up to 50% discount on tech, fashion & groceries',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      action: () => handleSelectAction('shop', { dealsOnly: true })
    },
    {
      title: 'AI Fragrance & Gift Quiz',
      desc: 'Personalized scent & lifestyle recommendations',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      action: () => handleSelectAction('scent-quiz')
    },
    {
      title: 'Become a Verified Seller',
      desc: 'Open your digital store & reach millions across Ghana',
      icon: <Store className="w-5 h-5 text-blue-500" />,
      action: () => handleSelectAction('become-seller')
    },
    {
      title: 'Customer Dashboard & Orders',
      desc: 'View order history, addresses, and saved cards',
      icon: <Clock className="w-5 h-5 text-indigo-500" />,
      action: () => handleSelectAction('account')
    }
  ];

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md">
        {/* Click backdrop to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Command Palette Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] z-10"
        >
          {/* Header Search Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories, or press Esc to close..."
              className="flex-1 bg-transparent border-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-base"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && query.trim()) {
                  saveRecentSearch(query.trim());
                  onClose();
                  onNavigate('shop', { search: query.trim() });
                }
              }}
            />

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              title={isListening ? 'Listening... Speak now' : 'Voice Search'}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening && <span className="hidden sm:inline">Listening...</span>}
            </button>

            {/* Clear or Close */}
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="hidden sm:inline text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">
                ESC
              </span>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center px-4 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 gap-2 overflow-x-auto text-xs">
            {(['all', 'products', 'categories', 'actions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div ref={resultsRef} className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Recent Searches (shown when no query) */}
            {!query && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Recent Searches
                  </span>
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('novamart_recent_searches');
                    }}
                    className="text-slate-400 hover:text-rose-500 lowercase text-[11px]"
                  >
                    Clear history
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions (when 'all' or 'actions' and no long query) */}
            {(activeTab === 'all' || activeTab === 'actions') && !query && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                  Quick Navigation & Services
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickActions.map((qa, i) => (
                    <button
                      key={i}
                      onClick={qa.action}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-100 dark:border-slate-800 text-left transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {qa.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                          {qa.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {qa.desc}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Categories */}
            {(activeTab === 'all' || activeTab === 'categories') && filteredCategories.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Categories ({filteredCategories.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filteredCategories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <FolderTree className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                        {cat.itemCount || 10}+
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Products */}
            {(activeTab === 'all' || activeTab === 'products') && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                  <span>Products {products.length > 0 ? `(${products.length})` : ''}</span>
                  {query && (
                    <button
                      onClick={() => {
                        saveRecentSearch(query);
                        onClose();
                        onNavigate('shop', { search: query });
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      View all results <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Searching catalog...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No products found matching "{query}". Try another keyword or browse categories.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {products.slice(0, 6).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left group"
                      >
                        <img
                          src={product.featuredImage || product.images?.[0]}
                          alt={product.name}
                          className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {formatPrice(product.discountPrice || product.price)}
                            </span>
                            {product.discountPrice && (
                              <span className="line-through text-slate-400 text-[10px]">
                                {formatPrice(product.price)}
                              </span>
                            )}
                            <span>•</span>
                            <span className="truncate">{product.categoryName}</span>
                          </div>
                        </div>
                        {product.stockQuantity > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Out of Stock
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-[10px]">
                  ↵
                </kbd>{' '}
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-[10px]">
                  ESC
                </kbd>{' '}
                to close
              </span>
            </div>
            <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NovaMart Instant Search
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
