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

const API_BASE = '/api';

export const api = {
  // Auth
  async register(data: { firstName: string; lastName: string; email: string; phone?: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json() as Promise<{ user: User; token: string }>;
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json() as Promise<{ user: User; token: string }>;
  },

  async adminLogin(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Admin login failed');
    }
    return res.json() as Promise<{ user: User; token: string }>;
  },

  async getMe(token: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json() as Promise<{ user: User }>;
  },

  async updateProfile(data: { userId: string; firstName?: string; lastName?: string; phone?: string; profileImage?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Profile update failed');
    }
    return res.json() as Promise<{ user: User }>;
  },

  async changePassword(data: { userId: string; currentPassword: string; newPassword: string }) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Password update failed');
    }
    return res.json() as Promise<{ message: string }>;
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Password recovery failed');
    }
    return res.json() as Promise<{ message: string }>;
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
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json() as Promise<{ products: Product[]; total: number; page: number; totalPages: number }>;
  },

  async getProduct(idOrSlug: string) {
    const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json() as Promise<{ product: Product; related: Product[] }>;
  },

  async getDeals() {
    const res = await fetch(`${API_BASE}/products/deals`);
    return res.json() as Promise<Product[]>;
  },

  async getNewArrivals() {
    const res = await fetch(`${API_BASE}/products/new-arrivals`);
    return res.json() as Promise<Product[]>;
  },

  async getBestSellers() {
    const res = await fetch(`${API_BASE}/products/bestsellers`);
    return res.json() as Promise<Product[]>;
  },

  async getProductReviews(productId: string) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
    if (!res.ok) return [];
    return res.json() as Promise<Review[]>;
  },

  async createProductReview(productId: string, data: { rating: number; comment: string; userName?: string; userEmail?: string; title?: string }) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json() as Promise<Review>;
  },

  async createProduct(data: Partial<Product>) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json() as Promise<Product>;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json() as Promise<Product>;
  },

  async deleteProduct(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  async duplicateProduct(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}/duplicate`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to duplicate product');
    return res.json() as Promise<Product>;
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json() as Promise<Category[]>;
  },

  async createCategory(data: Partial<Category>) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json() as Promise<Category>;
  },

  async updateCategory(id: string, data: Partial<Category>) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json() as Promise<Category>;
  },

  async deleteCategory(id: string) {
    const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid coupon');
    }
    return res.json() as Promise<{ valid: boolean; coupon: Coupon; discountAmount: number }>;
  },

  async getCoupons() {
    const res = await fetch(`${API_BASE}/coupons`);
    return res.json() as Promise<Coupon[]>;
  },

  async createCoupon(data: Partial<Coupon>) {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create coupon');
    return res.json() as Promise<Coupon>;
  },

  async updateCoupon(id: string, data: Partial<Coupon>) {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as Promise<Coupon>;
  },

  async deleteCoupon(id: string) {
    const res = await fetch(`${API_BASE}/coupons/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Orders
  async createOrder(data: any) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json() as Promise<Order>;
  },

  async getOrders(params?: { userId?: string; status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.userId) q.append('userId', params.userId);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const res = await fetch(`${API_BASE}/orders?${q.toString()}`);
    return res.json() as Promise<Order[]>;
  },

  async getOrder(idOrNumber: string) {
    const res = await fetch(`${API_BASE}/orders/${idOrNumber}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json() as Promise<Order>;
  },

  async updateOrderStatus(id: string, status: string, note?: string) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json() as Promise<Order>;
  },

  // Reviews
  async getReviews(params?: { productId?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params?.productId) q.append('productId', params.productId);
    if (params?.status) q.append('status', params.status);
    const res = await fetch(`${API_BASE}/reviews?${q.toString()}`);
    return res.json() as Promise<Review[]>;
  },

  async submitReview(data: Partial<Review>) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json() as Promise<Review>;
  },

  async updateReviewStatus(id: string, status: 'approved' | 'rejected') {
    const res = await fetch(`${API_BASE}/reviews/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json() as Promise<Review>;
  },

  async deleteReview(id: string) {
    const res = await fetch(`${API_BASE}/reviews/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Banners
  async getBanners() {
    const res = await fetch(`${API_BASE}/banners`);
    return res.json() as Promise<Banner[]>;
  },

  async createBanner(data: Partial<Banner>) {
    const res = await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as Promise<Banner>;
  },

  async updateBanner(id: string, data: Partial<Banner>) {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as Promise<Banner>;
  },

  async deleteBanner(id: string) {
    const res = await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Addresses
  async getAddresses(userId: string) {
    const res = await fetch(`${API_BASE}/addresses?userId=${userId}`);
    return res.json() as Promise<DeliveryAddress[]>;
  },

  async createAddress(data: DeliveryAddress) {
    const res = await fetch(`${API_BASE}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as Promise<DeliveryAddress>;
  },

  async updateAddress(id: string, data: Partial<DeliveryAddress>) {
    const res = await fetch(`${API_BASE}/addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as Promise<DeliveryAddress>;
  },

  async deleteAddress(id: string) {
    const res = await fetch(`${API_BASE}/addresses/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Notifications
  async getNotifications(params: { userId?: string; target?: 'customer' | 'admin' }) {
    const q = new URLSearchParams();
    if (params.userId) q.append('userId', params.userId);
    if (params.target) q.append('target', params.target);
    const res = await fetch(`${API_BASE}/notifications?${q.toString()}`);
    return res.json() as Promise<NotificationItem[]>;
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json() as Promise<StoreSettings>;
  },

  async updateSettings(data: Partial<StoreSettings>) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as Promise<StoreSettings>;
  },

  // Admin Analytics & Reports
  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`);
    return res.json();
  },

  async getAdminCustomers() {
    const res = await fetch(`${API_BASE}/admin/customers`);
    return res.json();
  },

  async getAdminInventory() {
    const res = await fetch(`${API_BASE}/admin/inventory`);
    return res.json();
  },

  async getAdminPayments() {
    const res = await fetch(`${API_BASE}/payments`);
    return res.json() as Promise<PaymentTransaction[]>;
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
    const res = await fetch(`${API_BASE}/payments/paystack/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async verifyPaystack(reference: string, orderId?: string) {
    const res = await fetch(`${API_BASE}/payments/paystack/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, orderId })
    });
    return res.json();
  },

  // SMS & Customer Communications
  async sendOrderSMS(data: { phone: string; message: string; orderNumber?: string; type?: string }) {
    const res = await fetch(`${API_BASE}/notifications/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Bulk Operations & Restock
  async restockProduct(productId: string, quantity: number = 50) {
    const res = await fetch(`${API_BASE}/admin/products/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },

  async bulkImportProducts(products: any[]) {
    const res = await fetch(`${API_BASE}/admin/products/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
    return res.json();
  }
};
