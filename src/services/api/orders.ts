import { Order } from '../../types/index';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export const ordersApi = {
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
        const total = Number(data.totalAmount || data.total || 0);
        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          orderNumber: `NM-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: data.userId || 'usr-guest',
          customerName: data.customerName || 'Customer',
          customerEmail: data.customerEmail || 'customer@example.com',
          customerPhone: data.customerPhone || '+233 24 555 0199',
          items: data.items || [],
          subtotal: Number(data.subtotal || 0),
          discount: Number(data.discountAmount || data.discount || 0),
          couponCode: data.couponCode,
          deliveryFee: Number(data.deliveryFee || 0),
          deliveryMethod: data.deliveryType === 'express' ? 'express' : 'standard',
          tax: Number(data.taxAmount || data.tax || 0),
          total,
          deliveryAddress: data.deliveryAddress || {
            name: 'Customer',
            phone: '+233 24 555 0199',
            country: 'Ghana',
            city: 'Accra',
            region: 'Greater Accra',
            address: 'Airport Residential, Accra'
          },
          paymentMethod: data.paymentMethod || 'mtn_momo',
          paymentStatus: 'successful',
          orderStatus: 'Payment Confirmed',
          estimatedDeliveryDate: '2-3 Business Days',
          trackingNumber: `TRK-GH-${Date.now()}`,
          timeline: [
            {
              status: 'Order Placed',
              time: new Date().toISOString(),
              note: 'Order successfully registered'
            },
            {
              status: 'Payment Confirmed',
              time: new Date().toISOString(),
              note: 'Mobile Money payment verified'
            }
          ],
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

  // Return Requests
  async createReturnRequest(orderId: string, data: { reason: string; refundPreference?: string; additionalNotes?: string }) {
    return safeFetch<{ returnRequest: any }>(
      `${API_BASE}/orders/${orderId}/return-request`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => ({ returnRequest: { id: `ret-${Date.now()}`, orderId, status: 'pending', ...data, createdAt: new Date().toISOString() } })
    );
  },

  async getAdminReturnRequests() {
    return safeFetch<any[]>(
      `${API_BASE}/admin/return-requests`,
      undefined,
      () => []
    );
  },

  async updateReturnRequest(id: string, data: { status: string; adminNote?: string; refundAmount?: number }) {
    return safeFetch<{ returnRequest: any }>(
      `${API_BASE}/admin/return-requests/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => ({ returnRequest: { id, ...data } })
    );
  }
};
