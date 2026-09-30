import { initialBanners, initialCategories, initialCoupons, initialProducts, initialVendors } from '../../data/initialData';
import { Order, Product, Review, User, Vendor } from '../../types';
import { STORAGE_KEYS, getLocal, setLocal } from './storage';

const DEMO_USERS: User[] = [
  { id: 'usr-super-admin', firstName: 'Kwame', lastName: 'Mensah', email: 'admin@novamart.com.gh', phone: '+233 24 555 0199', role: 'super_admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-08-19T00:00:00.000Z' },
  { id: 'usr-store-manager', firstName: 'Ama', lastName: 'Boakye', email: 'manager@novamart.com.gh', phone: '+233 20 444 0122', role: 'store_manager', createdAt: '2026-02-15T00:00:00.000Z', updatedAt: '2026-08-19T00:00:00.000Z' },
  { id: 'usr-kofi-seller', firstName: 'Kofi', lastName: 'Boateng', email: 'kofi.seller@novamart.com.gh', phone: '+233 24 888 1234', role: 'vendor', vendorId: 'vend-kofi', vendorStoreName: 'Kofi Tech & Audio Hub', createdAt: '2026-01-10T10:00:00.000Z', updatedAt: '2026-08-19T00:00:00.000Z' },
  { id: 'usr-cust-1', firstName: 'Abena', lastName: 'Osei', email: 'maskarano111@gmail.com', phone: '+233 50 987 6543', role: 'customer', createdAt: '2026-03-10T00:00:00.000Z', updatedAt: '2026-08-19T00:00:00.000Z' },
  { id: 'usr-demo-cust-2', firstName: 'Kojo', lastName: 'Asare', email: 'kojo.asare@example.com', phone: '+233 24 555 0112', role: 'customer', createdAt: '2026-04-22T00:00:00.000Z', updatedAt: '2026-08-19T00:00:00.000Z' },
  { id: 'usr-demo-cust-3', firstName: 'Esi', lastName: 'Owusu', email: 'esi.owusu@example.com', phone: '+233 55 555 0198', role: 'customer', createdAt: '2026-05-05T00:00:00.000Z', updatedAt: '2026-08-19T00:00:00.000Z' }
];

const assignDemoVendor = (product: Product, index: number) => {
  if (product.originCountry === 'NG') return product.categoryId === 'cat-fashion' ? 'vend-yemi' : 'vend-chidi';
  if (product.categoryId === 'cat-beauty') return 'vend-akosua';
  if (product.categoryId === 'cat-fashion') return index % 2 ? 'vend-yemi' : 'vend-akosua';
  if (['cat-phones', 'cat-electronics', 'cat-computing', 'cat-appliances', 'cat-health'].includes(product.categoryId)) return 'vend-kofi';
  return index % 2 ? 'vend-akosua' : 'vend-kofi';
};

const makeDemoOrders = (products: Product[]): Order[] => {
  const sellerProducts = products.filter((product) => product.vendorId === 'vend-kofi').slice(0, 4);
  if (!sellerProducts.length) return [];
  const now = Date.now();
  const createOrder = (index: number, dayOffset: number, status: Order['orderStatus']): Order => {
    const itemProducts = sellerProducts.slice(index % sellerProducts.length, (index % sellerProducts.length) + 2);
    const items = (itemProducts.length ? itemProducts : [sellerProducts[index % sellerProducts.length]]).map((product, itemIndex) => ({
      id: `demo-item-${index}-${itemIndex}`,
      productId: product.id,
      vendorId: 'vend-kofi',
      vendorName: 'Kofi Tech & Audio Hub',
      productName: product.name,
      productImage: product.featuredImage,
      sku: product.sku,
      unitPrice: product.discountPrice || product.price,
      quantity: itemIndex + 1,
      total: (product.discountPrice || product.price) * (itemIndex + 1)
    }));
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const createdAt = new Date(now - dayOffset * 86400000).toISOString();
    return {
      id: `demo-order-${index + 1}`,
      orderNumber: `NM-DEMO-${2400 + index}`,
      userId: index === 0 ? 'usr-cust-1' : `usr-demo-cust-${index + 1}`,
      customerName: ['Abena Osei', 'Kojo Asare', 'Esi Owusu'][index % 3],
      customerEmail: ['maskarano111@gmail.com', 'kojo.asare@example.com', 'esi.owusu@example.com'][index % 3],
      customerPhone: ['+233 50 987 6543', '+233 24 555 0112', '+233 55 555 0198'][index % 3],
      items,
      subtotal,
      discount: index === 1 ? 10 : 0,
      deliveryFee: 25,
      deliveryMethod: index === 2 ? 'express' : 'standard',
      tax: Math.round(subtotal * 0.035 * 100) / 100,
      total: subtotal + 25 + Math.round(subtotal * 0.035 * 100) / 100 - (index === 1 ? 10 : 0),
      paymentMethod: index === 1 ? 'cash_on_delivery' : 'mtn_momo',
      paymentStatus: index === 2 ? 'pending' : 'successful',
      paymentReference: index === 2 ? undefined : `DEMO-MOMO-${88420 + index}`,
      orderStatus: status,
      deliveryAddress: { name: ['Abena Osei', 'Kojo Asare', 'Esi Owusu'][index % 3], phone: '+233 24 555 0199', country: 'Ghana', region: 'Greater Accra', city: ['East Legon', 'Osu', 'Madina'][index % 3], address: ['House 24, Lagos Avenue', 'Oxford Street', 'Atomic Junction'][index % 3] },
      estimatedDeliveryDate: new Date(now + (2 + index) * 86400000).toISOString().slice(0, 10),
      trackingNumber: `TRK-DEMO-${8100 + index}`,
      timeline: [{ status: 'Order Placed', time: createdAt, note: 'Demo order submitted for preview' }],
      createdAt,
      updatedAt: createdAt
    };
  };
  return [createOrder(0, 1, 'Processing'), createOrder(1, 3, 'Shipped'), createOrder(2, 6, 'Order Placed')];
};

