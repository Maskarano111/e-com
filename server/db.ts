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
  DeliveryAddress
} from '../src/types/index';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialCoupons
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
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Nova Perfumes & Luxury Lifestyle",
  tagline: "Ghana's Premier Boutique for 100% Authentic Luxury Fragrances, Arabian Oud & Lifestyle Accents",
  logo: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=150&auto=format&fit=crop&q=80",
  storeEmail: "concierge@novaperfumes.gh",
  storePhone: "+233 24 555 0199",
  businessAddress: "Suite 4B, The Galleria Mall, Airport Residential Area, Accra, Ghana",
  currency: "GHS",
  currencySymbol: "GH₵",
  exchangeRateToUSD: 0.065,
  standardDeliveryFee: 35,
  expressDeliveryFee: 65,
  freeDeliveryThreshold: 600,
  taxRate: 0.035, // 3.5% VAT / NHIL
  enableCOD: true,
  enableMoMo: true,
  enableCard: true,
  enablePaystack: true,
  socialLinks: {
    facebook: "https://facebook.com/novaperfumesgh",
    instagram: "https://instagram.com/novaperfumesgh",
    twitter: "https://twitter.com/novaperfumesgh",
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
    productId: "prod-baccarat-rouge-540",
    productName: "Maison Francis Kurkdjian Baccarat Rouge 540 Extrait",
    userId: "usr-cust-1",
    userName: "Abena Osei",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    title: "100% Genuine French Masterpiece & Phenomenal Sillage!",
    comment: "I was skeptical about ordering niche perfumes online in Ghana, but Nova Perfumes is the real deal! The ambergris and saffron notes last 24+ hours on my linen blazer. Arrived in Accra next morning with luxury gift wrapping!",
    status: "approved",
    verifiedPurchase: true,
    createdAt: "2026-08-10T14:20:00.000Z"
  },
  {
    id: "rev-2",
    productId: "prod-lattafa-khamrah",
    productName: "Lattafa Khamrah Eau de Parfum (100ml)",
    userId: "usr-cust-2",
    userName: "Kofi Appiah",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Best Boozy Vanilla Oud in Ghana!",
    comment: "Rich cinnamon, sweet dates, and smooth praline oud. Everyone in the office asks what I am wearing. Exceptional value for money!",
    status: "approved",
    verifiedPurchase: true,
    createdAt: "2026-08-05T09:15:00.000Z"
  },
  {
    id: "rev-3",
    productId: "prod-diptyque-baies-candle",
    productName: "Diptyque Paris Baies Luxury Scented Candle",
    userId: "usr-cust-1",
    userName: "Abena Osei",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Transforms the entire living room atmosphere",
    comment: "The fresh blackcurrant leaves and Bulgarian rose aroma fills my home within 10 minutes of lighting. Truly unmatched French luxury.",
    status: "approved",
    verifiedPurchase: true,
    createdAt: "2026-07-29T18:40:00.000Z"
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "NV-GH-94821",
    userId: "usr-cust-1",
    customerName: "Abena Osei",
    customerEmail: "maskarano111@gmail.com",
    customerPhone: "+233 50 987 6543",
    items: [
      {
        id: "item-1",
        productId: "prod-baccarat-rouge-540",
        variationId: "var-br540-70ml",
        variationName: "70ml Extrait Bottle",
        productName: "Maison Francis Kurkdjian Baccarat Rouge 540",
        productImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=80",
        sku: "MFK-BR540-70ML",
        unitPrice: 6200,
        quantity: 1,
        total: 6200
      },
      {
        id: "item-2",
        productId: "prod-diptyque-baies-candle",
        productName: "Diptyque Paris Baies Luxury Scented Candle",
        productImage: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop&q=80",
        sku: "DIP-BAIES-190G",
        unitPrice: 1190,
        quantity: 1,
        total: 1190
      }
    ],
    subtotal: 7390,
    discount: 50,
    couponCode: "LUXURY50",
    deliveryFee: 0,
    deliveryMethod: "express",
    tax: 256.90,
    total: 7596.90,
    paymentMethod: "paystack",
    paymentStatus: "successful",
    paymentReference: "PSTK-PERF-88492019",
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
    trackingNumber: "TRK-NV-94821-GH",
    timeline: [
      { status: "Order Placed", time: "2026-08-09T09:30:00.000Z", note: "Customer submitted order online" },
      { status: "Payment Confirmed", time: "2026-08-09T09:32:15.000Z", note: "Paystack Ghana payment verified" },
      { status: "Processing", time: "2026-08-09T11:00:00.000Z", note: "Concierge allocated authenticated batch" },
      { status: "Packed", time: "2026-08-09T15:45:00.000Z", note: "Luxury velvet ribbon & sealed box applied" },
      { status: "Shipped", time: "2026-08-10T08:00:00.000Z", note: "Dispatched with Nova Courier rider" },
      { status: "Out for Delivery", time: "2026-08-10T10:15:00.000Z", note: "Rider Samuel is en route" },
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
    orderNumber: "NV-GH-94821",
    transactionReference: "PSTK-PERF-88492019",
    customerName: "Abena Osei",
    customerEmail: "maskarano111@gmail.com",
    amount: 7596.90,
    currency: "GHS",
    paymentMethod: "paystack",
    provider: "Paystack (Visa/Mastercard)",
    status: "successful",
    createdAt: "2026-08-09T09:32:15.000Z"
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    userId: "usr-cust-1",
    target: "customer",
    title: "Fragrance Order Delivered! ✨",
    message: "Your luxury fragrance order NV-GH-94821 was successfully delivered to East Legon.",
    type: "order",
    read: false,
    link: "/account/orders",
    createdAt: "2026-08-19T08:00:00.000Z"
  },
  {
    id: "notif-2",
    target: "admin",
    title: "New High Value Order #NV-GH-94821",
    message: "Abena Osei ordered MFK Baccarat Rouge 540 & Diptyque Candle (GH₵ 7,596.90).",
    type: "order",
    read: true,
    link: "/admin/orders",
    createdAt: "2026-08-18T14:10:00.000Z"
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
        // If loaded data has older tech categories, refresh with perfume catalog
        if (parsed.categories && parsed.categories[0]?.id === 'cat-phones') {
          console.log('🔄 Upgrading catalog to Luxury Perfumes & Lifestyle Boutique...');
          parsed.categories = initialCategories;
          parsed.products = initialProducts;
          parsed.banners = initialBanners;
          parsed.coupons = initialCoupons;
          parsed.settings = DEFAULT_SETTINGS;
          parsed.orders = DEFAULT_ORDERS;
          parsed.reviews = DEFAULT_REVIEWS;
          this.saveData(parsed);
          return parsed;
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load stored database file, initializing defaults", e);
    }

    const initial: DatabaseSchema = {
      users: DEFAULT_USERS,
      products: initialProducts,
      categories: initialCategories,
      orders: DEFAULT_ORDERS,
      payments: DEFAULT_PAYMENTS,
      reviews: DEFAULT_REVIEWS,
      coupons: initialCoupons,
      banners: initialBanners,
      notifications: DEFAULT_NOTIFICATIONS,
      addresses: DEFAULT_ADDRESSES,
      settings: DEFAULT_SETTINGS
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
