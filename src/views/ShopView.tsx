import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Search,
  X,
  Star,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';
import { Product, Category } from '../types/index';
import { ProductCard } from '../components/common/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';

import { initialCategories, initialProducts } from '../data/initialData';

interface ShopViewProps {
  initialCategory?: string;
  initialSearch?: string;
  initialDealsOnly?: boolean;
  initialFlashDealOnly?: boolean;
  initialSortBy?: string;
  initialFeatured?: boolean;
  categories?: Category[];
  products?: Product[];
  onNavigate: (view: string, param?: any) => void;
  onOpenQuickView: (product: Product) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  initialCategory,
  initialSearch,
  initialDealsOnly = false,
  initialFlashDealOnly = false,
  initialSortBy = 'popular',
  initialFeatured = false,
  categories: propCategories,
  products: propProducts,
  onNavigate,
  onOpenQuickView
}) => {
  const { formatPrice, country, countryConfig } = useSettings();

  const [categories, setCategories] = useState<Category[]>(propCategories || initialCategories);
  const [products, setProducts] = useState<Product[]>(propProducts || initialProducts);
  const [isLoading, setIsLoading] = useState(false);

  // Sync props if provided
  useEffect(() => {
    if (propCategories) setCategories(propCategories);
    if (propProducts) setProducts(propProducts);
  }, [propCategories, propProducts]);

  // Self fetch products and categories if not passed
  useEffect(() => {
    if (!propProducts || propProducts.length === 0) {
      const loadShopData = async () => {
        setIsLoading(true);
        try {
          const [catRes, prodRes] = await Promise.all([
            api.getCategories(),
            api.getProducts({ limit: 50 })
          ]);
          setCategories(catRes || []);
          setProducts(prodRes?.products || []);
        } catch (err) {
          console.error('Failed to load shop products:', err);
        } finally {
          setIsLoading(false);
        }
      };
      loadShopData();
    }
  }, [propProducts]);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [originFilter, setOriginFilter] = useState<'all' | 'local_only' | 'GH' | 'NG'>('all');
  const [dealsOnly, setDealsOnly] = useState<boolean>(initialDealsOnly || initialFlashDealOnly);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(initialFeatured);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(30000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync props if changed
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (initialDealsOnly !== undefined || initialFlashDealOnly !== undefined) {
      setDealsOnly(initialDealsOnly || initialFlashDealOnly);
    }
  }, [initialDealsOnly, initialFlashDealOnly]);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Extract unique brands
  const allBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    safeProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [safeProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesTags = product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesBrand && !matchesTags) {
          return false;
        }
      }

      // Strict Country Market Isolation
      if (country === 'NG') {
        if (product.originCountry !== 'NG') return false;
      } else {
        if (product.originCountry && product.originCountry !== 'GH') return false;
      }


      // Deals only
      if (dealsOnly && (!product.discountPrice || product.discountPrice >= product.price)) {
        return false;
      }

      // Featured only
      if (featuredOnly && !product.featured) {
        return false;
      }

      // Selected brands
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Price ceiling
      const activePrice = product.discountPrice || product.price;
      if (activePrice > priceRange) {
        return false;
      }

      // In stock
      if (inStockOnly && product.stockQuantity <= 0) {
        return false;
      }

      // Min rating
      if (minRating > 0 && product.rating < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'popularity') return (b.reviewCount || 0) - (a.reviewCount || 0);

      // Smart Market Prioritization (Local warehouse items shown first)
      const aIsLocal = a.originCountry === country || (!a.originCountry && country === 'GH');
      const bIsLocal = b.originCountry === country || (!b.originCountry && country === 'GH');
      if (aIsLocal && !bIsLocal) return -1;
      if (!aIsLocal && bIsLocal) return 1;
      return 0;
    });
  }, [
    products,
    selectedCategory,
    searchQuery,
    originFilter,
    country,
    dealsOnly,
    featuredOnly,
    selectedBrands,
    priceRange,
    inStockOnly,
    minRating,
    sortBy
  ]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setDealsOnly(false);
    setFeaturedOnly(false);
    setSelectedBrands([]);
    setPriceRange(30000);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('popular');
  };

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (dealsOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    selectedBrands.length +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (priceRange < 30000 ? 1 : 0);

  const FilterSidebarContent = (
    <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-[11px] text-rose-600 hover:underline font-semibold"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Categories filter */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
          Categories
        </h4>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Products</span>
            <span className="text-[10px] text-slate-400">{products.length}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[10px] text-slate-400">{cat.productCount || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Max Price
          </h4>
          <span className="font-black text-emerald-600">{formatPrice(priceRange)}</span>
        </div>
        <input
          id="range-price-filter"
          type="range"
          min="100"
          max="30000"
          step="250"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>GH₵ 100</span>
          <span>GH₵ 30,000+</span>
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
          Offers & Stock
        </h4>
        <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <input
            type="checkbox"
            checked={dealsOnly}
            onChange={(e) => setDealsOnly(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span className="font-medium text-rose-600 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Discounted / Flash Deals</span>
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span className="font-medium text-slate-800 dark:text-slate-200">In Stock Only</span>
        </label>
      </div>

      {/* Brands Filter */}
      {allBrands.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Brands
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {allBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800 dark:text-slate-200">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Customer Rating Filter */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => setMinRating(minRating === stars ? 0 : stars)}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                minRating === stars
                  ? 'bg-amber-50 dark:bg-amber-950/40 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < stars ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}
                  />
                ))}
                <span className="text-slate-700 dark:text-slate-300 ml-1 text-xs font-semibold">& Up</span>
              </div>
              {minRating === stars && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
            <button onClick={() => onNavigate('home')} className="hover:text-emerald-600">Home</button>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Catalog</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-emerald-600 font-semibold">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {selectedCategory === 'all'
              ? searchQuery
                ? `Results for "${searchQuery}"`
                : 'All Products Catalog'
              : categories.find((c) => c.id === selectedCategory)?.name}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Showing <strong>{filteredProducts.length}</strong> items available in store
          </p>
        </div>

        {/* Top Controls: Search, Sort, View layout */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
          {/* Search input in shop - full width on mobile */}
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
            <input
              id="input-shop-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="pl-9 pr-8 py-2.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-emerald-500 outline-hidden w-full"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                id="select-shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer w-full"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Trigger Button */}
            <button
              id="btn-mobile-filter-open"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HYBRID MARKETPLACE ORIGIN & WAREHOUSE FILTER BAR */}
      <div className="flex items-center gap-2 pt-1 pb-1.5 overflow-x-auto no-scrollbar whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
          <span>📦</span>
          <span>Dispatch:</span>
        </span>
        <button
          type="button"
          onClick={() => setOriginFilter('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            originFilter === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>🌐</span>
          <span>All Warehouses ({safeProducts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setOriginFilter('local_only')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            originFilter === 'local_only'
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60'
          }`}
        >
          <span>⚡</span>
          <span>Local Express ({country === 'NG' ? 'Nigeria 🇳🇬' : 'Ghana 🇬🇭'} • 1–2 Days)</span>
        </button>
        <button
          type="button"
          onClick={() => setOriginFilter('NG')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            originFilter === 'NG'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>🇳🇬</span>
          <span>Nigeria Warehouses</span>
        </button>
        <button
          type="button"
          onClick={() => setOriginFilter('GH')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            originFilter === 'GH'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>🇬🇭</span>
          <span>Ghana Warehouses</span>
        </button>
      </div>

      {/* 3. ACTIVE FILTER BADGES */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mr-1">Active:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              Category: {categories.find((c) => c.id === selectedCategory)?.name}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              Keyword: "{searchQuery}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {dealsOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-xs font-semibold">
              Flash Deals Only
              <X className="w-3 h-3 cursor-pointer" onClick={() => setDealsOnly(false)} />
            </span>
          )}
          {selectedBrands.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 text-xs font-semibold"
            >
              Brand: {b}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleBrand(b)} />
            </span>
          ))}
          {priceRange < 30000 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold">
              Under {formatPrice(priceRange)}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange(30000)} />
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-rose-600 hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 3. MAIN CATALOG LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs h-fit sticky top-24">
          {FilterSidebarContent}
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                We couldn't find any products matching your current filters. Try relaxing your filters or searching for something else.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenQuickView={onOpenQuickView}
                  onNavigateToDetail={(id) => onNavigate('product-detail', { productId: id })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Filter Products</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {FilterSidebarContent}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Show Results ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
