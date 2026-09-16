import { Vendor, VendorPayoutRequest, Product, Order, User } from '../../types/index';
import { initialVendors, initialProducts } from '../../data/initialData';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export const vendorsApi = {
  async getVendors() {
    return safeFetch<Vendor[]>(
      `${API_BASE}/vendors`,
      undefined,
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);

        // Augment vendors with dynamic stats
        return vendors.map((v) => {
          const vProds = prods.filter((p) => p.vendorId === v.id);
          // Calculate sales
          let totalSales = v.totalSales || 0;
          let totalRevenue = v.totalRevenue || 0;
          orders.forEach((o) => {
            o.items.forEach((item) => {
              if (item.vendorId === v.id) {
                totalSales += item.quantity;
                totalRevenue += item.total;
              }
            });
          });

          return {
            ...v,
            totalProducts: vProds.length || v.totalProducts || 0,
            totalSales: Math.max(v.totalSales || 0, totalSales),
            totalRevenue: Math.max(v.totalRevenue || 0, totalRevenue)
          };
        });
      }
    );
  },

  async getVendorById(vendorId: string) {
    return safeFetch<Vendor | null>(
      `${API_BASE}/vendors/${vendorId}`,
      undefined,
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        return vendors.find((v) => v.id === vendorId || v.userId === vendorId) || null;
      }
    );
  },

  async createVendor(data: {
    storeName: string;
    ownerFirstName: string;
    ownerLastName: string;
    email: string;
    phone: string;
    password?: string;
    category: string;
    description?: string;
    logo?: string;
    address: string;
    city?: string;
    stateOrRegion?: string;
    country?: 'Ghana' | 'Nigeria';
    countryCode?: 'GH' | 'NG';
    status?: 'active' | 'pending' | 'suspended';
    verificationDocuments?: any;
    commissionRate?: number;
    payoutDetails: {
      method: 'mtn_momo' | 'telecel_cash' | 'airteltigo' | 'bank_transfer';
      accountName: string;
      accountNumber: string;
      bankName?: string;
    };
  }) {
    return safeFetch<{ vendor: Vendor; user: User }>(
      `${API_BASE}/vendors`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const users = getLocal<any[]>(STORAGE_KEYS.USERS, []);

        const vendorId = `vend-${Date.now().toString().slice(-6)}`;
        const userId = `usr-seller-${Date.now().toString().slice(-6)}`;

        // 1. Create vendor user account
        const newUser: User = {
          id: userId,
          firstName: data.ownerFirstName,
          lastName: data.ownerLastName,
          email: data.email,
          phone: data.phone,
          role: 'vendor',
          vendorId: vendorId,
          vendorStoreName: data.storeName,
          profileImage: data.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        users.push({ ...newUser, passwordHash: data.password || 'seller123' });
        setLocal(STORAGE_KEYS.USERS, users);

        // 2. Create Vendor profile with verification documents
        const newVendor: Vendor = {
          id: vendorId,
          userId: userId,
          storeName: data.storeName,
          slug: data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          ownerName: `${data.ownerFirstName} ${data.ownerLastName}`,
          email: data.email,
          phone: data.phone,
          category: data.category,
          description: data.description || `Official store of ${data.storeName} on NovaMart West Africa.`,
          logo: data.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
          country: data.country || (data.countryCode === 'NG' ? 'Nigeria' : 'Ghana'),
          countryCode: data.countryCode || (data.country === 'Nigeria' ? 'NG' : 'GH'),
          address: data.address,
          city: data.city || (data.countryCode === 'NG' ? 'Lagos' : 'Accra'),
          stateOrRegion: data.stateOrRegion,
          status: data.status || 'pending',
          verificationDocuments: data.verificationDocuments,
          commissionRate: data.commissionRate !== undefined ? data.commissionRate : 10,
          payoutDetails: data.payoutDetails,
          rating: 5.0,
          reviewCount: 0,
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          balance: 0,
          pendingBalance: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        vendors.unshift(newVendor);
        setLocal(STORAGE_KEYS.VENDORS, vendors);

        return { vendor: newVendor, user: newUser };
      }
    );
  },

  async approveVendor(vendorId: string) {
    return safeFetch<{ vendor: Vendor }>(
      `${API_BASE}/vendors/${vendorId}/approve`,
      { method: 'PUT' },
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const idx = vendors.findIndex((v) => v.id === vendorId || v.userId === vendorId);
        if (idx === -1) throw new Error('Vendor not found');

        vendors[idx] = {
          ...vendors[idx],
          status: 'active',
          updatedAt: new Date().toISOString()
        };
        setLocal(STORAGE_KEYS.VENDORS, vendors);
        return { vendor: vendors[idx] };
      }
    );
  },

  async rejectVendor(vendorId: string, reason: string) {
    return safeFetch<{ vendor: Vendor }>(
      `${API_BASE}/vendors/${vendorId}/reject`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      },
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const idx = vendors.findIndex((v) => v.id === vendorId || v.userId === vendorId);
        if (idx === -1) throw new Error('Vendor not found');

        vendors[idx] = {
          ...vendors[idx],
          status: 'suspended',
          verificationDocuments: {
            ...vendors[idx].verificationDocuments,
            rejectionReason: reason
          },
          updatedAt: new Date().toISOString()
        };
        setLocal(STORAGE_KEYS.VENDORS, vendors);
        return { vendor: vendors[idx] };
      }
    );
  },

  async updateVendor(vendorId: string, data: Partial<Vendor>) {
    return safeFetch<{ vendor: Vendor }>(
      `${API_BASE}/vendors/${vendorId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const idx = vendors.findIndex((v) => v.id === vendorId || v.userId === vendorId);
        if (idx === -1) throw new Error('Vendor not found');

        vendors[idx] = {
          ...vendors[idx],
          ...data,
          updatedAt: new Date().toISOString()
        };
        setLocal(STORAGE_KEYS.VENDORS, vendors);
        return { vendor: vendors[idx] };
      }
    );
  },

  async deleteVendor(vendorId: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/vendors/${vendorId}`,
      { method: 'DELETE' },
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const filtered = vendors.filter((v) => v.id !== vendorId);
        setLocal(STORAGE_KEYS.VENDORS, filtered);
        return { success: true };
      }
    );
  },

  async getVendorProducts(vendorId: string) {
    return safeFetch<{ products: Product[] }>(
      `${API_BASE}/vendors/${vendorId}/products`,
      undefined,
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        // Match either explicit vendorId or fallback for demo
        const filtered = prods.filter((p) => p.vendorId === vendorId);
        if (filtered.length === 0 && vendorId === 'vend-kofi') {
          // If kofi, assign a few tech products if not tagged yet
          return { products: prods.slice(0, 5).map(p => ({ ...p, vendorId: 'vend-kofi', vendorName: 'Kofi Tech & Audio Hub' })) };
        }
        return { products: filtered };
      }
    );
  },

  async createVendorProduct(vendorId: string, productData: Partial<Product>) {
    return safeFetch<{ product: Product }>(
      `${API_BASE}/vendors/${vendorId}/products`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      },
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const vendor = vendors.find((v) => v.id === vendorId || v.userId === vendorId);

        const newProd: Product = {
          id: `prod-${Date.now()}`,
          name: productData.name || 'New Vendor Product',
          slug: (productData.name || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: productData.description || 'Quality product from verified vendor.',
          shortDescription: productData.shortDescription || 'Verified genuine quality.',
          categoryId: productData.categoryId || 'cat-phones',
          brand: productData.brand || vendor?.storeName || 'NovaMart Vendor',
          vendorId: vendor?.id || vendorId,
          vendorName: vendor?.storeName || 'Verified Seller',
          sku: productData.sku || `VND-${Date.now().toString().slice(-4)}`,
          price: productData.price || 100,
          discountPrice: productData.discountPrice,
          stockQuantity: productData.stockQuantity || 10,
          status: productData.status || 'active',
          featured: productData.featured || false,
          rating: 5.0,
          reviewCount: 0,
          images: productData.images && productData.images.length > 0 ? productData.images : [productData.featuredImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
          featuredImage: productData.featuredImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          specifications: productData.specifications || [],
          tags: productData.tags || ['Vendor Special'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        prods.unshift(newProd);
        setLocal(STORAGE_KEYS.PRODUCTS, prods);

        // Update vendor product count
        if (vendor) {
          const vIdx = vendors.findIndex(v => v.id === vendor.id);
          if (vIdx !== -1) {
            vendors[vIdx].totalProducts = (vendors[vIdx].totalProducts || 0) + 1;
            setLocal(STORAGE_KEYS.VENDORS, vendors);
          }
        }

        return { product: newProd };
      }
    );
  },

  async updateVendorProduct(vendorId: string, productId: string, productData: Partial<Product>) {
    return safeFetch<{ product: Product }>(
      `${API_BASE}/vendors/${vendorId}/products/${productId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      },
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const idx = prods.findIndex((p) => p.id === productId);
        if (idx === -1) throw new Error('Product not found');

        prods[idx] = {
          ...prods[idx],
          ...productData,
          updatedAt: new Date().toISOString()
        };
        setLocal(STORAGE_KEYS.PRODUCTS, prods);
        return { product: prods[idx] };
      }
    );
  },

  async deleteVendorProduct(vendorId: string, productId: string) {
    return safeFetch<{ success: boolean }>(
      `${API_BASE}/vendors/${vendorId}/products/${productId}`,
      { method: 'DELETE' },
      () => {
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const filtered = prods.filter((p) => p.id !== productId);
        setLocal(STORAGE_KEYS.PRODUCTS, filtered);
        return { success: true };
      }
    );
  },

  async getVendorOrders(vendorId: string) {
    return safeFetch<Order[]>(
      `${API_BASE}/vendors/${vendorId}/orders`,
      undefined,
      () => {
        const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
        // Return orders that contain at least one item from this vendor
        return orders.filter((o) =>
          o.items.some((item) => item.vendorId === vendorId || !item.vendorId)
        );
      }
    );
  },

  async getVendorStats(vendorId: string) {
    return safeFetch<{
      grossRevenue: number;
      netEarnings: number;
      commissionPaid: number;
      ordersCount: number;
      productsCount: number;
      lowStockCount: number;
      rating: number;
      reviewCount: number;
      balance: number;
      pendingBalance: number;
    }>(
      `${API_BASE}/vendors/${vendorId}/stats`,
      undefined,
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const prods = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
        const vendor = vendors.find((v) => v.id === vendorId || v.userId === vendorId);

        const vProds = prods.filter((p) => p.vendorId === (vendor?.id || vendorId));
        const lowStock = vProds.filter((p) => p.stockQuantity < 5).length;

        const commissionRate = vendor?.commissionRate || 10;
        const grossRevenue = vendor?.totalRevenue || 18450;
        const commissionPaid = (grossRevenue * commissionRate) / 100;
        const netEarnings = grossRevenue - commissionPaid;

        return {
          grossRevenue,
          netEarnings,
          commissionPaid,
          ordersCount: vendor?.totalSales || 48,
          productsCount: vProds.length || vendor?.totalProducts || 12,
          lowStockCount: lowStock,
          rating: vendor?.rating || 4.8,
          reviewCount: vendor?.reviewCount || 64,
          balance: vendor?.balance || 3450.00,
          pendingBalance: vendor?.pendingBalance || 1200.00
        };
      }
    );
  },

  async getVendorPayouts(vendorId: string) {
    return safeFetch<VendorPayoutRequest[]>(
      `${API_BASE}/vendors/${vendorId}/payouts`,
      undefined,
      () => {
        const payouts = getLocal<VendorPayoutRequest[]>(STORAGE_KEYS.PAYOUTS, [
          {
            id: 'pay-001',
            vendorId: 'vend-kofi',
            vendorName: 'Kofi Tech & Audio Hub',
            amount: 2500,
            status: 'completed',
            payoutDetails: {
              method: 'mtn_momo',
              accountName: 'Kofi Boateng',
              accountNumber: '0248881234'
            },
            transactionRef: 'MOMO-PAY-98231',
            createdAt: '2026-02-10T14:20:00Z',
            processedAt: '2026-02-11T10:00:00Z'
          },
          {
            id: 'pay-002',
            vendorId: 'vend-kofi',
            vendorName: 'Kofi Tech & Audio Hub',
            amount: 1500,
            status: 'completed',
            payoutDetails: {
              method: 'mtn_momo',
              accountName: 'Kofi Boateng',
              accountNumber: '0248881234'
            },
            transactionRef: 'MOMO-PAY-99412',
            createdAt: '2026-02-18T16:45:00Z',
            processedAt: '2026-02-19T09:30:00Z'
          }
        ]);
        return payouts.filter((p) => p.vendorId === vendorId);
      }
    );
  },

  async requestVendorPayout(data: {
    vendorId: string;
    amount: number;
    payoutDetails: any;
    notes?: string;
  }) {
    return safeFetch<{ payout: VendorPayoutRequest }>(
      `${API_BASE}/vendors/${data.vendorId}/payouts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const payouts = getLocal<VendorPayoutRequest[]>(STORAGE_KEYS.PAYOUTS, []);
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const vIdx = vendors.findIndex((v) => v.id === data.vendorId || v.userId === data.vendorId);
        const vendor = vendors[vIdx];

        const newPayout: VendorPayoutRequest = {
          id: `pay-${Date.now().toString().slice(-6)}`,
          vendorId: data.vendorId,
          vendorName: vendor?.storeName || 'Vendor Store',
          amount: data.amount,
          status: 'pending',
          payoutDetails: data.payoutDetails || vendor?.payoutDetails,
          notes: data.notes,
          createdAt: new Date().toISOString()
        };

        payouts.unshift(newPayout);
        setLocal(STORAGE_KEYS.PAYOUTS, payouts);

        // Deduct from available balance and move to pending
        if (vIdx !== -1) {
          vendors[vIdx].balance = Math.max(0, (vendors[vIdx].balance || 0) - data.amount);
          vendors[vIdx].pendingBalance = (vendors[vIdx].pendingBalance || 0) + data.amount;
          setLocal(STORAGE_KEYS.VENDORS, vendors);
        }

        return { payout: newPayout };
      }
    );
  },

  async getAdminPayoutRequests() {
    return safeFetch<VendorPayoutRequest[]>(
      `${API_BASE}/admin/vendor-payouts`,
      undefined,
      () => {
        return getLocal<VendorPayoutRequest[]>(STORAGE_KEYS.PAYOUTS, [
          {
            id: 'pay-001',
            vendorId: 'vend-kofi',
            vendorName: 'Kofi Tech & Audio Hub',
            amount: 2500,
            status: 'completed',
            payoutDetails: {
              method: 'mtn_momo',
              accountName: 'Kofi Boateng',
              accountNumber: '0248881234'
            },
            transactionRef: 'MOMO-PAY-98231',
            createdAt: '2026-02-10T14:20:00Z',
            processedAt: '2026-02-11T10:00:00Z'
          }
        ]);
      }
    );
  },

  async approvePayoutRequest(payoutId: string, transactionRef?: string) {
    return safeFetch<{ payout: any }>(
      `${API_BASE}/admin/vendor-payouts/${payoutId}/approve`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionRef })
      },
      () => {
        const payouts = getLocal<any[]>(STORAGE_KEYS.PAYOUTS, []);
        const idx = payouts.findIndex(p => p.id === payoutId);
        if (idx !== -1) {
          payouts[idx].status = 'completed';
          payouts[idx].transactionRef = transactionRef || `REF-${Date.now()}`;
          setLocal(STORAGE_KEYS.PAYOUTS, payouts);
          return { payout: payouts[idx] };
        }
        return { payout: {} };
      }
    );
  },

  async rejectPayoutRequest(payoutId: string, reason?: string) {
    return safeFetch<{ payout: any }>(
      `${API_BASE}/admin/vendor-payouts/${payoutId}/reject`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      },
      () => {
        const payouts = getLocal<any[]>(STORAGE_KEYS.PAYOUTS, []);
        const idx = payouts.findIndex(p => p.id === payoutId);
        if (idx !== -1) {
          payouts[idx].status = 'rejected';
          payouts[idx].notes = reason;
          setLocal(STORAGE_KEYS.PAYOUTS, payouts);
          return { payout: payouts[idx] };
        }
        return { payout: {} };
      }
    );
  },

  async suspendVendor(vendorId: string) {
    return safeFetch<{ vendor: Vendor }>(
      `${API_BASE}/vendors/${vendorId}/suspend`,
      { method: 'PUT' },
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const idx = vendors.findIndex(v => v.id === vendorId);
        if (idx !== -1) {
          vendors[idx].status = 'suspended';
          setLocal(STORAGE_KEYS.VENDORS, vendors);
          return { vendor: vendors[idx] };
        }
        return { vendor: {} as Vendor };
      }
    );
  }
};
