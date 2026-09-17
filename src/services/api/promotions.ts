import { PromotionPlan, VendorPromotionSubscription, Product, PromotionAnalytics } from '../../types/index';
import { API_BASE, safeFetch } from './storage';

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
      () => ({
        success: true,
        subscription: {
          tier: 'growth',
          planName: 'Growth Accelerator',
          status: 'active',
          price: 249,
          currency: 'GHS',
          startedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
          slotsTotal: 10,
          slotsUsed: 3,
          autoRenew: true,
          paymentMethod: 'mtn_momo',
          transactionRef: 'SUB-MOMO-DEMO'
        },
        slotsTotal: 10,
        slotsUsed: 3,
        promotedProducts: [],
        allVendorProducts: [],
        analytics: {
          impressions: 4850,
          clicks: 342,
          ctr: 7.1,
          attributedSales: 41,
          revenueGenerated: 18450
        }
      })
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
      () => ({
        success: true,
        message: 'Plan activated successfully',
        subscription: {
          tier: planId.includes('enterprise') ? 'enterprise' : planId.includes('growth') ? 'growth' : 'starter',
          planName: planId.includes('enterprise') ? 'Enterprise Dominance' : planId.includes('growth') ? 'Growth Accelerator' : 'Starter Boost',
          status: 'active',
          price: 249,
          currency: 'GHS',
          startedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          slotsTotal: planId.includes('enterprise') ? 999 : planId.includes('growth') ? 10 : 3,
          slotsUsed: 0,
          autoRenew: true,
          paymentMethod,
          transactionRef: `SUB-${Date.now()}`
        }
      })
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
      () => ({
        success: true,
        isPromoted: true,
        message: 'Product promotion updated'
      })
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
