import { Coupon } from '../../types/index';
import { initialCoupons } from '../../data/initialData';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export const couponsApi = {
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
  }
};
