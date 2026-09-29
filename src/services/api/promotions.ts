import { PromotionPlan, VendorPromotionSubscription, Product, PromotionAnalytics, Vendor } from '../../types/index';
import { initialVendors } from '../../data/initialData';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export interface VendorPromotionStatusResponse {
  success: boolean;
  subscription: VendorPromotionSubscription | null;
  slotsTotal: number;
  slotsUsed: number;
  promotedProducts: Product[];
  allVendorProducts: Product[];
  analytics: PromotionAnalytics;
}

export const promotionsApi = {
  /**
   * Fetch all available vendor promotion plans
   */
  async getPromotionPlans(): Promise<PromotionPlan[]> {
    const res = await safeFetch<{ success: boolean; plans: PromotionPlan[] }>(
      `${API_BASE}/vendor/promotion-plans`,
      undefined,
      () => ({
        success: true,
        plans: [
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
        ]
      })
    );
    return res?.plans || [];
  },

  /**
   * Fetch a vendor's active promotion plan, quotas, and campaign metrics
   */
  async getVendorPromotionStatus(vendorId: string): Promise<VendorPromotionStatusResponse | null> {
    return safeFetch<VendorPromotionStatusResponse>(
      `${API_BASE}/vendor/${vendorId}/promotion-status`,
      undefined,
      () => {
        const vendor = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors).find((entry) => entry.id === vendorId || entry.userId === vendorId);
        const allProducts = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
        const products = allProducts.filter((product) => product.vendorId === vendor?.id);
        const promotedProducts = products.filter((product) => product.isPromoted);
        const impressions = promotedProducts.reduce((sum, product) => sum + (product.promotionImpressions || 0), 0);
        const clicks = promotedProducts.reduce((sum, product) => sum + (product.promotionClicks || 0), 0);
        const paidOrders = getLocal<any[]>(STORAGE_KEYS.ORDERS, []).filter((order) =>
          order.paymentStatus === 'successful' && order.items?.some((item: any) => item.vendorId === vendor?.id)
        );
        const revenueGenerated = paidOrders.reduce((sum, order) => sum + order.items
          .filter((item: any) => item.vendorId === vendor?.id)
          .reduce((itemSum: number, item: any) => itemSum + Number(item.total || 0), 0), 0);
        const subscription = vendor?.subscription || null;
        return {
          success: true,
          subscription,
          slotsTotal: subscription?.slotsTotal || 0,
          slotsUsed: promotedProducts.length,
          promotedProducts,
          allVendorProducts: products,
          analytics: {
            impressions,
            clicks,
            ctr: impressions ? Math.round((clicks / impressions) * 1000) / 10 : 0,
            attributedSales: paidOrders.length,
            revenueGenerated
          }
        };
      }
    );
  },

  /**
   * Subscribe to or upgrade a promotion tier
   */
  async subscribePromotionPlan(vendorId: string, planId: string, paymentMethod = 'vendor_balance') {
    return safeFetch<{ success: boolean; message: string; subscription: VendorPromotionSubscription }>(
      `${API_BASE}/vendor/subscribe-plan`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, planId, paymentMethod })
      },
      () => {
        const plans: Record<string, { tier: VendorPromotionSubscription['tier']; name: string; price: number; slots: number }> = {
          'plan-starter': { tier: 'starter', name: 'Starter Boost', price: 99, slots: 3 },
          'plan-growth': { tier: 'growth', name: 'Growth Accelerator', price: 249, slots: 10 },
          'plan-enterprise': { tier: 'enterprise', name: 'Enterprise Dominance', price: 599, slots: 999 }
        };
        const plan = plans[planId];
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const index = vendors.findIndex((vendor) => vendor.id === vendorId || vendor.userId === vendorId);
        if (!plan || index < 0) return { success: false, message: 'Demo seller or plan was not found.', subscription: {} as VendorPromotionSubscription };
        const now = new Date();
        const subscription: VendorPromotionSubscription = {
          tier: plan.tier,
          planName: plan.name,
          status: 'active',
          price: plan.price,
          currency: 'GHS',
          startedAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
          slotsTotal: plan.slots,
          slotsUsed: Math.min(plan.slots, getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []).filter((product) => product.vendorId === vendors[index].id && product.isPromoted).length),
          autoRenew: false,
          paymentMethod: `demo_${paymentMethod}`,
          transactionRef: `DEMO-SUB-${Date.now()}`
        };
        vendors[index] = { ...vendors[index], subscription };
        setLocal(STORAGE_KEYS.VENDORS, vendors);
        return { success: true, message: 'Demo subscription activated. No payment was processed.', subscription };
      }
    );
  },

  /**
   * Toggle promotion on a specific product
   */
  async toggleProductPromotion(productId: string, vendorId: string) {
    return safeFetch<{ success: boolean; isPromoted: boolean; product?: Product; message: string }>(
      `${API_BASE}/vendor/products/${productId}/toggle-promotion`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
      },
      () => {
        const vendors = getLocal<Vendor[]>(STORAGE_KEYS.VENDORS, initialVendors);
        const vendor = vendors.find((entry) => entry.id === vendorId || entry.userId === vendorId);
        const products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
        const productIndex = products.findIndex((entry) => entry.id === productId && entry.vendorId === vendor?.id);
        if (productIndex < 0) return { success: false, isPromoted: false, message: 'Demo product was not found.' };
        const product = products[productIndex];
        const subscription = vendor?.subscription;
        if (!subscription || subscription.status !== 'active') {
          return { success: false, isPromoted: Boolean(product.isPromoted), message: 'Activate a demo promotion plan first.' };
        }
        const currentlyPromoted = Boolean(product.isPromoted);
        const activeCount = products.filter((entry) => entry.vendorId === vendor?.id && entry.isPromoted).length;
        if (!currentlyPromoted && activeCount >= subscription.slotsTotal) {
          return { success: false, isPromoted: false, message: 'Demo promotion slot limit reached.' };
        }
        products[productIndex] = {
          ...product,
          isPromoted: !currentlyPromoted,
          promotionTier: !currentlyPromoted ? subscription.tier : undefined,
          promotionImpressions: !currentlyPromoted ? (product.promotionImpressions || 0) + 125 : product.promotionImpressions,
          promotionClicks: !currentlyPromoted ? (product.promotionClicks || 0) + 8 : product.promotionClicks,
          updatedAt: new Date().toISOString()
        };
        setLocal(STORAGE_KEYS.PRODUCTS, products);
        if (vendor) {
          const vendorIndex = vendors.findIndex((entry) => entry.id === vendor.id);
          vendors[vendorIndex] = { ...vendor, subscription: { ...subscription, slotsUsed: activeCount + (currentlyPromoted ? -1 : 1) } };
          setLocal(STORAGE_KEYS.VENDORS, vendors);
        }
        const updatedProduct = products[productIndex];
        return { success: true, isPromoted: Boolean(updatedProduct.isPromoted), product: updatedProduct, message: updatedProduct.isPromoted ? 'Product boosted in demo preview.' : 'Product boost paused in demo preview.' };
      }
    );
  },

  /**
   * Record customer click on a promoted product
   */
  async recordPromotionClick(productId: string) {
    try {
      await fetch(`${API_BASE}/promotions/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
    } catch {
      // Non-blocking telemetry
    }
  }
};
