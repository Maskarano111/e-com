import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, AlertTriangle, CheckCircle2, Search, RefreshCw,
  ArrowUp, X
} from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types/index';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const AdminInventoryView: React.FC = () => {
  const { formatPrice } = useSettings();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'in_stock'>('all');
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(50);
  const [isRestocking, setIsRestocking] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProducts({ limit: 200 });
      setProducts(res.products);
    } catch { } finally { setIsLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'out_of_stock' ? p.stockQuantity <= 0 :
      filter === 'low_stock' ? p.stockQuantity > 0 && p.stockQuantity <= 5 :
      p.stockQuantity > 5;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stockQuantity > 5).length,
    lowStock: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length,
    outOfStock: products.filter(p => p.stockQuantity <= 0).length,
  };

  const handleRestock = async () => {
    if (!restockProduct || restockQty <= 0) return;
    setIsRestocking(true);
    try {
      await api.restockProduct(restockProduct.id, restockQty);
      showToast(`Restocked "${restockProduct.name}" with ${restockQty} units`, 'success');
      setRestockProduct(null);
      await loadProducts();
    } catch {
      showToast('Failed to restock product', 'error');
    } finally { setIsRestocking(false); }
  };

  const getStatusBadge = (qty: number) => {
    if (qty <= 0) return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300">OUT OF STOCK</span>;
    if (qty <= 5) return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">LOW STOCK</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">IN STOCK</span>;
  };

  const filterItems: { key: typeof filter; label: string; icon: React.ElementType; color: string; count: number }[] = [
    { key: 'all', label: 'Total SKUs', icon: Package, color: 'from-blue-500 to-indigo-500', count: stats.total },
    { key: 'in_stock', label: 'In Stock', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', count: stats.inStock },
    { key: 'low_stock', label: 'Low Stock', icon: AlertTriangle, color: 'from-amber-500 to-orange-500', count: stats.lowStock },
    { key: 'out_of_stock', label: 'Out of Stock', icon: X, color: 'from-red-500 to-rose-500', count: stats.outOfStock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Inventory Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor stock levels and restock products</p>
        </div>
        <button onClick={loadProducts} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {filterItems.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 text-left transition-all hover:shadow-md ${filter === s.key ? 'border-emerald-400 dark:border-emerald-600' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{s.count}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product name or SKU..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['Product', 'SKU', 'Category', 'Stock Qty', 'Status', 'Price', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(p => (
                  <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${p.stockQuantity <= 0 ? 'bg-red-50/40 dark:bg-red-950/10' : p.stockQuantity <= 5 ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.featuredImage} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-xs leading-tight truncate max-w-[180px]">{p.name}</p>
                          <p className="text-slate-400 text-[10px]">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-400">{p.sku}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{p.categoryName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-black ${p.stockQuantity <= 0 ? 'text-red-600' : p.stockQuantity <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>{p.stockQuantity}</span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(p.stockQuantity)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">{formatPrice(p.discountPrice || p.price)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setRestockProduct(p); setRestockQty(50); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
                        <ArrowUp className="w-3 h-3" />Restock
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-slate-400 text-sm">No products match your filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {restockProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setRestockProduct(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Restock Product</h2>
              <p className="text-sm text-slate-500 mb-4 line-clamp-1">{restockProduct.name}</p>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 mb-4">
                <img src={restockProduct.featuredImage} alt="" className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <p className="text-xs text-slate-500">Current Stock</p>
                  <p className={`text-3xl font-black ${restockProduct.stockQuantity <= 0 ? 'text-red-600' : restockProduct.stockQuantity <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>{restockProduct.stockQuantity}</p>
                </div>
                <span className="text-slate-400 text-2xl font-light">+</span>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Add Units</p>
                  <input type="number" value={restockQty} min={1} max={1000} onChange={e => setRestockQty(Number(e.target.value))}
                    className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">New total: <span className="font-black text-emerald-600">{restockProduct.stockQuantity + restockQty} units</span></p>
              <div className="flex gap-3">
                <button onClick={() => setRestockProduct(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={handleRestock} disabled={isRestocking} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  {isRestocking ? 'Processing...' : `Restock +${restockQty}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
