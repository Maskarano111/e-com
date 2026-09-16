import { Category } from '../../types/index';
import { initialCategories } from '../../data/initialData';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export const categoriesApi = {
  async getCategories() {
    return safeFetch<Category[]>(
      `${API_BASE}/categories`,
      undefined,
      () => getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories)
    );
  },

  async createCategory(data: Partial<Category>) {
    return safeFetch<Category>(
      `${API_BASE}/categories`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const cats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name: data.name || 'New Category',
          slug: (data.name || 'new-category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          image: data.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
          description: data.description || '',
          productCount: 0,
          featured: true
        };
        cats.push(newCat);
        setLocal(STORAGE_KEYS.CATEGORIES, cats);
        return newCat;
      }
    );
  },

  async updateCategory(id: string, data: Partial<Category>) {
    return safeFetch<Category>(
      `${API_BASE}/categories/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const cats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
        const idx = cats.findIndex((c) => c.id === id);
        if (idx !== -1) {
          cats[idx] = { ...cats[idx], ...data };
          setLocal(STORAGE_KEYS.CATEGORIES, cats);
          return cats[idx];
        }
        return data as Category;
      }
    );
  },

  async deleteCategory(id: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/categories/${id}`,
      { method: 'DELETE' },
      () => {
        let cats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
        cats = cats.filter((c) => c.id !== id);
        setLocal(STORAGE_KEYS.CATEGORIES, cats);
        return { success: true };
      }
    );
  }
};
