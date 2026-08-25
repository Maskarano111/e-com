import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  Sparkles,
  Share2,
  PhoneCall,
  Zap,
  MessageSquarePlus,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Product, ProductVariation, Review } from '../types/index';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
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
  allProducts = [],
  onNavigate,
  onOpenQuickView
}) => {
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, settings } = useSettings();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProductsList, setRelatedProductsList] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'reviews'>('description');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  // Load product data
  useEffect(() => {
    const loadProductData = async () => {
      setIsLoadingProduct(true);
      if (allProducts && allProducts.length > 0) {
        const found = allProducts.find((p) => p.id === productId);
        if (found) {
          setProduct(found);
          setSelectedImage(found.featuredImage);
          if (found.variations && found.variations.length > 0) {
            setSelectedVariation(found.variations[0]);
          } else {
            setSelectedVariation(undefined);
          }
          setQuantity(1);
          setIsLoadingProduct(false);
          return;
        }
      }

      // Fetch from API directly
      try {
        const res = await api.getProduct(productId);
        if (res && res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.featuredImage);
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
        setIsLoadingProduct(false);
      }
    };

    if (productId) {
      loadProductData();
    }
  }, [productId, allProducts]);

  // Load reviews
  const fetchReviews = async () => {
    if (!productId) return;
    setIsLoadingReviews(true);
    try {
      const data = await api.getReviews({ productId });
      setReviewsList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  if (isLoadingProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const currentPrice = selectedVariation
    ? selectedVariation.discountPrice || selectedVariation.price
    : product.discountPrice || product.price;

  const regularPrice = selectedVariation ? selectedVariation.price : product.price;
  const availableStock = selectedVariation ? selectedVariation.stockQuantity : product.stockQuantity;
  const isOutOfStock = availableStock <= 0;

  const discountPercent =
    regularPrice > currentPrice
      ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
      : null;

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.featuredImage];

  const handleAddToCart = () => {
    addToCart(product, selectedVariation, quantity);
  };

  const handleBuyNow = () => {
    if (addToCart(product, selectedVariation, quantity)) {
      onNavigate('checkout');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('info', 'Link Copied', 'Product link copied to clipboard.');
    }
  };

  const safeAllProducts = Array.isArray(allProducts) && allProducts.length > 0 ? allProducts : relatedProductsList;
  const relatedProducts = safeAllProducts
    .filter((p) => p.id !== product.id && (!product.categoryId || p.categoryId === product.categoryId))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-emerald-600 transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('shop')} className="hover:text-emerald-600 transition-colors">
          Shop
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => onNavigate('shop', { category: product.categoryId })}
          className="hover:text-emerald-600 transition-colors truncate max-w-[150px]"
        >
          {product.categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      {/* 2. PRODUCT STAGE (LEFT GALLERY, RIGHT ACTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center justify-center group">
            {discountPercent && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black tracking-wide shadow-md flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>SAVE {discountPercent}%</span>
              </span>
            )}

            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 z-10 p-3 rounded-2xl backdrop-blur-md shadow-md transition-all ${
                isLiked
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <img
              src={selectedImage || product.featuredImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase Options (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">
              <span className="uppercase tracking-wider text-emerald-600 font-bold">{product.brand}</span>
              <span>SKU: <strong className="text-slate-700 dark:text-slate-300">{selectedVariation?.sku || product.sku}</strong></span>
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
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-600">
                  ({reviewsList.length || product.reviewCount} customer reviews)
                </span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-baseline justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatPrice(currentPrice)}
                </span>
                {regularPrice > currentPrice && (
                  <span className="text-sm text-slate-600 line-through">
                    {formatPrice(regularPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Inclusive of all statutory taxes. Free returns within 7 days.
              </p>
            </div>

            <div className="text-right shrink-0">
              {availableStock > 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>{availableStock} in Stock</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Variations selector */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Select Option / Variation:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedVariation?.id === v.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="ml-2 opacity-75 font-normal">({v.stockQuantity > 0 ? `${v.stockQuantity} left` : 'Sold out'})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
                <button
                  id="btn-detail-qty-minus"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold"
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                id="btn-detail-add-to-cart"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-900 dark:bg-slate-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              {/* Buy Now (Express) */}
              <button
                id="btn-detail-buy-now"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Quick Order via WhatsApp */}
            <a
              id="btn-detail-whatsapp-order"
              href={generateWhatsAppProductLink(product, selectedVariation || undefined, settings.socialLinks?.whatsapp || '233245550199')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Order & Inquiry via WhatsApp Concierge</span>
            </a>
          </div>

          {/* Delivery & Trust Value Blocks */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Next-Day Delivery</p>
                <p className="text-[10px] text-slate-500">Accra, Kumasi & nationwide</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Official Warranty</p>
                <p className="text-[10px] text-slate-500">12 Months manufacturer cover</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABS SECTION: DESCRIPTION, SPECS, SHIPPING, REVIEWS */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
          <button
            id="tab-btn-desc"
            onClick={() => setActiveTab('description')}
            className={`px-6 py-3 font-bold text-xs tracking-wide transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'description'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Product Overview
          </button>
          <button
            id="tab-btn-specs"
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-3 font-bold text-xs tracking-wide transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Technical Specifications
          </button>
          <button
            id="tab-btn-shipping"
            onClick={() => setActiveTab('shipping')}
            className={`px-6 py-3 font-bold text-xs tracking-wide transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Shipping & Return Policy
          </button>
          <button
            id="tab-btn-reviews"
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-bold text-xs tracking-wide transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Customer Reviews ({reviewsList.length})
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="py-8">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>{product.description}</p>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 space-y-1">
                <h4 className="font-bold text-xs">Why buy from NovaMart Ghana?</h4>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li>Original physical inventory in Ghana (no waiting for international sea freight)</li>
                  <li>Fast dispatch via our dispatch fleet and trusted delivery partners</li>
                  <li>Receipt and warranty documents included in every package</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-3xl">
              {product.specifications && (Array.isArray(product.specifications) ? product.specifications.length > 0 : Object.keys(product.specifications).length > 0) ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {Array.isArray(product.specifications)
                    ? product.specifications.map((spec: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-3 p-3.5 bg-white dark:bg-slate-900">
                          <span className="font-bold text-slate-600 dark:text-slate-400 capitalize">{spec.name || `Spec ${idx + 1}`}</span>
                          <span className="col-span-2 text-slate-900 dark:text-white font-medium">{String(spec.value || '')}</span>
                        </div>
                      ))
                    : Object.entries(product.specifications).map(([key, val]) => (
                        <div key={key} className="grid grid-cols-3 p-3.5 bg-white dark:bg-slate-900">
                          <span className="font-bold text-slate-600 dark:text-slate-400 capitalize">{key}</span>
                          <span className="col-span-2 text-slate-900 dark:text-white font-medium">{typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}</span>
                        </div>
                      ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Detailed specifications available upon request from manufacturer catalog.</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Delivery Options in Ghana</h4>
              <ul className="list-disc pl-5 text-xs space-y-2">
                <li>
                  <strong>Accra & Tema Express:</strong> Delivered within 24 hours. Free delivery on orders over GH₵ 500.
                </li>
                <li>
                  <strong>Kumasi, Takoradi, Cape Coast, Tamale:</strong> 1-3 business days via verified courier service.
                </li>
                <li>
                  <strong>Self-Pickup:</strong> Pick up directly from our Airport City, Accra fulfilment hub at no shipping cost.
                </li>
              </ul>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white pt-2">7-Day Free Returns</h4>
              <p className="text-xs">
                If the product arrives damaged, defective, or incorrect, you can request an instant return or exchange within 7 calendar days of delivery.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Review summary & write review CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {product.rating.toFixed(1)}
                    </span>
                    <div className="flex items-center text-amber-400 justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Based on {reviewsList.length} reviews</p>
                  </div>

                  <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 hidden sm:block">
                    <p>⭐ 98% of customers recommend this item</p>
                    <p>🛡️ All reviews from verified buyers</p>
                  </div>
                </div>

                <button
                  id="btn-open-review-modal"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Write a Customer Review</span>
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">Be the first to review this product!</p>
                ) : (
                  reviewsList.map((review) => (
                    <div
                      key={review.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{review.userName}</span>
                          {review.isVerifiedPurchase && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-800'}`}
                          />
                        ))}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{review.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
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
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Related Products</h3>
              <p className="text-xs text-slate-500 mt-0.5">Customers who viewed this item also bought</p>
            </div>
            <button
              onClick={() => onNavigate('shop', { category: product.categoryId })}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenQuickView={onOpenQuickView}
                onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      <ReviewModal
        product={product}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
};
