import React, { useState, useEffect, useRef } from 'react';
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
  ArrowUpDown,
  Filter,
  FileSpreadsheet,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category } from '../../types/index';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const AdminProductsView: React.FC = () => {
  const { formatPrice } = useSettings();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [sku, setSku] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFlashDeal, setIsFlashDeal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getCategories()
      ]);
      setProducts(prodsRes.products);
      setCategories(catsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setCategoryId(categories[0]?.id || 'cat-phones');
    setPrice(1000);
    setDiscountPrice(undefined);
    setStockQuantity(15);
    setSku(`SKU-${Date.now().toString().slice(-4)}`);
    setFeaturedImage('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80');
    setShortDescription('');
    setDescription('');
    setIsFeatured(false);
    setIsFlashDeal(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setDiscountPrice(p.discountPrice);
    setStockQuantity(p.stockQuantity);
    setSku(p.sku || '');
    setFeaturedImage(p.featuredImage || p.images[0]);
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setIsFeatured(!!p.featured);
    setIsFlashDeal(p.discountPrice !== undefined && p.discountPrice < p.price);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId,
        brand: 'NovaMart Direct',
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stockQuantity: Number(stockQuantity),
        sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
        featuredImage,
        images: [featuredImage],
        shortDescription,
        description,
        featured: isFeatured,
        status: 'active',
        specifications: [],
        tags: [],
        rating: editingProduct?.rating || 4.8,
        reviewCount: editingProduct?.reviewCount || 0
      };

      if (editingProduct) {
        const res: any = await api.updateProduct(editingProduct.id, payload);
        const updated = res.product || res;
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast('success', 'Product Updated', `${name} has been updated.`);
      } else {
        const res: any = await api.createProduct(payload as any);
        const created = res.product || res;
        setProducts((prev) => [created, ...prev]);
        showToast('success', 'Product Created', `${name} added to catalog.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Failed', err.message);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const handleRestock = async (pId: string, pName: string) => {
    try {
      const res: any = await api.restockProduct(pId, 50);
      if (res.product) {
        setProducts((prev) => prev.map((p) => (p.id === pId ? res.product : p)));
        showToast('success', 'Restocked! 📦', `Added 50 units to "${pName}".`);
      }
    } catch (err: any) {
      showToast('error', 'Restock Failed', err.message);
    }
  };

  const handleExportCSV = () => {
    if (!products.length) {
      showToast('error', 'No Products', 'There are no products to export.');
      return;
    }
    const headers = ['ID', 'Name', 'SKU', 'Brand', 'Category', 'Price', 'Discount Price', 'Stock Quantity', 'Featured', 'Status'];
    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku || ''}"`,
      `"${p.brand || ''}"`,
      `"${p.categoryName || ''}"`,
      p.price,
      p.discountPrice || '',
      p.stockQuantity,
      p.featured ? 'Yes' : 'No',
      `"${p.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NovaMart_Products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV Exported', `Catalog with ${products.length} products downloaded.`);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        if (lines.length <= 1) {
          showToast('error', 'Empty File', 'The CSV file contains no data rows.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
        const importedItems: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2) {
            importedItems.push({
              name: cols[1] || cols[0],
              sku: cols[2] || `SKU-${Date.now().toString().slice(-4)}`,
              brand: cols[3] || 'NovaMart',
              categoryName: cols[4] || 'General',
              price: parseFloat(cols[5]) || 100,
              discountPrice: cols[6] ? parseFloat(cols[6]) : undefined,
              stockQuantity: parseInt(cols[7], 10) || 20
            });
          }
        }

        if (importedItems.length > 0) {
          const res: any = await api.bulkImportProducts(importedItems);
          showToast('success', 'Bulk Import Succeeded', `Imported ${res.importedCount || importedItems.length} products to the catalog.`);
          loadData();
        }
      } catch (err: any) {
        showToast('error', 'Import Failed', err.message || 'Could not parse CSV.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteProduct = async (pId: string, pName: string) => {
    if (window.confirm(`Are you sure you want to remove "${pName}" from the catalog?`)) {
      try {
        await api.deleteProduct(pId);
        setProducts((prev) => prev.filter((p) => p.id !== pId));
        showToast('info', 'Product Removed', `${pName} has been deleted.`);
      } catch (err: any) {
        showToast('error', 'Error', err.message);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.stockQuantity <= 5;
    return matchesQuery && matchesCat && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Products & Inventory ({products.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage product catalog, pricing, SKU barcodes, and live stock levels
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileImport}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Import Products from CSV"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Export Products to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-admin-add-product"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              onlyLowStock
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alert</span>
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.featuredImage || p.images[0]}
                        alt={p.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{p.name}</p>
                        <p className="text-[10px] text-slate-400">SKU: {p.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize">
                      {categories.find((c) => c.id === p.categoryId)?.name || p.categoryId}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-black text-slate-900 dark:text-white">
                      {formatPrice(p.discountPrice || p.price)}
                    </p>
                    {p.discountPrice && (
                      <p className="text-[10px] text-slate-400 line-through">{formatPrice(p.price)}</p>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                        p.stockQuantity <= 5
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {p.stockQuantity <= 5 && <AlertTriangle className="w-3 h-3" />}
                        {p.stockQuantity} in stock
                      </span>
                      {p.stockQuantity <= 5 && (
                        <button
                          onClick={() => handleRestock(p.id, p.name)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>+50 Restock</span>
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[9px] font-bold">
                          Featured
                        </span>
                      )}
                      {p.discountPrice && p.discountPrice < p.price && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
                          Sale
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product to Store'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apple MacBook Air M3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU / Code</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Price (GH₵) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Discount Price (GH₵)</label>
                    <input
                      type="number"
                      min={0}
                      value={discountPrice || ''}
                      onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Featured Image URL *</label>
                  <input
                    type="url"
                    required
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Short Summary</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="One sentence summary of key features"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Feature on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFlashDeal}
                      onChange={(e) => setIsFlashDeal(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Mark as Flash Deal</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Save Product
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
