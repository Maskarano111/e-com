import { Product, Order, PaymentTransaction } from '../../types/index';
import { initialProducts } from '../../data/initialData';
import { API_BASE, STORAGE_KEYS, getLocal, safeFetch } from './storage';

export const analyticsApi = {
  async getAdminAnalytics() {
    return safeFetch<any>(
      `${API_BASE}/admin/analytics`,
      undefined,
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
        return {
          totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 125400),
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
  }
};
