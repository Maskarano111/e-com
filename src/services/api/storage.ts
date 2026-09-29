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
    const headers = new Headers(options?.headers);
    if (!headers.has('Authorization')) {
      try {
        const token = localStorage.getItem('novamart_auth_token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
      } catch {}
    }
    const res = await fetch(url, { ...options, headers });
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
    const errorBody = await res.json().catch(() => ({}));
    const httpError = new Error(errorBody.error || `Request failed with status ${res.status}`) as Error & { status?: number };
    httpError.status = res.status;
    throw httpError;
  } catch (err) {
    if (fallbackFn && !(err instanceof Error && 'status' in err)) {
      return await fallbackFn();
    }
    throw err;
  }
}
