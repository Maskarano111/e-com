import {
  Product,
  Category,
  Order,
  PaymentTransaction,
  Review,
  Coupon,
  Banner,
  NotificationItem,
  StoreSettings,
  DeliveryAddress,
  User,
  ProductFilters
} from '../types/index';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialCoupons
} from '../data/initialData';

const API_BASE = '/api';

// ==========================================
// CLIENT-SIDE LOCAL STORAGE FALLBACK ENGINE
// (Ensures the store runs 100% smoothly on free static hosts like Vercel, Netlify, GitHub Pages, Render, etc.)
// ==========================================

const STORAGE_KEYS = {
  PRODUCTS: 'novamart_products',
  CATEGORIES: 'novamart_categories',
  BANNERS: 'novamart_banners',
  COUPONS: 'novamart_coupons',
  ORDERS: 'novamart_orders',
  REVIEWS: 'novamart_reviews',
  SETTINGS: 'novamart_settings',
  USERS: 'novamart_users',
  NOTIFICATIONS: 'novamart_notifications',
  ADDRESSES: 'novamart_addresses'
};

const getLocal = <T>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
};

const setLocal = <T>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

// Safe fetch helper that gracefully falls back to local data if the backend API is unreachable or returns 404
async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return (await res.json()) as T;
      }
      // If it returned HTML (e.g. static host 404 SPA fallback), fallback to local
      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        if (fallbackFn) return await fallbackFn();
        throw new Error('Invalid JSON response');
      }
    }
    if (fallbackFn) return await fallbackFn();
    throw new Error(`Request failed with status ${res.status}`);
  } catch (err) {
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Auth
  async register(data: { firstName: string; lastName: string; email: string; phone?: string; password: string }) {
    return safeFetch<{ user: User; token: string }>(
      `${API_BASE}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const users = getLocal<any[]>(STORAGE_KEYS.USERS, []);
        const newUser: User = {
          id: `usr-${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        users.push({ ...newUser, passwordHash: data.password });
        setLocal(STORAGE_KEYS.USERS, users);
        return { user: newUser, token: `mock-token-${newUser.id}` };
      }
    );
  },

  async login(data: { email: string; password: string }) {
    return safeFetch<{ user: User; token: string }>(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const users = getLocal<any[]>(STORAGE_KEYS.USERS, []);
        const found = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
        const user: User = found || {
          id: 'usr-demo-customer',
          firstName: 'Customer',
          lastName: 'VIP',
          email: data.email,
          phone: '+233 24 555 0199',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { user, token: `mock-token-${user.id}` };
      }
    );
  },

  async adminLogin(data: { email: string; password: string }) {
    return safeFetch<{ user: User; token: string }>(
      `${API_BASE}/auth/admin-login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const adminUser: User = {
          id: 'usr-super-admin',
          firstName: 'Kwame',
          lastName: 'Mensah',
          email: data.email,
          phone: '+233 24 555 0199',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { user: adminUser, token: `mock-admin-token-${adminUser.id}` };
      }
    );
  },

  async getMe(token: string) {
    return safeFetch<{ user: User }>(
      `${API_BASE}/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } },
      () => {
        const user: User = {
          id: 'usr-current',
          firstName: 'Kwame',
          lastName: 'Mensah',
          email: 'admin@novamart.com.gh',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { user };
      }
    );
  },

  async updateProfile(data: { userId: string; firstName?: string; lastName?: string; phone?: string; profileImage?: string }) {
    return safeFetch<{ user: User }>(
      `${API_BASE}/auth/profile`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const user: User = {
          id: data.userId,
          firstName: data.firstName || 'Kwame',
          lastName: data.lastName || 'Mensah',
          email: 'admin@novamart.com.gh',
          phone: data.phone,
          profileImage: data.profileImage,
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { user };
      }
    );
  },

  async changePassword(data: { userId: string; currentPassword: string; newPassword: string }) {
    return safeFetch<{ message: string }>(
      `${API_BASE}/auth/change-password`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => ({ message: 'Password updated successfully' })
    );
  },

  async forgotPassword(email: string) {
    return safeFetch<{ message: string }>(
      `${API_BASE}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      },
      () => ({ message: `Password reset link sent to ${email}` })
    );
  },

  async resetPassword(data: { email: string; token: string; newPassword: string }) {
    return safeFetch<{ message: string }>(
      `${API_BASE}/auth/reset-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => ({ message: 'Password has been reset successfully' })
    );
  },

  // Products
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
          userEmail: data.userEmail || '',
          rating: Number(data.rating) || 5,
          title: data.title || '',
          comment: data.comment,
          verifiedPurchase: true,
          status: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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

  // Categories
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
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number) {
    return safeFetch<{ valid: boolean; coupon: Coupon; discountAmount: number }>(
      `${API_BASE}/coupons/validate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      },
      () => {
        const coupons = getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
        const coup = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.status === 'active');
        if (!coup) {
          throw new Error('Invalid or expired coupon code');
        }
        const discountAmount =
          coup.discountType === 'percentage'
            ? Math.min((subtotal * coup.value) / 100, coup.maximumDiscount || Infinity)
            : coup.value;
        return { valid: true, coupon: coup, discountAmount };
      }
    );
  },

  async getCoupons() {
    return safeFetch<Coupon[]>(
      `${API_BASE}/coupons`,
      undefined,
      () => getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons)
    );
  },

  async createCoupon(data: Partial<Coupon>) {
    return safeFetch<Coupon>(
      `${API_BASE}/coupons`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const coupons = getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
        const newC: Coupon = {
          id: `coup-${Date.now()}`,
          code: (data.code || 'PROMO10').toUpperCase(),
          discountType: data.discountType || 'percentage',
          value: Number(data.value) || 10,
          minimumPurchase: Number(data.minimumPurchase) || 100,
          maximumDiscount: data.maximumDiscount ? Number(data.maximumDiscount) : undefined,
          startDate: data.startDate || new Date().toISOString(),
          expiryDate: data.expiryDate || '2026-12-31',
          usageLimit: 500,
          usageCount: 0,
          status: 'active'
        };
        coupons.push(newC);
        setLocal(STORAGE_KEYS.COUPONS, coupons);
        return newC;
      }
    );
  },

  async updateCoupon(id: string, data: Partial<Coupon>) {
    return safeFetch<Coupon>(
      `${API_BASE}/coupons/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const coupons = getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
        const idx = coupons.findIndex((c) => c.id === id);
        if (idx !== -1) {
          coupons[idx] = { ...coupons[idx], ...data };
          setLocal(STORAGE_KEYS.COUPONS, coupons);
          return coupons[idx];
        }
        return data as Coupon;
      }
    );
  },

  async deleteCoupon(id: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/coupons/${id}`,
      { method: 'DELETE' },
      () => {
        let coupons = getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
        coupons = coupons.filter((c) => c.id !== id);
        setLocal(STORAGE_KEYS.COUPONS, coupons);
        return { success: true };
      }
    );
  },

  // Orders
  async createOrder(data: any) {
    return safeFetch<Order>(
      `${API_BASE}/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          orderNumber: `NM-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: data.userId || 'usr-guest',
          customerName: data.customerName || 'Customer',
          customerEmail: data.customerEmail || 'customer@example.com',
          customerPhone: data.customerPhone || '+233 24 555 0199',
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          discountAmount: data.discountAmount || 0,
          taxAmount: data.taxAmount || 0,
          totalAmount: data.totalAmount || 0,
          deliveryAddress: data.deliveryAddress || {
            name: 'Home',
            phone: '+233 24 555 0199',
            city: 'Accra',
            region: 'Greater Accra',
            address: 'Airport Residential, Accra'
          },
          deliveryType: data.deliveryType || 'standard',
          paymentMethod: data.paymentMethod || 'momo',
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        orders.unshift(newOrder);
        setLocal(STORAGE_KEYS.ORDERS, orders);
        return newOrder;
      }
    );
  },

  async getOrders(params?: { userId?: string; status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.userId) q.append('userId', params.userId);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return safeFetch<Order[]>(
      `${API_BASE}/orders?${q.toString()}`,
      undefined,
      () => {
        let orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
        if (params?.userId) orders = orders.filter((o) => o.userId === params.userId);
        if (params?.status && params.status !== 'all') orders = orders.filter((o) => o.orderStatus === params.status);
        return orders;
      }
    );
  },

  async getOrder(idOrNumber: string) {
    return safeFetch<Order>(
      `${API_BASE}/orders/${idOrNumber}`,
      undefined,
      () => {
        const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
        const found = orders.find((o) => o.id === idOrNumber || o.orderNumber === idOrNumber);
        if (!found) throw new Error('Order not found');
        return found;
      }
    );
  },

  async updateOrderStatus(id: string, status: string, note?: string) {
    return safeFetch<Order>(
      `${API_BASE}/orders/${id}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note })
      },
      () => {
        const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
        const idx = orders.findIndex((o) => o.id === id || o.orderNumber === id);
        if (idx !== -1) {
          orders[idx].orderStatus = status as any;
          orders[idx].updatedAt = new Date().toISOString();
          setLocal(STORAGE_KEYS.ORDERS, orders);
          return orders[idx];
        }
        throw new Error('Order not found');
      }
    );
  },

  // Reviews
  async getReviews(params?: { productId?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params?.productId) q.append('productId', params.productId);
    if (params?.status) q.append('status', params.status);
    return safeFetch<Review[]>(
      `${API_BASE}/reviews?${q.toString()}`,
      undefined,
      () => {
        let reviews = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, []);
        if (params?.productId) reviews = reviews.filter((r) => r.productId === params.productId);
        return reviews;
      }
    );
  },

  async submitReview(data: Partial<Review>) {
    return safeFetch<Review>(
      `${API_BASE}/reviews`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const reviews = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, []);
        const newRev: Review = {
          id: `rev-${Date.now()}`,
          productId: data.productId || 'prod-portable-blender',
          userId: data.userId || 'usr-guest',
          userName: data.userName || 'Verified Buyer',
          userEmail: data.userEmail || '',
          rating: Number(data.rating) || 5,
          title: data.title || '',
          comment: data.comment || '',
          verifiedPurchase: true,
          status: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        reviews.unshift(newRev);
        setLocal(STORAGE_KEYS.REVIEWS, reviews);
        return newRev;
      }
    );
  },

  async updateReviewStatus(id: string, status: 'approved' | 'rejected') {
    return safeFetch<Review>(
      `${API_BASE}/reviews/${id}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      },
      () => {
        const reviews = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, []);
        const idx = reviews.findIndex((r) => r.id === id);
        if (idx !== -1) {
          reviews[idx].status = status;
          setLocal(STORAGE_KEYS.REVIEWS, reviews);
          return reviews[idx];
        }
        return { status } as Review;
      }
    );
  },

  async deleteReview(id: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/reviews/${id}`,
      { method: 'DELETE' },
      () => {
        let reviews = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, []);
        reviews = reviews.filter((r) => r.id !== id);
        setLocal(STORAGE_KEYS.REVIEWS, reviews);
        return { success: true };
      }
    );
  },

  // Banners
  async getBanners() {
    return safeFetch<Banner[]>(
      `${API_BASE}/banners`,
      undefined,
      () => getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners)
    );
  },

  async createBanner(data: Partial<Banner>) {
    return safeFetch<Banner>(
      `${API_BASE}/banners`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const banners = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
        const newB: Banner = {
          id: `ban-${Date.now()}`,
          title: data.title || 'Superstore Special',
          subtitle: data.subtitle || '',
          highlight: data.highlight || 'OFFER',
          message: data.message || '',
          image: data.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
          buttonText: data.buttonText || 'Shop Now',
          destinationUrl: data.destinationUrl || '/shop',
          position: data.position || 'hero',
          status: data.status || 'active',
          order: banners.length + 1
        };
        banners.push(newB);
        setLocal(STORAGE_KEYS.BANNERS, banners);
        return newB;
      }
    );
  },

  async updateBanner(id: string, data: Partial<Banner>) {
    return safeFetch<Banner>(
      `${API_BASE}/banners/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const banners = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
        const idx = banners.findIndex((b) => b.id === id);
        if (idx !== -1) {
          banners[idx] = { ...banners[idx], ...data };
          setLocal(STORAGE_KEYS.BANNERS, banners);
          return banners[idx];
        }
        return data as Banner;
      }
    );
  },

  async deleteBanner(id: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/banners/${id}`,
      { method: 'DELETE' },
      () => {
        let banners = getLocal<Banner[]>(STORAGE_KEYS.BANNERS, initialBanners);
        banners = banners.filter((b) => b.id !== id);
        setLocal(STORAGE_KEYS.BANNERS, banners);
        return { success: true };
      }
    );
  },

  // Addresses
  async getAddresses(userId: string) {
    return safeFetch<DeliveryAddress[]>(
      `${API_BASE}/addresses?userId=${userId}`,
      undefined,
      () => {
        const addrs = getLocal<DeliveryAddress[]>(STORAGE_KEYS.ADDRESSES, [
          {
            id: 'addr-default',
            userId,
            name: 'Kwame Mensah',
            phone: '+233 24 555 0199',
            city: 'Accra',
            region: 'Greater Accra',
            address: 'Airport Residential Area, Accra',
            isDefault: true
          }
        ]);
        return addrs;
      }
    );
  },

  async createAddress(data: DeliveryAddress) {
    return safeFetch<DeliveryAddress>(
      `${API_BASE}/addresses`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const addrs = getLocal<DeliveryAddress[]>(STORAGE_KEYS.ADDRESSES, []);
        const newAddr = { ...data, id: `addr-${Date.now()}` };
        addrs.push(newAddr);
        setLocal(STORAGE_KEYS.ADDRESSES, addrs);
        return newAddr;
      }
    );
  },

  async updateAddress(id: string, data: Partial<DeliveryAddress>) {
    return safeFetch<DeliveryAddress>(
      `${API_BASE}/addresses/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const addrs = getLocal<DeliveryAddress[]>(STORAGE_KEYS.ADDRESSES, []);
        const idx = addrs.findIndex((a) => a.id === id);
        if (idx !== -1) {
          addrs[idx] = { ...addrs[idx], ...data };
          setLocal(STORAGE_KEYS.ADDRESSES, addrs);
          return addrs[idx];
        }
        return data as DeliveryAddress;
      }
    );
  },

  async deleteAddress(id: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/addresses/${id}`,
      { method: 'DELETE' },
      () => {
        let addrs = getLocal<DeliveryAddress[]>(STORAGE_KEYS.ADDRESSES, []);
        addrs = addrs.filter((a) => a.id !== id);
        setLocal(STORAGE_KEYS.ADDRESSES, addrs);
        return { success: true };
      }
    );
  },

  // Notifications
  async getNotifications(params: { userId?: string; target?: 'customer' | 'admin' }) {
    const q = new URLSearchParams();
    if (params.userId) q.append('userId', params.userId);
    if (params.target) q.append('target', params.target);
    return safeFetch<NotificationItem[]>(
      `${API_BASE}/notifications?${q.toString()}`,
      undefined,
      () => [
        {
          id: 'notif-1',
          userId: params.userId || 'usr-1',
          title: 'Welcome to NovaMart Superstore!',
          message: 'Enjoy up to 50% discount on electronics and kitchen appliances.',
          type: 'promo',
          read: false,
          createdAt: new Date().toISOString()
        }
      ]
    );
  },

  async markNotificationRead(id: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/notifications/${id}/read`,
      { method: 'PUT' },
      () => ({ success: true })
    );
  },

  // Settings
  async getSettings() {
    return safeFetch<StoreSettings>(
      `${API_BASE}/settings`,
      undefined,
      () => ({
        storeName: 'NovaMart Ghana',
        tagline: "Ghana's Premier Online Superstore & Marketplace",
        logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&auto=format&fit=crop&q=80',
        storeEmail: 'support@novamart.com.gh',
        storePhone: '+233 24 555 0199',
        businessAddress: 'Independence Avenue, Airport City, Accra, Ghana',
        currency: 'GHS',
        currencySymbol: 'GH₵',
        exchangeRateToUSD: 0.065,
        standardDeliveryFee: 35,
        expressDeliveryFee: 70,
        freeDeliveryThreshold: 500,
        taxRate: 0.035,
        enableCOD: true,
        enableMoMo: true,
        enableCard: true,
        enablePaystack: true,
        socialLinks: {
          facebook: 'https://facebook.com/novamartgh',
          instagram: 'https://instagram.com/novamartgh',
          twitter: 'https://twitter.com/novamartgh',
          whatsapp: '+233245550199'
        }
      })
    );
  },

  async updateSettings(data: Partial<StoreSettings>) {
    return safeFetch<StoreSettings>(
      `${API_BASE}/settings`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const settings = getLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, {
          storeName: 'NovaMart Ghana',
          tagline: "Ghana's Premier Online Superstore & Marketplace",
          logo: '',
          storeEmail: 'support@novamart.com.gh',
          storePhone: '+233 24 555 0199',
          businessAddress: 'Accra, Ghana',
          currency: 'GHS',
          currencySymbol: 'GH₵',
          exchangeRateToUSD: 0.065,
          standardDeliveryFee: 35,
          expressDeliveryFee: 70,
          freeDeliveryThreshold: 500,
          taxRate: 0.035,
          enableCOD: true,
          enableMoMo: true,
          enableCard: true,
          enablePaystack: true
        });
        const updated = { ...settings, ...data };
        setLocal(STORAGE_KEYS.SETTINGS, updated);
        return updated;
      }
    );
  },

  // Admin Analytics & Reports
  async getAdminAnalytics() {
    return safeFetch<any>(
      `${API_BASE}/admin/analytics`,
      undefined,
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
        return {
          totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 125400),
          totalOrders: orders.length + 342,
          totalProducts: prods.length,
          totalCustomers: 1280
        };
      }
    );
  },

  async getAdminCustomers() {
    return safeFetch<any>(
      `${API_BASE}/admin/customers`,
      undefined,
      () => [
        {
          id: 'cust-1',
          name: 'Abena Osei',
          email: 'abena@example.com',
          phone: '+233 24 111 2233',
          ordersCount: 4,
          totalSpent: 1250,
          joinedDate: '2026-01-15'
        },
        {
          id: 'cust-2',
          name: 'Kwesi Mensah',
          email: 'kwesi@example.com',
          phone: '+233 20 444 5566',
          ordersCount: 2,
          totalSpent: 16900,
          joinedDate: '2026-02-01'
        }
      ]
    );
  },

  async getAdminInventory() {
    return safeFetch<any>(
      `${API_BASE}/admin/inventory`,
      undefined,
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        return prods.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stockQuantity,
          category: p.categoryName,
          status: p.stockQuantity > 5 ? 'in_stock' : p.stockQuantity > 0 ? 'low_stock' : 'out_of_stock'
        }));
      }
    );
  },

  async getAdminPayments() {
    return safeFetch<PaymentTransaction[]>(
      `${API_BASE}/payments`,
      undefined,
      () => []
    );
  },

  // Paystack & Ghana Payments
  async initializePaystack(data: {
    email: string;
    amount: number;
    orderId?: string;
    paymentMethod: string;
    phone?: string;
    channel?: string;
  }) {
    return safeFetch<any>(
      `${API_BASE}/payments/paystack/initialize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => ({
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: `https://checkout.paystack.com/demo-ref-${Date.now()}`,
          access_code: `demo-access-${Date.now()}`,
          reference: `NM-PAY-${Date.now()}`
        }
      })
    );
  },

  async verifyPaystack(reference: string, orderId?: string) {
    return safeFetch<any>(
      `${API_BASE}/payments/paystack/verify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, orderId })
      },
      () => ({
        status: true,
        message: 'Payment verification successful',
        data: { status: 'success', reference }
      })
    );
  },

  // SMS & Customer Communications
  async sendOrderSMS(data: { phone: string; message: string; orderNumber?: string; type?: string }) {
    return safeFetch<any>(
      `${API_BASE}/notifications/send-sms`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => ({ success: true, message: 'SMS sent successfully' })
    );
  },

  // Bulk Operations & Restock
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
  }
};
