export type UserRole = 'super_admin' | 'admin' | 'store_manager' | 'vendor' | 'customer';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  vendorId?: string; // Links to Vendor profile if role is 'vendor'
  vendorStoreName?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Color: Midnight Blue / Size: 256GB"
  sku: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  attributes: Record<string, string>; // e.g. { Color: "Midnight Blue", Storage: "256GB" }
  image?: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName?: string;
  subCategory?: string;
  brand: string;
  vendorId?: string;
  vendorName?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  featuredImage: string;
  variations?: ProductVariation[];
  specifications: ProductSpecification[];
  weight?: string;
  tags: string[];
  originCountry?: 'GH' | 'NG';
  originCity?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  salesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  iconName?: string;
  description?: string;
  parentCategoryId?: string | null;
  subcategories?: string[];
  productCount?: number;
  featured?: boolean;
}

export interface CartItem {
  id: string; // unique item key e.g. `${productId}-${variationId || 'default'}`
  productId: string;
  vendorId?: string;
  vendorName?: string;
  variationId?: string;
  variationName?: string;
  name: string;
  image: string;
  price: number;
  regularPrice?: number;
  quantity: number;
  stockQuantity: number;
  sku: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';

export type PaymentMethod =
  | 'mtn_momo'
  | 'telecel_cash'
  | 'airteltigo'
  | 'card'
  | 'verve_card'
  | 'bank_transfer'
  | 'opay'
  | 'palmpay'
  | 'ussd'
  | 'paystack'
  | 'flutterwave'
  | 'cash_on_delivery';

export interface OrderItem {
  id: string;
  productId: string;
  vendorId?: string;
  vendorName?: string;
  variationId?: string;
  variationName?: string;
  productName: string;
  productImage: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface DeliveryAddress {
  id?: string;
  userId?: string;
  name: string;
  phone: string;
  email?: string;
  country: string;
  region: string;
  city: string;
  address: string;
  landmark?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  deliveryMethod: 'standard' | 'express' | 'store_pickup';
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  orderStatus: OrderStatus;
  deliveryAddress: DeliveryAddress;
  estimatedDeliveryDate: string;
  trackingNumber: string;
  timeline: {
    status: OrderStatus;
    time: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  transactionReference: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  provider: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  country?: 'GH' | 'NG' | string;
  location?: string;
  helpfulCount?: number;
  status: 'approved' | 'pending' | 'rejected';
  verifiedPurchase: boolean;
  createdAt: string;
}


export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minimumPurchase: number;
  maximumDiscount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'inactive';
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  message?: string;
  image: string;
  buttonText: string;
  destinationUrl: string;
  position: 'hero' | 'middle_promo' | 'sidebar' | 'popup';
  status: 'active' | 'inactive';
  order: number;
}

export interface NotificationItem {
  id: string;
  userId?: string; // empty means broadcast to admin
  target: 'customer' | 'admin' | 'all';
  title: string;
  message: string;
  type: 'order' | 'payment' | 'stock' | 'system' | 'promo';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logo: string;
  storeEmail: string;
  storePhone: string;
  businessAddress: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToUSD?: number;
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  freeDeliveryThreshold: number;
  taxRate: number; // e.g. 0.05 for 5%
  enableCOD: boolean;
  enableMoMo: boolean;
  enableCard: boolean;
  enablePaystack: boolean;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  originCountry?: 'all' | 'GH' | 'NG';
  localOnly?: boolean;
  availability?: 'in_stock' | 'all';
  sortBy?: 'newest' | 'popularity' | 'price_low' | 'price_high' | 'rating';
  featured?: boolean;
  dealsOnly?: boolean;
}

export interface VendorPayoutDetails {
  method: 'mtn_momo' | 'telecel_cash' | 'airteltigo' | 'bank_transfer';
  accountName: string;
  accountNumber: string;
  bankName?: string;
  branch?: string;
}

export interface VendorVerificationDocuments {
  businessRegNumber?: string; // CAC or RGD Registration
  businessRegDoc?: string; // Document image / PDF
  tin?: string; // Tax Identification Number
  nationalIdType?: string; // Ghana Card, NIN, Passport, Driver's License
  nationalIdNumber?: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
  proofOfAddressDoc?: string;
  stateOrRegion?: string;
  submittedAt?: string;
  rejectionReason?: string;
}

export interface Vendor {
  id: string;
  userId: string; // ID of the User associated with this vendor
  storeName: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  logo: string;
  banner?: string;
  country?: 'Ghana' | 'Nigeria';
  countryCode?: 'GH' | 'NG';
  address: string;
  city: string;
  stateOrRegion?: string;
  status: 'active' | 'pending' | 'suspended';
  verificationDocuments?: VendorVerificationDocuments;
  commissionRate: number; // e.g. 10 for 10%
  payoutDetails: VendorPayoutDetails;
  rating: number;
  reviewCount: number;
  totalProducts?: number;
  totalSales?: number;
  totalRevenue?: number;
  balance?: number; // Available payout balance
  pendingBalance?: number;
  createdAt: string;
  updatedAt: string;
}


export interface VendorPayoutRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  payoutDetails: VendorPayoutDetails;
  notes?: string;
  transactionRef?: string;
  createdAt: string;
  processedAt?: string;
}

