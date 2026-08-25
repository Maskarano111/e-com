import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Compass,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ShoppingBag,
  MessageCircle,
  Flame,
  Heart,
  Droplets,
  Sun,
  Moon,
  Briefcase,
  Crown
} from 'lucide-react';
import { Product } from '../../types/index';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';

interface ScentQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onNavigateToProduct: (productId: string) => void;
  onNavigateToDiscovery: () => void;
}

export const ScentQuizModal: React.FC<ScentQuizModalProps> = ({
  isOpen,
  onClose,
  products,
  onNavigateToProduct,
  onNavigateToDiscovery
}) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { formatPrice, settings } = useSettings();

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<'all' | 'men' | 'women' | 'unisex'>('unisex');
  const [family, setFamily] = useState<string>('oud_amber');
  const [occasion, setOccasion] = useState<string>('evening');
  const [intensity, setIntensity] = useState<'beastmode' | 'moderate'>('beastmode');

  if (!isOpen) return null;

  // Compute recommendation
  const getMatchedProducts = () => {
    return products.filter((p) => {
      // Prioritize perfume categories
      return p.categoryId === 'cat-perfumes' || p.categoryId === 'cat-oud' || p.categoryId === 'cat-mists';
    }).slice(0, 3);
  };

  const matches = getMatchedProducts();

  const handleReset = () => {
    setStep(1);
    setGender('unisex');
    setFamily('oud_amber');
    setOccasion('evening');
    setIntensity('beastmode');
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Signature Scent Concierge
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Find your bespoke fragrance in 4 quick questions
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {step < 5 && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400">
                <span>Step {step} of 4</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`w-6 h-1.5 rounded-full transition-all ${
                        s <= step ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: For Whom */}
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  1. Who is this fragrance for?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'unisex', title: 'Unisex / Universal', desc: 'Versatile, genderless luxury', icon: Crown },
                    { id: 'men', title: 'For Him', desc: 'Bold woods, spices & oud', icon: Flame },
                    { id: 'women', title: 'For Her', desc: 'Floral, sweet gourmand & amber', icon: Heart }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setGender(item.id as any);
                          setStep(2);
                        }}
                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                          gender === item.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Scent Family */}
            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  2. What aroma note inspires you most?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'oud_amber', title: 'Arabian Oud, Amber & Saffron', desc: 'Opulent, deep, smoky, resinous warmth' },
                    { id: 'gourmand', title: 'Sweet Vanilla, Praline & Cinnamon', desc: 'Delicious, boozy, addictive dessert notes' },
                    { id: 'fresh_citrus', title: 'Fresh Citrus, Pineapple & Birch', desc: 'Crisp, invigorating, regal masculinity' },
                    { id: 'floral_musk', title: 'Egyptian Jasmine, Rose & White Musk', desc: 'Romantic, sensual, radiant floral bouquet' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFamily(item.id);
                        setStep(3);
                      }}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        family === item.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Occasion */}
            {step === 3 && (
              <div className="space-y-4">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  3. When will you wear this fragrance?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'evening', title: 'Evening Gala & Dates', desc: 'Head-turning night presence', icon: Moon },
                    { id: 'daily', title: 'Daily Signature & Office', desc: 'Refined, confident all-day aura', icon: Briefcase },
                    { id: 'special', title: 'Weddings & Celebrations', desc: 'Extravagant luxury statement', icon: Sparkles }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setOccasion(item.id);
                          setStep(4);
                        }}
                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                          occasion === item.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Projection */}
            {step === 4 && (
              <div className="space-y-4">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  4. Desired sillage & longevity?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'beastmode', title: 'Beast-Mode (16+ Hours)', desc: 'Leaves a magnificent scent trail in any room' },
                    { id: 'moderate', title: 'Intimate Sillage (8-12 Hours)', desc: 'Elegant, close to skin, whisper luxury' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIntensity(item.id as any);
                        setStep(5); // Show results!
                      }}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left flex flex-col gap-1 transition-all cursor-pointer"
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: MATCH RESULTS */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Your Bespoke Scent Matches</span>
                  </span>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    Tailored to Your Scent Profile
                  </h4>
                </div>

                <div className="space-y-3">
                  {matches.map((product, idx) => (
                    <div
                      key={product.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.featuredImage || product.images[0]}
                          alt={product.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                          onClick={() => {
                            onClose();
                            onNavigateToProduct(product.id);
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase text-emerald-600">
                              {idx === 0 ? '98% Match' : idx === 1 ? '94% Match' : '91% Match'}
                            </span>
                            <span className="text-[10px] text-slate-400">• {product.brand}</span>
                          </div>
                          <h5
                            className="text-xs font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors cursor-pointer line-clamp-1"
                            onClick={() => {
                              onClose();
                              onNavigateToProduct(product.id);
                            }}
                          >
                            {product.name}
                          </h5>
                          <p className="text-xs font-black text-emerald-600 mt-0.5">
                            {formatPrice(product.discountPrice || product.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discovery Box Promotion */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <p className="font-bold text-xs text-amber-900 dark:text-amber-300">
                      Want to sample all 3 before committing?
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Curate a Custom 3-Decant Discovery Box with 10ml travel sprays!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToDiscovery();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shrink-0"
                  >
                    Build Discovery Box
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
            {step > 1 && step < 5 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Back
              </button>
            ) : step === 5 ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restart Quiz</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
