import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Store,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Package,
  CheckCircle2,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { Vendor, Product } from '../types/index';
import { ProductCard } from '../components/common/ProductCard';
import { useSettings } from '../context/SettingsContext';

interface VendorStoreViewProps {
  vendorId: string;
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView: (product: Product) => void;
}

export const VendorStoreView: React.FC<VendorStoreViewProps> = ({
  vendorId,
  onNavigate,
  onOpenQuickView
}) => {
  const { formatPrice } = useSettings();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoreData = async () => {
      setIsLoading(true);
      try {
        const [vendorRes, prodsRes] = await Promise.all([
          api.getVendorById(vendorId || 'vend-kofi'),
          api.getVendorProducts(vendorId || 'vend-kofi')
        ]);
        setVendor(vendorRes);
        setProducts(prodsRes.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoreData();
  }, [vendorId]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('shop')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </button>

      {/* Store Banner & Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl">
        {/* Banner image background */}
        <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-slate-800">
          <img
            src={
              vendor?.banner ||
              'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80'
            }
            alt="Store Banner"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Profile Details Bar */}
        <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <img
              src={
                vendor?.logo ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'
              }
              alt={vendor?.storeName || 'Vendor'}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-2xl bg-white shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {vendor?.storeName || 'Kofi Tech & Audio Hub'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Verified Merchant
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {vendor?.description || 'Authorized retailer for guaranteed genuine tech and accessories in Ghana.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {vendor?.rating?.toFixed(1) || '4.8'} ({vendor?.reviewCount || 64} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {vendor?.address || 'Osu, Accra'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {vendor?.phone || '+233 24 888 1234'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${(vendor?.phone || '233248881234').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Seller</span>
            </a>
          </div>
        </div>
      </div>

      {/* Catalog Search & Department Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Store Catalog ({products.length} Products)
          </h2>
          <p className="text-xs text-slate-500">Genuine items listed by {vendor?.storeName}</p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this store..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-hidden focus:border-emerald-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          No items found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpenQuickView={onOpenQuickView}
              onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
