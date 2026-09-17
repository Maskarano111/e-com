import { authApi } from './auth';
import { productsApi } from './products';
import { categoriesApi } from './categories';
import { couponsApi } from './coupons';
import { ordersApi } from './orders';
import { vendorsApi } from './vendors';
import { marketingApi } from './marketing';
import { settingsApi } from './settings';
import { analyticsApi } from './analytics';
import { promotionsApi } from './promotions';
import { adminSubscriptionsApi } from './adminSubscriptions';

export * from './storage';
export * from './auth';
export * from './products';
export * from './categories';
export * from './coupons';
export * from './orders';
export * from './vendors';
export * from './marketing';
export * from './settings';
export * from './analytics';
export * from './promotions';
export * from './adminSubscriptions';

/**
 * Unified NovaMart API Service
 * Combines all domain APIs into a single backwards-compatible object.
 */
export const api = {
  ...authApi,
  ...productsApi,
  ...categoriesApi,
  ...couponsApi,
  ...ordersApi,
  ...vendorsApi,
  ...marketingApi,
  ...settingsApi,
  ...analyticsApi,
  ...promotionsApi,
  ...adminSubscriptionsApi
};

export default api;
