import fs from 'fs';
import path from 'path';
import {
  User,
  Product,
  Category,
  Order,
  PaymentTransaction,
  Review,
  Coupon,
  Banner,
  NotificationItem,
  StoreSettings,
  DeliveryAddress,
  Vendor,
  VendorPayoutRequest,
  PromotionPlan
} from '../src/types/index';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialCoupons,
  initialVendors
} from '../src/data/initialData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  payments: PaymentTransaction[];
  reviews: Review[];
  coupons: Coupon[];
  banners: Banner[];
  notifications: NotificationItem[];
  addresses: DeliveryAddress[];
  settings: StoreSettings;
  vendors: Vendor[];
  payouts: VendorPayoutRequest[];
  promotionPlans: PromotionPlan[];
  returnRequests: any[];
  loyalty: any[];
  auditLog: any[];
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "NovaMart Ghana",
  tagline: "Ghana's Premier Online Superstore & Marketplace — Electronics, Fashion, Home & More",
  logo: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&auto=format&fit=crop&q=80",
  storeEmail: "support@novamart.com.gh",
  storePhone: "+233 24 555 0199",
  businessAddress: "Independence Avenue, Airport City, Accra, Ghana",
  currency: "GHS",
  currencySymbol: "GH₵",
  exchangeRateToUSD: 0.065,
  standardDeliveryFee: 35,
  expressDeliveryFee: 70,
  freeDeliveryThreshold: 500,
  taxRate: 0.035, // 3.5% VAT / NHIL
  enableCOD: true,
  enableMoMo: true,
  enableCard: true,
  enablePaystack: true,
  socialLinks: {
    facebook: "https://facebook.com/novamartgh",
    instagram: "https://instagram.com/novamartgh",
    twitter: "https://twitter.com/novamartgh",
    whatsapp: "+233245550199"
  }
};

