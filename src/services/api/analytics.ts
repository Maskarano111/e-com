import { Product, Order, PaymentTransaction, User } from '../../types/index';
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
        const users = getLocal<any[]>(STORAGE_KEYS.USERS, []);
        const today = new Date().toISOString().slice(0, 10);
        return {
          metrics: {
            totalRevenue: orders.filter((order) => order.paymentStatus === 'successful').reduce((sum, order) => sum + (order.total || 0), 0),
            revenueToday: orders.filter((order) => order.paymentStatus === 'successful' && order.createdAt.startsWith(today)).reduce((sum, order) => sum + (order.total || 0), 0),
            totalOrders: orders.length,
            pendingOrders: orders.filter((order) => ['Order Placed', 'Payment Confirmed'].includes(order.orderStatus)).length,
            totalProducts: prods.length,
            totalCustomers: users.filter((user) => user.role === 'customer').length,
            outOfStock: prods.filter((product) => product.stockQuantity <= 0).length,
            lowStock: prods.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 5).length
          },
          categorySales: [],
          lowStockProducts: prods.filter((product) => product.stockQuantity <= 5)
        };
      }
    );
  },

  async getAdminCustomers() {
    return safeFetch<any>(
      `${API_BASE}/admin/customers`,
      undefined,
      () => getLocal<User[]>(STORAGE_KEYS.USERS, []).filter((user) => user.role === 'customer')
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
