import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Save, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Banner } from '../../types/index';
import { useToast } from '../../context/ToastContext';

const EMPTY_BANNER: Partial<Banner> = {
  title: '', subtitle: '', highlight: '', message: '',
  image: '', buttonText: 'Shop Now', destinationUrl: '/shop',
  position: 'hero', status: 'active'
};

export const AdminBannersView: React.FC = () => {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<Partial<Banner>>(EMPTY_BANNER);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBanners();
      setBanners(res || []);
    } catch { } finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingBanner(null); setForm(EMPTY_BANNER); setIsModalOpen(true); };
  const openEdit = (b: Banner) => { setEditingBanner(b); setForm({ ...b }); setIsModalOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.image) { showToast('Title and image URL are required', 'error'); return; }
    setIsSaving(true);
    try {
      if (editingBanner) {
        const res = await api.updateBanner(editingBanner.id, form);
        setBanners(prev => prev.map(b => b.id === editingBanner.id ? res : b));
        showToast('Banner updated!', 'success');
      } else {
        const res = await api.createBanner(form);
        setBanners(prev => [...prev, res]);
        showToast('Banner created!', 'success');
      }
      setIsModalOpen(false);
    } catch { showToast('Failed to save banner', 'error'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await api.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      showToast('Banner deleted', 'success');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleToggleStatus = async (b: Banner) => {
    const newStatus = b.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateBanner(b.id, { status: newStatus });
      setBanners(prev => prev.map(x => x.id === b.id ? { ...x, status: newStatus } : x));
    } catch { showToast('Failed to update status', 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Banner & Promotions Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage hero banners and promotional slides on the storefront</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" />Add Banner
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading banners...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {banners.map(b => (
            <motion.div key={b.id} layout className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="relative h-36 overflow-hidden">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{b.highlight}</span>
                  <h3 className="text-sm font-black text-white line-clamp-1">{b.title}</h3>
                  <p className="text-[10px] text-slate-300 line-clamp-1">{b.subtitle}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${b.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {b.status === 'active' ? 'LIVE' : 'HIDDEN'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{b.title}</p>
                  <p className="text-[10px] text-slate-400">Position: {b.position} · CTA: {b.buttonText}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggleStatus(b)} title={b.status === 'active' ? 'Deactivate' : 'Activate'} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                    {b.status === 'active' ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-2 py-20 text-center text-slate-400">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No banners yet</p>
              <p className="text-sm">Click "Add Banner" to create your first promotional slide</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
              </div>

              {form.image && (
                <div className="relative h-28 rounded-xl overflow-hidden mb-4">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                    <Eye className="w-3 h-3 text-white mr-1" /><span className="text-white text-[10px]">Preview</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { label: 'Title *', key: 'title', type: 'text', placeholder: 'e.g. Up to 50% Off Electronics' },
                  { label: 'Subtitle', key: 'subtitle', type: 'text', placeholder: 'e.g. Shop authentic gadgets from verified vendors' },
                  { label: 'Highlight Tag', key: 'highlight', type: 'text', placeholder: 'e.g. MEGA DEAL or NEW ARRIVAL' },
                  { label: 'Image URL *', key: 'image', type: 'url', placeholder: 'https://images.unsplash.com/...' },
                  { label: 'Button Text', key: 'buttonText', type: 'text', placeholder: 'e.g. Shop Now' },
                  { label: 'Destination URL', key: 'destinationUrl', type: 'text', placeholder: '/shop or /category/electronics' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{f.label}</label>
                    <input type={f.type} value={(form as any)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Position</label>
                    <select value={form.position || 'hero'} onChange={e => setForm(p => ({ ...p, position: e.target.value as any }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="hero">Hero Carousel</option>
                      <option value="secondary">Secondary Banner</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Status</label>
                    <select value={form.status || 'active'} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="active">Active (Live)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  <Save className="w-4 h-4" />{isSaving ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Create Banner')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