const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: "usr-super-admin",
    firstName: "Kwame",
    lastName: "Mensah",
    email: "admin@novamart.com.gh",
    phone: "+233 24 555 0199",
    role: "super_admin",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    passwordHash: "admin123",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z"
  },
  {
    id: "usr-admin-alias",
    firstName: "Kwame",
    lastName: "Mensah",
    email: "admin@novamart.com",
    phone: "+233 24 555 0199",
    role: "super_admin",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    passwordHash: "admin123",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z"
  },
  {
    id: "usr-admin-gh-alias",
    firstName: "Kwame",
    lastName: "Mensah",
    email: "admin@novamart.gh",
    phone: "+233 24 555 0199",
    role: "super_admin",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    passwordHash: "admin123",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z"
  },
  {
    id: "usr-store-manager",
    firstName: "Ama",
    lastName: "Boakye",
    email: "manager@novamart.com.gh",
    phone: "+233 20 444 0122",
    role: "store_manager",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    passwordHash: "manager123",
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z"
  },
  {
    id: "usr-cust-1",
    firstName: "Abena",
    lastName: "Osei",
    email: "maskarano111@gmail.com",
    phone: "+233 50 987 6543",
    role: "customer",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    passwordHash: "customer123",
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z"
  },
  {
    id: "usr-cust-alias",
    firstName: "Abena",
    lastName: "Osei",
    email: "customer@novamart.com",
    phone: "+233 50 987 6543",
    role: "customer",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    passwordHash: "customer123",
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z"
  },
  {
    id: "usr-cust-gh-alias",
    firstName: "Abena",
    lastName: "Osei",
    email: "customer@novamart.gh",
    phone: "+233 50 987 6543",
    role: "customer",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    passwordHash: "customer123",
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z"
  }
];

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: "addr-1",
    userId: "usr-cust-1",
    name: "Abena Osei",
    phone: "+233 50 987 6543",
    email: "maskarano111@gmail.com",
    country: "Ghana",
    region: "Greater Accra",
    city: "East Legon, Accra",
    address: "House 24, Lagos Avenue",
    landmark: "Near American House Roundabout",
    isDefault: true
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-portable-blender",
    productName: "Portable USB Rechargeable Fruit Juice Blender (380ml)",
    userId: "usr-cust-1",
    userName: "Abena Osei",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Blends fresh fruit smoothies in seconds!",
    comment: "This rechargeable blender is a lifesaver for office mornings in Accra. Powerful blades, easy to clean, and charges quickly with USB-C!",
    status: "approved",
    verifiedPurchase: true,
    createdAt: "2026-08-10T14:20:00.000Z"
  },
  {
    id: "rev-2",
    productId: "prod-bp-monitor",
    productName: "Automatic Digital Upper Arm Blood Pressure Monitor",
    userId: "usr-cust-2",
    userName: "Kofi Appiah",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Clear display and very accurate readings",
    comment: "Got this for my parents in Kumasi. The voice readout makes it so easy for them to monitor their pressure daily without assistance.",
    status: "approved",
    verifiedPurchase: true,
    createdAt: "2026-08-05T09:15:00.000Z"
  },
  {
    id: "rev-3",
    productId: "prod-iphone-15-pro",
    productName: "Apple iPhone 15 Pro Max (256GB Natural Titanium)",
    userId: "usr-cust-1",
    userName: "Abena Osei",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    title: "100% Genuine, sealed Apple box with warranty!",
    comment: "Received next-day delivery in East Legon. Checked serial number on Apple official site — 100% genuine with full 1 year warranty.",
    status: "approved",
    verifiedPurchase: true,
    createdAt: "2026-07-29T18:40:00.000Z"
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "NM-GH-94821",
    userId: "usr-cust-1",
    customerName: "Abena Osei",
    customerEmail: "maskarano111@gmail.com",
    customerPhone: "+233 50 987 6543",
    items: [
      {
        id: "item-1",
        productId: "prod-portable-blender",
        productName: "Portable USB Rechargeable Fruit Juice Blender (380ml)",
        productImage: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&auto=format&fit=crop&q=80",
        sku: "NK-BLND-USB380",
        unitPrice: 64,
        quantity: 2,
        total: 128
      },
      {
        id: "item-2",
        productId: "prod-bp-monitor",
        productName: "Automatic Digital Upper Arm Blood Pressure Monitor",
        productImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
        sku: "MC-BPM-ARM99",
        unitPrice: 98,
        quantity: 1,
        total: 98
      }
    ],
    subtotal: 226,
    discount: 10,
    couponCode: "WELCOME10",
    deliveryFee: 35,
    deliveryMethod: "standard",
    tax: 7.91,
    total: 258.91,
    paymentMethod: "mtn_momo",
    paymentStatus: "successful",
    paymentReference: "MOMO-NM-88492019",
    orderStatus: "Delivered",
    deliveryAddress: {
      name: "Abena Osei",
      phone: "+233 50 987 6543",
      email: "maskarano111@gmail.com",
      country: "Ghana",
      region: "Greater Accra",
      city: "East Legon, Accra",
      address: "House 24, Lagos Avenue",
      landmark: "Near American House Roundabout"
    },
    estimatedDeliveryDate: "2026-08-11",
    trackingNumber: "TRK-NM-94821-GH",
    timeline: [
      { status: "Order Placed", time: "2026-08-09T09:30:00.000Z", note: "Customer submitted order online" },
      { status: "Payment Confirmed", time: "2026-08-09T09:32:15.000Z", note: "MTN Mobile Money payment verified" },
      { status: "Processing", time: "2026-08-09T11:00:00.000Z", note: "Warehouse allocated inspected items" },
      { status: "Packed", time: "2026-08-09T15:45:00.000Z", note: "Sealed in protective transit packaging" },
      { status: "Shipped", time: "2026-08-10T08:00:00.000Z", note: "Dispatched with NovaMart courier" },
      { status: "Out for Delivery", time: "2026-08-10T10:15:00.000Z", note: "Rider is en route to delivery address" },
      { status: "Delivered", time: "2026-08-10T13:40:00.000Z", note: "Delivered in person to customer" }
    ],
    createdAt: "2026-08-09T09:30:00.000Z",
    updatedAt: "2026-08-10T13:40:00.000Z"
  }
];

const DEFAULT_PAYMENTS: PaymentTransaction[] = [
  {
    id: "pay-101",
    orderId: "ord-1001",
    orderNumber: "NM-GH-94821",
    transactionReference: "MOMO-NM-88492019",
    customerName: "Abena Osei",
    customerEmail: "maskarano111@gmail.com",
    amount: 258.91,
    currency: "GHS",
    paymentMethod: "mtn_momo",
    provider: "MTN Mobile Money",
    status: "successful",
    createdAt: "2026-08-09T09:32:15.000Z"
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    userId: "usr-cust-1",
    target: "customer",
    title: "Order Delivered! 📦",
    message: "Your NovaMart order NM-GH-94821 was successfully delivered to East Legon, Accra.",
    type: "order",
    read: false,
    link: "/account/orders",
    createdAt: "2026-08-19T08:00:00.000Z"
  },
  {
    id: "notif-2",
    target: "admin",
    title: "New Superstore Order #NM-GH-94821",
    message: "Abena Osei ordered Portable Blender & BP Monitor (GH₵ 258.91).",
    type: "order",
    read: true,
    link: "/admin/orders",
    createdAt: "2026-08-18T14:10:00.000Z"
  }
];

