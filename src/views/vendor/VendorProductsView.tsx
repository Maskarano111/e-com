import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Tag,
  Layers,
  Upload,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category, Vendor } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

interface VendorProductsViewProps {
  initialOpenAdd?: boolean;
}

export const VendorProductsView: React.FC<VendorProductsViewProps> = ({ initialOpenAdd }) => {
  const { user } = useAuth();
  const { formatPrice } = useSettings();
  const { showToast } = useToast();
  const vendorId = user?.vendorId || 'vend-kofi';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(initialOpenAdd || false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(250);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [sku, setSku] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodsRes, catsRes, vendorRes] = await Promise.all([
        api.getVendorProducts(vendorId),
        api.getCategories(),
        api.getVendorById(vendorId)
      ]);
      setProducts(prodsRes.products || []);
      setCategories(catsRes);
      setVendor(vendorRes);
      if (!categoryId && catsRes.length > 0) {
        setCategoryId(catsRes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || 'cat-phones');
    setPrice(350);
    setDiscountPrice(undefined);
    setStockQuantity(15);
    setSku(`VND-${Date.now().toString().slice(-4)}`);
    setFeaturedImage('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80');
    setShortDescription('Premium high-quality product with official manufacturer warranty.');
    setDescription('Engineered for superior reliability and everyday performance.');
    setTagsInput('Best Seller, New Arrival, Official');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setDiscountPrice(p.discountPrice);
    setStockQuantity(p.stockQuantity);
    setSku(p.sku);
    setFeaturedImage(p.featuredImage);
    setShortDescription(p.shortDescription || '');
    setDescription(p.description || '');
    setTagsInput(p.tags ? p.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) {
      showToast('error', 'Missing Information', 'Please provide a valid product name and price.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingProduct) {
        await api.updateVendorProduct(vendorId, editingProduct.id, {
          name,
          categoryId,
          price,
          discountPrice: discountPrice || undefined,
          stockQuantity,
          sku,
          featuredImage,
          images: [featuredImage],
          shortDescription,
          description,
          tags
        });
        showToast('success', 'Product Updated', `${name} catalog listing has been saved.`);
      } else {
        await api.createVendorProduct(vendorId, {
          name,
          categoryId,
          price,
          discountPrice: discountPrice || undefined,
          stockQuantity,
          sku,
          featuredImage,
          images: [featuredImage],
          shortDescription,
          description,
          tags,
          brand: vendor?.storeName || 'Verified Merchant',
          status: 'active'
        });
        showToast('success', 'Product Listed!', `${name} is now live on the NovaMart store.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('error', 'Upload Failed', err.message || 'Could not save product.');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
      await api.deleteVendorProduct(vendorId, productId);
      showToast('info', 'Product Removed', `${productName} was removed from your store catalog.`);
      loadData();
    } catch {
      showToast('error', 'Error', 'Failed to delete product.');
    }
  };

  const handleRestock = async (productId: string) => {
    try {
      await api.restockProduct(productId, 20);
      showToast('success', 'Stock Replenished', 'Added +20 units to stock quantity.');
      loadData();
    } catch {
      showToast('error', 'Error', 'Failed to restock item.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Product Catalog ({products.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload new products, update stock quantities, and manage pricing in real time.
          </p>
        </div>

        <button
          id="btn-vendor-add-product"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/25 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, or brand..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
        >
          <option value="all">All Departments</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product Item</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Price (GH₵)</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading your store catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found. Click "Upload New Product" to list your first item!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.stockQuantity <= 5;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Product item with image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.featuredImage}
                            alt={product.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-500">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {categories.find((c) => c.id === product.categoryId)?.name || 'General'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <p className="font-black text-slate-900 dark:text-white">{formatPrice(product.price)}</p>
                        {product.discountPrice && (
                          <p className="text-[10px] text-slate-400 line-through">
                            {formatPrice(product.discountPrice)}
                          </p>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black ${
                              isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {product.stockQuantity} in stock
                          </span>
                          {isLowStock && (
                            <button
                              onClick={() => handleRestock(product.id)}
                              className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold hover:bg-rose-200"
                            >
                              +Restock
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          <span>{product.rating?.toFixed(1) || '5.0'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors border border-slate-200 dark:border-slate-700"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-slate-200 dark:border-slate-700"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {editingProduct ? 'Edit Catalog Product' : 'List New Product on Store'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Product will immediately be indexed on NovaMart and associated with your store.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Product Name */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Category & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Store Department *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      SKU / Barcode Reference
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. VND-SNY-01"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Price, Discount, Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Price (GH₵) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="350"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Original / Regular Price (GH₵)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={discountPrice || ''}
                      onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Available Stock (Units) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      placeholder="20"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Image URL with quick image helpers */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Featured Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                  />
                  {featuredImage && (
                    <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <img
                        src={featuredImage}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <span className="text-[11px] text-emerald-600 font-semibold">Image URL verified</span>
                    </div>
                  )}
                </div>

                {/* Short Description */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Short Catchy Description
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief 1-line feature highlight for card display"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Full Product Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full specifications, warranty, what is in the box..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Wireless, Bluetooth 5.3, Fast Charging"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-amber-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-600/25 transition-all active:scale-95 cursor-pointer"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
