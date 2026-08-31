import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Share2,
  PhoneCall,
  Zap,
  MessageSquarePlus,
  Clock,
  ArrowRight,
  Maximize2,
  X,
  Package,
  HelpCircle,
  ChevronDown,
  Info,
  CheckCircle2,
  Store,
  Scale,
  Bot,
  Send,
  ThumbsUp
} from 'lucide-react';

import { Product, ProductVariation, Review } from '../types/index';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { ReviewModal } from '../components/common/ReviewModal';
import { ProductCard } from '../components/common/ProductCard';
import { api } from '../services/api';
import { generateWhatsAppProductLink } from '../utils/whatsappHelper';

interface ProductDetailViewProps {
  productId: string;
  allProducts?: Product[];
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  allProducts,
  onNavigate,
  onOpenQuickView
}) => {
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { formatPrice, settings, country, countryConfig } = useSettings();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [relatedProductsList, setRelatedProductsList] = useState<Product[]>([]);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'box' | 'faq' | 'shipping' | 'reviews' | 'ai_assistant'>('description');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{ q: string; a: string } | null>(null);
  const [isAnsweringAI, setIsAnsweringAI] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Load product data (stable, no infinite loop)
  useEffect(() => {
    let isMounted = true;
    const targetId = productId || 'prod-portable-blender';

    const loadProductData = async () => {
      setIsLoadingProduct(true);
      setSelectedImageIndex(0);

      // Check if product is already present in allProducts array
      if (allProducts && allProducts.length > 0) {
        const found = allProducts.find((p) => p.id === targetId || p.slug === targetId);
        if (found) {
          if (isMounted) {
            setProduct(found);
            addRecentlyViewed(found);
            if (found.variations && found.variations.length > 0) {
              setSelectedVariation(found.variations[0]);
            } else {
              setSelectedVariation(undefined);
            }
            setQuantity(1);
            setIsLoadingProduct(false);
          }
          return;
        }
      }

      // Fetch from API directly
      try {
        const res = await api.getProduct(targetId);
        if (isMounted && res && res.product) {
          setProduct(res.product);
          addRecentlyViewed(res.product);
          if (res.product.variations && res.product.variations.length > 0) {
            setSelectedVariation(res.product.variations[0]);
          } else {
            setSelectedVariation(undefined);
          }
          setRelatedProductsList(res.related || []);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        if (isMounted) {
          setIsLoadingProduct(false);
        }
      }
    };

    loadProductData();
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Load reviews
  useEffect(() => {
    let isMounted = true;
    const targetId = productId || 'prod-portable-blender';
    
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const res = await api.getProductReviews(targetId);
        if (isMounted) {
          setReviewsList(res || []);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false);
        }
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (isLoadingProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading product details & gallery...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for might have been retired or moved.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
        >
          Return to Superstore Catalog
        </button>
      </div>
    );
  }

  // Multi-image list
  const rawImages = product.images && product.images.length > 0 ? product.images : [product.featuredImage];
  const imagesList = Array.from(new Set(rawImages.filter(Boolean)));
  const currentImage = imagesList[selectedImageIndex] || product.featuredImage;

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const isLiked = isInWishlist(product.id);
  const currentPrice = selectedVariation
    ? selectedVariation.discountPrice || selectedVariation.price
    : product.discountPrice || product.price;

  const regularPrice = selectedVariation ? selectedVariation.price : product.price;
  const discountPercent = regularPrice > currentPrice
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : null;

  const availableStock = selectedVariation ? selectedVariation.stockQuantity : product.stockQuantity;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (addToCart(product, selectedVariation, quantity)) {
      showToast(`${product.name} added to your shopping bag`, 'success');
      setIsCartDrawerOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (addToCart(product, selectedVariation, quantity)) {
      onNavigate('checkout');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on NovaMart Ghana!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  const safeAllProducts = Array.isArray(allProducts) ? allProducts : [];
  const relatedProducts = (relatedProductsList.length > 0 ? relatedProductsList : safeAllProducts)
    .filter((p) => p.id !== product.id && (!product.categoryId || p.categoryId === product.categoryId))
    .slice(0, 4);

  // Dynamic FAQs based on product category & details
  const productFaqs = [
    {
      q: `Is this ${product.name} 100% genuine and brand new?`,
      a: `Yes, absolutely. All items sold on NovaMart Ghana are 100% brand new, authentic, and sourced directly from official manufacturers or authorized distributors. Each unit arrives in sealed original packaging with full documentation.`
    },
    {
      q: 'How fast will my order arrive in Ghana?',
      a: 'Orders within Accra and Tema are delivered same-day or within 24 hours. For Kumasi, Takoradi, Tamale, and all other 16 regions, delivery takes 1 to 3 business days via our secure door-to-door courier.'
    },
    {
      q: 'What payment methods can I use at checkout?',
      a: 'We support all major Ghanaian payment methods including MTN Mobile Money (MoMo), Telecel Cash, AT Money, Visa & Mastercard, Bank Cards, and Cash on Delivery (COD) in Accra & Tema.'
    },
    {
      q: 'What is your return and warranty policy?',
      a: 'This product includes our 7-Day Hassle-Free Return Guarantee and a minimum 12-Month Official Manufacturer Warranty against defects. If you experience any issues, our dedicated customer support team is available on WhatsApp.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
        <button onClick={() => onNavigate('home')} className="hover:text-emerald-600 transition-colors cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('shop')} className="hover:text-emerald-600 transition-colors cursor-pointer">
          Shop
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => onNavigate('shop', { category: product.categoryId })}
          className="hover:text-emerald-600 transition-colors font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer"
        >
          {product.categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[240px]">
          {product.name}
        </span>
      </div>

      {/* 2. PRODUCT STAGE (LEFT MULTI-IMAGE GALLERY, RIGHT ACTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left: Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-lg flex items-center justify-center group">
            {discountPercent && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black tracking-wide shadow-md flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>SAVE {discountPercent}%</span>
              </span>
            )}

            {/* Photo Counter Badge */}
            {imagesList.length > 1 && (
              <span className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                Photo {selectedImageIndex + 1} of {imagesList.length}
              </span>
            )}

            {/* Wishlist & Lightbox Zoom Buttons */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setIsLightboxOpen(true)}
                title="Click to zoom in high resolution"
                className="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-emerald-600 backdrop-blur-md shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-2xl backdrop-blur-md shadow-md transition-all hover:scale-105 cursor-pointer ${
                  isLiked
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Main Image (Stable, smooth transition, no jitter) */}
            <img
              key={currentImage}
              src={currentImage}
              alt={`${product.name} - View ${selectedImageIndex + 1}`}
              onClick={() => setIsLightboxOpen(true)}
              className="w-full h-full object-cover cursor-zoom-in transition-opacity duration-300"
            />

            {/* Previous / Next Arrows Overlay */}
            {imagesList.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-lg hover:bg-emerald-600 hover:text-white transition-all backdrop-blur-sm opacity-90 hover:opacity-100 hover:scale-110 z-10 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-lg hover:bg-emerald-600 hover:text-white transition-all backdrop-blur-sm opacity-90 hover:opacity-100 hover:scale-110 z-10 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Interactive Thumbnails Carousel Strip */}
          {imagesList.length > 1 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Multiple Angles & Product Photos ({imagesList.length}):</span>
                <span className="text-emerald-600 dark:text-emerald-400">Click to preview</span>
              </p>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {imagesList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIndex === i
                        ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-105 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    {selectedImageIndex === i && (
                      <span className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Details, Variations & Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">
              <span className="uppercase tracking-wider text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
                {product.brand}
              </span>
              <span>SKU: <strong className="text-slate-800 dark:text-slate-200">{selectedVariation?.sku || product.sku}</strong></span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Share */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {(product.rating ?? 5).toFixed(1)}
                </span>
                <span className="text-xs text-slate-500">
                  ({reviewsList.length || product.reviewCount} verified buyer reviews)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="btn-detail-compare"
                  onClick={() => product && addToCompare(product)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                    product && isInCompare(product.id)
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{product && isInCompare(product.id) ? 'Comparing' : 'Compare'}</span>
                </button>

                <button
                  id="btn-detail-wishlist"
                  onClick={() => product && toggleWishlist(product)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                    product && isInWishlist(product.id)
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${product && isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  <span>{product && isInWishlist(product.id) ? 'Saved' : 'Wishlist'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer px-2 py-1"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-baseline justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatPrice(currentPrice)}
                </span>
                {regularPrice > currentPrice && (
                  <span className="text-sm text-slate-500 line-through font-semibold">
                    {formatPrice(regularPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Inclusive of VAT &amp; Ghana customs duties. Free returns within 7 days.
              </p>
            </div>

            <div className="text-right shrink-0">
              {availableStock > 0 ? (
                <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>{availableStock} in Stock</span>
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Verified Seller / Vendor Card */}
          <div
            onClick={() => {
              if (product.vendorId) {
                onNavigate('vendor-store', { vendorId: product.vendorId });
              }
            }}
            className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between gap-3 text-xs cursor-pointer hover:border-amber-400 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Sold &amp; Fulfilled By</p>
                <p className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  {product.vendorName || 'NovaMart Official Flagship'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider border border-amber-300 dark:border-amber-800">
                Verified Merchant
              </span>
              <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Quick Summary Highlights */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Hybrid Market Delivery & Origin Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.originCountry === country || (!product.originCountry && country === 'GH') ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20 flex items-center gap-1">
                      <span>{country === 'NG' ? '🇳🇬' : '🇬🇭'}</span>
                      <span>In-Stock Local Warehouse ({product.originCity || (country === 'NG' ? 'Lagos, Nigeria' : 'Accra, Ghana')})</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-500/20 flex items-center gap-1">
                      <span>✈️</span>
                      <span>Cross-Border Dispatch ({product.originCountry === 'NG' ? 'Nigeria 🇳🇬' : 'Ghana 🇬🇭'})</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {product.originCountry === country || (!product.originCountry && country === 'GH')
                    ? '⚡ Express: 24–48 Hours'
                    : '📦 Transit: 4–6 Days'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {product.originCountry === country || (!product.originCountry && country === 'GH')
                  ? `Delivers directly from our local ${countryConfig.hubName} to your doorstep in ${countryConfig.name}.`
                  : `Secured cross-border fulfillment with tracking and customs clearance handled by NovaMart.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>100% Genuine Brand Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>7-Day Return & Replacement</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{country === 'NG' ? 'NIP Bank Transfer & Verve Card' : 'MTN MoMo & Card Payments'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Verified Merchant Warranty</span>
              </div>
            </div>
          </div>

          {/* Variations selector */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Select Option / Model:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedVariation?.id === v.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="ml-2 opacity-75 font-normal">
                      ({v.stockQuantity > 0 ? `${v.stockQuantity} left` : 'Sold out'})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Stepper + Add to Cart row — wraps to 2 lines on very small screens */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
                <button
                  id="btn-detail-qty-minus"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-xs text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  id="btn-detail-qty-plus"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart — takes remaining width */}
              <button
                id="btn-detail-add-to-cart"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 min-w-[140px] py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-slate-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>
            </div>

            {/* Buy Now — always full width below stepper row */}
            <button
              id="btn-detail-buy-now"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now — Express Checkout</span>
            </button>

            {/* Quick Order via WhatsApp */}
            <a
              id="btn-detail-whatsapp-order"
              href={generateWhatsAppProductLink(product, selectedVariation || undefined, settings.socialLinks?.whatsapp || '233245550199')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Order & Product Inquiries via WhatsApp</span>
            </a>
          </div>

          {/* Value Blocks */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Express Delivery</p>
                <p className="text-[10px] text-slate-500">Accra, Tema & Nationwide across Ghana</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Official Warranty</p>
                <p className="text-[10px] text-slate-500">12 Months manufacturer cover included</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EXTENDED DETAIL TABS: DESCRIPTION, SPECS, WHAT'S IN THE BOX, FAQS, SHIPPING, REVIEWS */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-px -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'description', label: 'Overview', icon: Info },
            { id: 'specs', label: 'Specs', icon: Sparkles },
            { id: 'box', label: "In The Box", icon: Package },
            { id: 'ai_assistant', label: '✨ Ask Product AI', icon: Bot },
            { id: 'faq', label: 'FAQs', icon: HelpCircle },
            { id: 'shipping', label: 'Delivery', icon: Truck },
            { id: 'reviews', label: `Reviews (${reviewsList.length || product.reviewCount})`, icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 font-bold text-xs tracking-wide transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="py-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'description' && (
            <div className="max-w-4xl space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Product Description</h3>
                <p className="leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              {/* Highlights Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>100% Genuine Physical Inventory</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Stocked directly in our Accra fulfilment warehouse. Every item is inspected for quality and serial-verified prior to dispatch.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 space-y-2">
                  <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>Fast Express Doorstep Dispatch</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Same-day delivery across Accra & Tema. Real-time SMS tracking updates and dispatch rider call confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="max-w-3xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Technical Specifications</h3>
              {product.specifications && (Array.isArray(product.specifications) ? product.specifications.length > 0 : Object.keys(product.specifications).length > 0) ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {Array.isArray(product.specifications)
                    ? product.specifications.map((spec: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-3 p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <span className="font-bold text-slate-600 dark:text-slate-400 capitalize">{spec.name || `Specification ${idx + 1}`}</span>
                          <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{String(spec.value || '')}</span>
                        </div>
                      ))
                    : Object.entries(product.specifications).map(([key, val]) => (
                        <div key={key} className="grid grid-cols-3 p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <span className="font-bold text-slate-600 dark:text-slate-400 capitalize">{key}</span>
                          <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}</span>
                        </div>
                      ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Standard manufacturer specifications are included in the boxed documentation.</p>
              )}
            </div>
          )}

          {/* TAB 3: WHAT'S IN THE BOX */}
          {activeTab === 'box' && (
            <div className="max-w-3xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Package Contents</h3>
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</h4>
                    <p className="text-[11px] text-slate-500">Official Retail Sealed Box</p>
                  </div>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1x {product.name}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standard Charging Cable & Accessories (where applicable)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>User Quick Start Manual (English)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>NovaMart Ghana Warranty & Authenticity Certificate</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB: ASK PRODUCT AI */}
          {activeTab === 'ai_assistant' && (
            <div className="max-w-3xl space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">NovaAI Product Intelligence</h3>
                    <p className="text-xs text-emerald-300/80">Ask any question about specifications, compatibility, or warranty</p>
                  </div>
                </div>

                {/* AI Review Sentiment Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>96% Satisfaction</span>
                    </div>
                    <p className="text-[11px] text-slate-300">High praise for durability, genuine build quality, and battery/motor reliability.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>100% Authentic</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Verified official serial-numbered batch with 7-day hassle-free replacement.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Express Dispatch</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Stocked locally for 24–48h courier delivery with MoMo payment on arrival.</p>
                  </div>
                </div>

                {/* Question Input Box */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const q = aiQuestion.trim();
                          if (!q) return;
                          setIsAnsweringAI(true);
                          setAiAnswer({
                            q: q,
                            a: `"${product.name}" is 100% genuine and fully tested. It comes with full warranty support, rapid dispatch across ${countryConfig.name}, and standard accessories included in the retail box.`
                          });
                          setIsAnsweringAI(false);
                          setAiQuestion('');
                        }
                      }}
                      placeholder={`Ask NovaAI anything about "${product.name}"...`}
                      className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <button
                      onClick={() => {
                        const q = aiQuestion.trim();
                        if (!q) return;
                        setIsAnsweringAI(true);
                        setAiAnswer({
                          q: q,
                          a: `"${product.name}" is 100% genuine and fully tested. It comes with full warranty support, rapid dispatch across ${countryConfig.name}, and standard accessories included in the retail box.`
                        });
                        setIsAnsweringAI(false);
                        setAiQuestion('');
                      }}
                      disabled={isAnsweringAI}
                      className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>Ask</span>
                    </button>
                  </div>

                  {/* Suggested AI Prompts */}
                  <div className="flex items-center gap-2 flex-wrap pt-3">
                    <span className="text-[11px] text-slate-400 font-semibold">Suggested:</span>
                    {[
                      'Is this suitable for daily use?',
                      'What warranty is included?',
                      'How fast is shipping to Accra/Lagos?',
                      'Can I pay via Mobile Money?'
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setIsAnsweringAI(true);
                          let answer = '';
                          if (suggestion.includes('daily use')) {
                            answer = `Yes! "${product.name}" is built for heavy-duty daily usage with high-grade components.`;
                          } else if (suggestion.includes('warranty')) {
                            answer = `"${product.name}" is covered by NovaMart's 100% Authenticity Guarantee and a 7-day hassle-free replacement policy.`;
                          } else if (suggestion.includes('shipping')) {
                            answer = `Express dispatch takes 24–48 hours for central cities with live SMS courier tracking.`;
                          } else {
                            answer = `Yes! We accept MTN Mobile Money, Telecel Cash, NIP Bank Transfer, Cards, and Cash on Delivery.`;
                          }
                          setAiAnswer({ q: suggestion, a: answer });
                          setIsAnsweringAI(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-[11px] font-medium transition-colors cursor-pointer border border-white/10"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Answer Bubble */}
                {aiAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-white/10 border border-emerald-500/40 text-xs space-y-2 mt-3"
                  >
                    <p className="font-bold text-emerald-300">Q: {aiAnswer.q}</p>
                    <p className="text-slate-100 leading-relaxed">🤖 NovaAI: {aiAnswer.a}</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}


          {/* TAB 4: FAQS */}
          {activeTab === 'faq' && (
            <div className="max-w-3xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {productFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          openFaqIndex === index ? 'rotate-180 text-emerald-600' : ''
                        }`}
                      />
                    </button>
                    {openFaqIndex === index && (
                      <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SHIPPING & RETURNS */}
          {activeTab === 'shipping' && (
            <div className="max-w-3xl space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="space-y-3">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Delivery Options in Ghana</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Accra & Tema Metro</p>
                    <p className="text-xs text-slate-500">Same-Day / 24-Hour Dispatch. Free on orders over GH₵ 500.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Nationwide Regions</p>
                    <p className="text-xs text-slate-500">1 to 3 Business Days (Kumasi, Takoradi, Sunyani, Tamale, etc.).</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">7-Day Free Returns Policy</h4>
                <p className="text-xs">
                  We guarantee satisfaction. If your item arrives damaged, missing parts, or not as described, request a replacement or full refund within 7 calendar days of delivery.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-4xl">
              {/* Review summary & write review CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {(product.rating ?? 5).toFixed(1)}
                    </span>
                    <div className="flex items-center text-amber-400 justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Based on {reviewsList.length || product.reviewCount} reviews</p>
                  </div>

                  <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 hidden sm:block">
                    <p>⭐ 98% of customers recommend this item</p>
                    <p>🛡️ All reviews from verified buyers across Ghana</p>
                  </div>
                </div>

                <button
                  id="btn-write-review"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Write a Product Review</span>
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 space-y-2">
                    <p className="text-xs">No reviews submitted yet for this product.</p>
                    <p className="text-[11px]">Be the first buyer to review!</p>
                  </div>
                ) : (
                  reviewsList.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{rev.userName}</h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified Buyer</span>
                            </span>
                            {rev.location && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                • {rev.location}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-amber-400 mt-1">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className={`w-3.5 h-3.5 ${j < rev.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>

                      {rev.title && (
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                          {rev.title}
                        </h5>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Customer Uploaded Photos */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          {rev.images.map((img, imgIdx) => (
                            <div
                              key={imgIdx}
                              onClick={() => {
                                setIsLightboxOpen(true);
                              }}
                              className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer shadow-xs transition-transform hover:scale-105"
                            >
                              <img src={img} alt="Customer review photo" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))

                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">
                More in {product.categoryName}
              </p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Recommended For You
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop', { category: product.categoryId })}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <span>Explore Department</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onOpenQuickView={onOpenQuickView}
                onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. FULLSCREEN LIGHTBOX ZOOM MODAL */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            >
              {/* Close Lightbox */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute -top-12 right-0 p-2.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors z-20 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Main Lightbox Photo */}
              <div className="relative w-full max-h-[75vh] flex items-center justify-center rounded-3xl overflow-hidden bg-black/40">
                <img
                  src={currentImage}
                  alt={`${product.name} - Full Resolution`}
                  className="max-h-[75vh] max-w-full object-contain rounded-2xl"
                />

                {/* Prev / Next in Lightbox */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white shadow-xl backdrop-blur-md transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white shadow-xl backdrop-blur-md transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Lightbox Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto p-2">
                  {imagesList.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedImageIndex === i
                          ? 'border-emerald-500 scale-110 shadow-lg'
                          : 'border-white/30 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          productId={product.id}
          productName={product.name}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => {
            api.getProductReviews(product.id).then((res) => setReviewsList(res || []));
          }}
        />
      )}

      {/* 6. STICKY MOBILE BOTTOM ACTION BAR */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 shadow-2xl flex items-center justify-between gap-3 safe-area-bottom">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-slate-400 truncate">{product.name}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-[10px] text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(product)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-500'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            id="btn-mobile-sticky-add-cart"
            onClick={() => {
              if (product.variations && product.variations.length > 0 && !selectedVariation) {
                showToast('info', 'Choose Option', 'Please select a model/size above.');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              } else {
                handleAddToCart();
                setIsCartDrawerOpen(true);
              }
            }}
            disabled={product.stockQuantity <= 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
