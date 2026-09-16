import { Banner, Review, NotificationItem, Product } from '../../types/index';
import { initialBanners } from '../../data/initialData';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export const marketingApi = {
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
          rating: Number(data.rating) || 5,
          title: data.title || '',
          comment: data.comment || '',
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
          target: (params.target || 'customer') as any,
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

  // Loyalty Points
  async getUserLoyalty(userId: string) {
    return safeFetch<{ balance: number; history: any[] }>(
      `${API_BASE}/users/${userId}/loyalty`,
      undefined,
      () => {
        const loyalty = getLocal<any[]>('novamart_loyalty', []);
        const userPoints = loyalty.filter(l => l.userId === userId);
        const balance = userPoints.filter(l => l.type === 'earn').reduce((s, l) => s + l.points, 0)
          - userPoints.filter(l => l.type === 'redeem').reduce((s, l) => s + l.points, 0);
        return { balance, history: userPoints.slice(0, 20) };
      }
    );
  },

  async redeemLoyaltyPoints(userId: string, points: number) {
    return safeFetch<{ success: boolean; pointsRedeemed: number; discountAmount: number }>(
      `${API_BASE}/users/${userId}/loyalty/redeem`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
      },
      () => ({ success: true, pointsRedeemed: points, discountAmount: points / 10 })
    );
  },

  // AI Shopping Assistant Chat
  async chatWithAI(message: string) {
    return safeFetch<{ success: boolean; source: string; text: string; products?: Product[] }>(
      `${API_BASE}/ai/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      },
      () => {
        return {
          success: true,
          source: 'local-fallback',
          text: `I'm here to help you shop! You can ask for products, shipping options, MoMo payments, or gift recommendations.`
        };
      }
    );
  }
};
