/**
 * NovaMart API Gateway
 * Modularized domain architecture.
 *
 * Domain sub-services:
 * - src/services/api/auth.ts
 * - src/services/api/products.ts
 * - src/services/api/categories.ts
 * - src/services/api/coupons.ts
 * - src/services/api/orders.ts
 * - src/services/api/vendors.ts
 * - src/services/api/marketing.ts
 * - src/services/api/settings.ts
 * - src/services/api/analytics.ts
 * - src/services/api/storage.ts
 */

export * from './api/index';
export { api as default, api } from './api/index';