export const DEFAULT_PROMOTION_PLANS: PromotionPlan[] = [
  {
    id: 'plan-starter',
    tier: 'starter',
    name: 'Starter Boost',
    badge: 'Promoted',
    description: 'Essential product spotlight to accelerate catalog traction and initial orders.',
    priceGH: 99,
    priceNG: 9500,
    billingCycle: 'monthly',
    maxSlots: 3,
    searchBoostMultiplier: 1.5,
    features: [
      '3 Promoted Product Slots',
      "Standard 'Promoted' Pill Badge",
      '1.5x Search Ranking Priority',
      'Daily Impressions & Click Tracking',
      'Email Support'
    ],
    isPopular: false,
    colorGradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'plan-growth',
    tier: 'growth',
    name: 'Growth Accelerator',
    badge: 'Sponsored',
    description: 'High-velocity sales driver featuring homepage spotlights and priority ranking.',
    priceGH: 249,
    priceNG: 24000,
    billingCycle: 'monthly',
    maxSlots: 10,
    searchBoostMultiplier: 3.0,
    features: [
      '10 Promoted Product Slots',
      "Featured Gold 'Sponsored' Badge",
      '3.0x Catalog Search Multiplier',
      "Homepage 'Sponsored Spotlight' Showcase",
      'Real-time ROI & Conversion Analytics',
      'Priority Seller Support'
    ],
    isPopular: true,
    colorGradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'plan-enterprise',
    tier: 'enterprise',
    name: 'Enterprise Dominance',
    badge: 'VIP Sponsored',
    description: 'Category domination package for leading brands requiring maximum visibility.',
    priceGH: 599,
    priceNG: 59000,
    billingCycle: 'monthly',
    maxSlots: 999,
    searchBoostMultiplier: 5.0,
    features: [
      'Unlimited Promoted Product Slots',
      "Glowing VIP 'Official Partner' Badge",
      'Sticky Top-of-Category Header Placement',
      'Guaranteed Daily Deals & Flash Inclusion',
      'Dedicated Account Growth Manager',
      '24/7 Phone & WhatsApp Concierge'
    ],
    isPopular: false,
    colorGradient: 'from-purple-600 to-indigo-600'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Force refresh categories, banners, and settings to general superstore
        parsed.categories = initialCategories;
        parsed.banners = initialBanners;
        parsed.coupons = initialCoupons;
        parsed.settings = DEFAULT_SETTINGS;
        if (!parsed.products || parsed.products.length === 0) {
          parsed.products = initialProducts.map((p, i) => ({
            ...p,
            vendorId: p.vendorId || (i % 2 === 0 ? 'vend-kofi' : 'vend-ama'),
            vendorName: p.vendorName || (i % 2 === 0 ? 'Kofi Tech & Audio Hub' : 'Ama Organic & Beauty')
          }));
        } else {
          parsed.products = parsed.products.map((p: Product, i: number) => ({
            ...p,
            vendorId: p.vendorId || (i % 2 === 0 ? 'vend-kofi' : 'vend-ama'),
            vendorName: p.vendorName || (i % 2 === 0 ? 'Kofi Tech & Audio Hub' : 'Ama Organic & Beauty')
          }));
        }
        if (!parsed.orders || parsed.orders.length === 0) parsed.orders = DEFAULT_ORDERS;
        if (!parsed.reviews || parsed.reviews.length === 0) parsed.reviews = DEFAULT_REVIEWS;
        if (!parsed.vendors) parsed.vendors = initialVendors;
        if (!parsed.payouts) parsed.payouts = [];
        if (!parsed.promotionPlans) parsed.promotionPlans = DEFAULT_PROMOTION_PLANS;
        if (!parsed.returnRequests) parsed.returnRequests = [];
        if (!parsed.loyalty) parsed.loyalty = [];
        if (!parsed.auditLog) parsed.auditLog = [];
        this.saveData(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load stored database file, initializing defaults", e);
    }

    const initial: DatabaseSchema = {
      users: DEFAULT_USERS,
      products: initialProducts.map((p, i) => ({
        ...p,
        vendorId: p.vendorId || (i % 2 === 0 ? 'vend-kofi' : 'vend-ama'),
        vendorName: p.vendorName || (i % 2 === 0 ? 'Kofi Tech & Audio Hub' : 'Ama Organic & Beauty')
      })),
      categories: initialCategories,
      orders: DEFAULT_ORDERS,
      payments: DEFAULT_PAYMENTS,
      reviews: DEFAULT_REVIEWS,
      coupons: initialCoupons,
      banners: initialBanners,
      notifications: DEFAULT_NOTIFICATIONS,
      addresses: DEFAULT_ADDRESSES,
      settings: DEFAULT_SETTINGS,
      vendors: initialVendors,
      payouts: [],
      promotionPlans: DEFAULT_PROMOTION_PLANS,
      returnRequests: [],
      loyalty: [],
      auditLog: []
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Error saving data to disk:", e);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.data[key] = value;
    this.saveData(this.data);
  }

  public commit() {
    this.saveData(this.data);
  }
}

export const db = new Database();
