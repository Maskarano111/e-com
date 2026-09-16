import { Product, ProductFilters, Review } from '../../types/index';
import { initialProducts } from '../../data/initialData';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export const productsApi = {
  async getProducts(filters?: ProductFilters & { page?: number; limit?: number; includeInactive?: boolean }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });
    }
    return safeFetch<{ products: Product[]; total: number; page: number; totalPages: number }>(
      `${API_BASE}/products?${params.toString()}`,
      undefined,
      () => {
        let prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        if (!filters?.includeInactive) {
          prods = prods.filter((p) => p.status === 'active');
        }
        if (filters?.category && filters.category !== 'all') {
          prods = prods.filter((p) => p.categoryId === filters.category);
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          prods = prods.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
        }
        if (filters?.dealsOnly) {
          prods = prods.filter((p) => p.discountPrice && p.discountPrice < p.price);
        }
        if (filters?.featured) {
          prods = prods.filter((p) => p.featured);
        }
        const limit = filters?.limit || 50;
        const page = filters?.page || 1;
        const total = prods.length;
        const paginated = prods.slice((page - 1) * limit, page * limit);
        return {
          products: paginated,
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1
        };
      }
    );
  },

  async getProduct(idOrSlug: string) {
    return safeFetch<{ product: Product; related: Product[] }>(
      `${API_BASE}/products/${idOrSlug}`,
      undefined,
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const product = prods.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || prods[0];
        const related = prods.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 4);
        return { product, related };
      }
    );
  },

  async getDeals() {
    return safeFetch<Product[]>(
      `${API_BASE}/products/deals`,
      undefined,
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        return prods.filter((p) => p.status === 'active' && p.discountPrice && p.discountPrice < p.price).slice(0, 10);
      }
    );
  },

  async getNewArrivals() {
    return safeFetch<Product[]>(
      `${API_BASE}/products/new-arrivals`,
      undefined,
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        return prods.filter((p) => p.status === 'active' && p.isNewArrival).slice(0, 8);
      }
    );
  },

  async getBestSellers() {
    return safeFetch<Product[]>(
      `${API_BASE}/products/bestsellers`,
      undefined,
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        return prods.filter((p) => p.status === 'active' && p.isBestSeller).slice(0, 8);
      }
    );
  },

  async getProductReviews(productId: string) {
    return safeFetch<Review[]>(
      `${API_BASE}/products/${productId}/reviews`,
      undefined,
      () => {
        const reviews = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, []);
        return reviews.filter((r) => r.productId === productId);
      }
    );
  },

  async createProductReview(productId: string, data: { rating: number; comment: string; userName?: string; userEmail?: string; title?: string }) {
    return safeFetch<Review>(
      `${API_BASE}/products/${productId}/reviews`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const reviews = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, []);
        const newRev: Review = {
          id: `rev-${Date.now()}`,
          productId,
          userId: 'usr-guest',
          userName: data.userName || 'Verified Buyer',
          rating: Number(data.rating) || 5,
          title: data.title || '',
          comment: data.comment,
          verifiedPurchase: true,
          status: 'approved',
          createdAt: new Date().toISOString()
        };
        reviews.unshift(newRev);
        setLocal(STORAGE_KEYS.REVIEWS, reviews);
        return newRev;
      }
    );
  },

  async createProduct(data: Partial<Product>) {
    return safeFetch<Product>(
      `${API_BASE}/products`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const newProd: Product = {
          id: `prod-${Date.now()}`,
          name: data.name || 'New Superstore Product',
          slug: (data.name || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description || '',
          shortDescription: data.shortDescription || '',
          categoryId: data.categoryId || 'cat-appliances',
          categoryName: data.categoryName || 'General',
          brand: data.brand || 'NovaMart',
          sku: data.sku || `SKU-${Date.now()}`,
          price: Number(data.price) || 0,
          discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
          stockQuantity: Number(data.stockQuantity) || 10,
          status: data.status || 'active',
          featured: Boolean(data.featured),
          rating: 5.0,
          reviewCount: 1,
          images: data.images || ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80'],
          featuredImage: data.featuredImage || data.images?.[0] || 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
          specifications: data.specifications || [],
          tags: data.tags || [],
          isNewArrival: true,
          isBestSeller: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        prods.unshift(newProd);
        setLocal(STORAGE_KEYS.PRODUCTS, prods);
        return newProd;
      }
    );
  },

  async updateProduct(id: string, data: Partial<Product>) {
    return safeFetch<Product>(
      `${API_BASE}/products/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const idx = prods.findIndex((p) => p.id === id);
        if (idx !== -1) {
          prods[idx] = { ...prods[idx], ...data, updatedAt: new Date().toISOString() };
          setLocal(STORAGE_KEYS.PRODUCTS, prods);
          return prods[idx];
        }
        return data as Product;
      }
    );
  },

  async deleteProduct(id: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/products/${id}`,
      { method: 'DELETE' },
      () => {
        let prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        prods = prods.filter((p) => p.id !== id);
        setLocal(STORAGE_KEYS.PRODUCTS, prods);
        return { success: true };
      }
    );
  },

  async duplicateProduct(id: string) {
    return safeFetch<Product>(
      `${API_BASE}/products/${id}/duplicate`,
      { method: 'POST' },
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const orig = prods.find((p) => p.id === id) || prods[0];
        const dup: Product = {
          ...orig,
          id: `prod-${Date.now()}`,
          name: `${orig.name} (Copy)`,
          sku: `${orig.sku}-COPY`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        prods.unshift(dup);
        setLocal(STORAGE_KEYS.PRODUCTS, prods);
        return dup;
      }
    );
  },

  async restockProduct(productId: string, quantity: number = 50) {
    return safeFetch<any>(
      `${API_BASE}/admin/products/restock`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      },
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const idx = prods.findIndex((p) => p.id === productId);
        if (idx !== -1) {
          prods[idx].stockQuantity += quantity;
          setLocal(STORAGE_KEYS.PRODUCTS, prods);
        }
        return { success: true };
      }
    );
  },

  async bulkImportProducts(products: any[]) {
    return safeFetch<any>(
      `${API_BASE}/admin/products/bulk-import`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
      },
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const merged = [...products, ...prods];
        setLocal(STORAGE_KEYS.PRODUCTS, merged);
        return { count: products.length, success: true };
      }
    );
  },

  async getProductQuestions(productId: string) {
    return safeFetch<any[]>(
      `${API_BASE}/products/${productId}/questions`,
      undefined,
      () => getLocal<any[]>(`novamart_qa_${productId}`, [])
    );
  },

  async askProductQuestion(productId: string, data: { question: string; askerName?: string }) {
    return safeFetch<any>(
      `${API_BASE}/products/${productId}/questions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const qa = getLocal<any[]>(`novamart_qa_${productId}`, []);
        const newQ = { id: `qa-${Date.now()}`, productId, question: data.question, askerName: data.askerName || 'Shopper', answers: [], createdAt: new Date().toISOString() };
        qa.unshift(newQ);
        setLocal(`novamart_qa_${productId}`, qa);
        return newQ;
      }
    );
  }
};
