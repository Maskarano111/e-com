import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Plus,
  Trash2,
  ShoppingBag,
  Gift,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { Product } from '../types/index';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';

interface DiscoveryBoxViewProps {
  onNavigate: (view: string, param?: any) => void;
}

export const DiscoveryBoxView: React.FC<DiscoveryBoxViewProps> = ({ onNavigate }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { formatPrice, settings } = useSettings();

  const [boxSize, setBoxSize] = useState<3 | 5>(3);
  const [selectedDecants, setSelectedDecants] = useState<Product[]>([]);
  const [cardMessage, setCardMessage] = useState('');
  const [perfumes, setPerfumes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Box Pricing
  const boxPrice = boxSize === 3 ? 850 : 1350;

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        const res = await api.getProducts({ limit: 20 });
        const filtered = (res.products || []).filter(
          (p) => p.categoryId === 'cat-perfumes' || p.categoryId === 'cat-oud'
        );
        setPerfumes(filtered.length > 0 ? filtered : res.products || []);
      } catch (err) {
        console.error('Failed to load discovery products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, []);

  const handleSelectProduct = (product: Product) => {
    if (selectedDecants.some((p) => p.id === product.id)) {
      setSelectedDecants(selectedDecants.filter((p) => p.id !== product.id));
      return;
    }
    if (selectedDecants.length >= boxSize) {
      showToast(`Your ${boxSize}-piece box is already full! Remove a scent first.`, 'info');
      return;
    }
    setSelectedDecants([...selectedDecants, product]);
    showToast(`Added ${product.name} 10ml Decant to your box!`, 'success');
  };

  const handleRemoveDecant = (productId: string) => {
    setSelectedDecants(selectedDecants.filter((p) => p.id !== productId));
  };

  const handleAddToCart = () => {
    if (selectedDecants.length < boxSize) {
      showToast(`Please select ${boxSize - selectedDecants.length} more scent(s) to complete your box.`, 'error');
      return;
    }

    const boxProduct: Product = {
      id: `custom-box-${Date.now()}`,
      name: `Custom ${boxSize}-Piece Luxury Fragrance Discovery Box`,
      slug: `custom-${boxSize}-piece-discovery-box`,
      description: `Bespoke curated 10ml travel spray collection: ${selectedDecants.map((p) => p.name).join(', ')}. ${cardMessage ? `Greeting: "${cardMessage}"` : ''}`,
      shortDescription: `${boxSize} x 10ml Deluxe Atomizers in Magnetic Velvet Box`,
      categoryId: 'cat-gift-sets',
      brand: 'Nova Luxury Concierge',
      sku: `BOX-${boxSize}PC-${Date.now().toString().slice(-4)}`,
      price: boxPrice,
      stockQuantity: 99,
      status: 'active',
      featured: true,
      rating: 5,
      reviewCount: 1,
      images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'],
      featuredImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      specifications: [
        { name: 'Decant Count', value: `${boxSize} x 10ml atomizers` },
        { name: 'Included Perfumes', value: selectedDecants.map((p) => p.name).join(', ') },
        { name: 'Personalized Card', value: cardMessage || 'Complimentary gift wrap' }
      ],
      tags: ['discovery-box', 'custom-set', 'gift'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addItem(boxProduct, 1);
    showToast('Custom Discovery Box added to cart!', 'success');
    onNavigate('cart');
  };

  const handleWhatsAppOrder = () => {
    if (selectedDecants.length < boxSize) {
      showToast(`Please select ${boxSize - selectedDecants.length} more scent(s) to complete your box.`, 'error');
      return;
    }

    const scentsList = selectedDecants.map((s, i) => `${i + 1}. ${s.name} (10ml)`).join('\n');
    const msg = `Hello NovaMart Concierge! 🎁✨\n\nI want to order a Custom *${boxSize}-Piece Luxury Fragrance Discovery Box* (GH₵ ${boxPrice}):\n\n*Selected Scents:*\n${scentsList}\n\n*Gift Card Message:* ${cardMessage || 'None'}\n\nPlease confirm availability and delivery in Ghana!`;

    const cleanPhone = (settings.storePhone || '233245550199').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
          <Gift className="w-3.5 h-3.5" />
          <span>Interactive Fragrance Discovery Studio</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Build Your Custom Scent Discovery Box
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Choose your favorite 10ml deluxe decants from our authenticated French & Arabian perfume vault.
          Presented in a magnetic velvet keepsake box with complimentary greeting card.
        </p>
      </div>

      {/* Main Grid: Left Selection, Right Live Box Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: Catalog Picker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Box Size */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Choose Your Box Size</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setBoxSize(3);
                  if (selectedDecants.length > 3) setSelectedDecants(selectedDecants.slice(0, 3));
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  boxSize === 3
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">3-Decant Discovery Box</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">3 x 10ml Deluxe Sprays</p>
                </div>
                <span className="text-sm font-black text-emerald-600">{formatPrice(850)}</span>
              </button>

              <button
                onClick={() => setBoxSize(5)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  boxSize === 5
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">5-Decant Discovery Box</p>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500 text-white rounded-full">POPULAR</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">5 x 10ml Deluxe Sprays</p>
                </div>
                <span className="text-sm font-black text-emerald-600">{formatPrice(1350)}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Select Scents */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Select {boxSize} Fragrances ({selectedDecants.length}/{boxSize} Chosen)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {perfumes.map((product) => {
                const isSelected = selectedDecants.some((p) => p.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.featuredImage || product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">{product.brand}</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.name}</h4>
                        <span className="text-[10px] text-emerald-600 font-semibold">10ml Travel Decant</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-500">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Personalized Engraved Message */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Gift Card Greeting (Optional)</span>
            </h3>
            <textarea
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              placeholder="e.g. Happy Birthday Kwame! May your aura always smell exquisite. With love from Ama."
              rows={2}
              maxLength={150}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 text-right">{cardMessage.length}/150 characters</p>
          </div>
        </div>

        {/* RIGHT 1 COL: Live Box Preview & Checkout */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Live Preview</span>
                <h3 className="text-lg font-bold text-white">Your Discovery Box</h3>
              </div>
              <span className="text-lg font-black text-emerald-400">{formatPrice(boxPrice)}</span>
            </div>

            {/* Visual Decant Slots */}
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Slots filled: <span className="font-bold text-white">{selectedDecants.length} of {boxSize}</span>
              </p>

              <div className="space-y-2.5">
                {[...Array(boxSize)].map((_, index) => {
                  const decant = selectedDecants[index];
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        decant
                          ? 'border-emerald-500/50 bg-slate-900 text-white'
                          : 'border-dashed border-slate-800 bg-slate-900/40 text-slate-500'
                      }`}
                    >
                      {decant ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-bold text-emerald-400">#{index + 1}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate max-w-[170px]">{decant.name}</p>
                              <span className="text-[10px] text-slate-400">10ml Spray</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveDecant(decant.id)}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                          <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                            {index + 1}
                          </span>
                          <span>Empty Decant Slot</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guarantee badges */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Authentic Extrait / EDP Decants</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Includes Magnetic Velvet Presentation Box</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nationwide Courier Delivery in Ghana</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={selectedDecants.length < boxSize}
                className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  selectedDecants.length === boxSize
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 active:scale-98 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {selectedDecants.length === boxSize
                    ? `Add Custom Box to Cart (${formatPrice(boxPrice)})`
                    : `Select ${boxSize - selectedDecants.length} More Scent(s)`}
                </span>
              </button>

              <button
                onClick={handleWhatsAppOrder}
                disabled={selectedDecants.length < boxSize}
                className="w-full py-3 rounded-2xl border border-emerald-500/40 hover:bg-emerald-950/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp Concierge</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
