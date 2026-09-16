export const API_BASE = '/api';

export const STORAGE_KEYS = {
  PRODUCTS: 'novamart_products',
  CATEGORIES: 'novamart_categories',
  BANNERS: 'novamart_banners',
  COUPONS: 'novamart_coupons',
  ORDERS: 'novamart_orders',
  REVIEWS: 'novamart_reviews',
  SETTINGS: 'novamart_settings',
  USERS: 'novamart_users',
  NOTIFICATIONS: 'novamart_notifications',
  ADDRESSES: 'novamart_addresses',
  VENDORS: 'novamart_vendors',
  PAYOUTS: 'novamart_vendor_payouts'
} as const;

export const getLocal = <T>(key: string, defaultVal: T): T => {
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

export const setLocal = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

export async function safeFetch<T>(
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