const seedIfEmpty = <T,>(key: string, initial: T[]): T[] => {
  const current = getLocal<T[]>(key, initial);
  if (!current.length && initial.length) {
    setLocal(key, initial);
    return initial;
  }
  return current;
};

/** Seeds and repairs local-only records so a static Netlify demo has realistic, editable examples. */
export const seedDemoData = () => {
  try {
    if (localStorage.getItem('novamart_demo_seed_version') === '2') return;
  } catch {}

  const vendors = seedIfEmpty<Vendor>(STORAGE_KEYS.VENDORS, initialVendors).map((vendor) => {
    if (vendor.id !== 'vend-kofi' || vendor.subscription) return vendor;
    return {
      ...vendor,
      subscription: {
        tier: 'starter' as const,
        planName: 'Starter Boost',
        status: 'active' as const,
        durationMonths: 1,
        price: 99,
        totalPrice: 99,
        currency: 'GHS',
        startedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
        slotsTotal: 3,
        slotsUsed: 1,
        autoRenew: false,
        paymentMethod: 'demo_wallet'
      }
    };
  });
  setLocal(STORAGE_KEYS.VENDORS, vendors);

  const vendorNames = new Map(vendors.map((vendor) => [vendor.id, vendor.storeName]));
  const products = seedIfEmpty<Product>(STORAGE_KEYS.PRODUCTS, initialProducts).map((product, index) => {
    const vendorId = product.vendorId || assignDemoVendor(product, index);
    const isSampleBoost = vendorId === 'vend-kofi' && product.id === 'prod-iphone-15-pro' && product.isPromoted === undefined;
    return {
      ...product,
      vendorId,
      vendorName: product.vendorName || vendorNames.get(vendorId) || 'NovaMart Marketplace Seller',
      ...(isSampleBoost ? { isPromoted: true, promotionTier: 'starter' as const, promotionImpressions: 1280, promotionClicks: 74 } : {})
    };
  });
  setLocal(STORAGE_KEYS.PRODUCTS, products);

  const sampleOrders = makeDemoOrders(products);
  seedIfEmpty<Order>(STORAGE_KEYS.ORDERS, sampleOrders);
  const existingOrders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, sampleOrders);
  const migratedOrders = existingOrders.map((order) => ({
    ...order,
    items: (order.items || []).map((item) => {
      if (item.vendorId) return item;
      const product = products.find((entry) => entry.id === item.productId);
      return product ? { ...item, vendorId: product.vendorId, vendorName: product.vendorName } : item;
    })
  }));
  setLocal(STORAGE_KEYS.ORDERS, migratedOrders);

  const sampleReviews: Review[] = products.slice(0, 4).map((product, index) => ({
    id: `demo-review-${index + 1}`,
    productId: product.id,
    productName: product.name,
    userId: `usr-demo-cust-${index + 1}`,
    userName: ['Kojo Asare', 'Esi Owusu', 'Abena Osei', 'Yaw Mensah'][index],
    rating: [5, 4, 5, 4][index],
    title: ['Excellent quality', 'Good value for money', 'Just what I needed', 'Fast delivery'][index],
    comment: [
      'The product arrived in great condition and works exactly as described.',
      'Good quality for the price. Delivery updates were helpful.',
      'Really happy with this purchase. I would recommend it.',
      'Item matched the listing and was carefully packaged.'
    ][index],
    status: index === 3 ? 'pending' : 'approved',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - (index + 2) * 86400000).toISOString()
  }));
  seedIfEmpty<Review>(STORAGE_KEYS.REVIEWS, sampleReviews);
  seedIfEmpty(STORAGE_KEYS.CATEGORIES, initialCategories);
  seedIfEmpty(STORAGE_KEYS.BANNERS, initialBanners);
  seedIfEmpty(STORAGE_KEYS.COUPONS, initialCoupons);
  seedIfEmpty<User>(STORAGE_KEYS.USERS, DEMO_USERS);
  seedIfEmpty(STORAGE_KEYS.PAYOUTS, [
    { id: 'demo-payout-1', vendorId: 'vend-kofi', vendorName: 'Kofi Tech & Audio Hub', amount: 2500, status: 'completed' as const, payoutDetails: { method: 'mtn_momo' as const, accountName: 'Kofi Boateng', accountNumber: '0248881234' }, transactionRef: 'DEMO-PAYOUT-98231', createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), processedAt: new Date(Date.now() - 11 * 86400000).toISOString() },
    { id: 'demo-payout-2', vendorId: 'vend-kofi', vendorName: 'Kofi Tech & Audio Hub', amount: 800, status: 'pending' as const, payoutDetails: { method: 'mtn_momo' as const, accountName: 'Kofi Boateng', accountNumber: '0248881234' }, transactionRef: 'DEMO-PAYOUT-98232', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() }
  ]);
  try { localStorage.setItem('novamart_demo_seed_version', '2'); } catch {}
};
