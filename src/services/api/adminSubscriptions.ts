import { PromotionPlan, VendorPromotionSubscription } from '../../types/index';
import { API_BASE, safeFetch } from './storage';

export interface AdminSubscriptionVendorItem {
  vendorId: string;
  storeName: string;
  email: string;
  phone: string;
  balance: number;
  renewalFee: number;
  hasSufficientFunds: boolean;
  subscription: VendorPromotionSubscription;
  promotedProductCount: number;
}

export interface AdminSubscriptionOverviewResponse {
  success: boolean;
  mrrGH: number;
  mrrNG: number;
  activeCount: number;
  expiredCount: number;
  totalPlatformImpressions: number;
  totalPlatformClicks: number;
  plans: PromotionPlan[];
  subscribedVendors: AdminSubscriptionVendorItem[];
}

export interface LifecycleRunResult {
  processedCount: number;
  renewedCount: number;
  cancelledCount: number;
  actions: Array<{
    vendorId: string;
    vendorName: string;
    tier: string;
    action: 'renewed' | 'cancelled_insufficient_funds';
    amountDeducted?: number;
    balanceRemaining?: number;
    message: string;
  }>;
}

export const adminSubscriptionsApi = {
  /**
   * Fetch admin overview of all vendor subscriptions, revenue, and quotas
   */
  async getAdminSubscriptionOverview(): Promise<AdminSubscriptionOverviewResponse | null> {
    return safeFetch<AdminSubscriptionOverviewResponse>(
      `${API_BASE}/admin/subscriptions/overview`,
      undefined,
      () => ({
        success: true,
        mrrGH: 249,
        mrrNG: 24000,
        activeCount: 1,
        expiredCount: 0,
        totalPlatformImpressions: 4850,
        totalPlatformClicks: 342,
        plans: [],
        subscribedVendors: []
      })
    );
  },

  /**
   * Trigger the automated auto-deduct / auto-cancel lifecycle runner
   */
  async processSubscriptionRenewals() {
    return safeFetch<{ success: boolean; message: string; result: LifecycleRunResult }>(
      `${API_BASE}/admin/subscriptions/process-renewals`,
      { method: 'POST' }
    );
  },

  /**
   * Fast-forward expiry date to test auto-deduct or auto-cancellation
   */
  async simulateSubscriptionExpiry(vendorId: string, simulateShortBalance = false) {
    return safeFetch<{ success: boolean; message: string; result: LifecycleRunResult }>(
      `${API_BASE}/admin/subscriptions/simulate-expiry`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, simulateShortBalance })
      }
    );
  },

  /**
   * Admin manual moderation action (pause, resume, grant free days)
   */
  async moderateVendorSubscription(vendorId: string, action: 'pause' | 'resume' | 'grant_days', daysToAdd?: number) {
    return safeFetch<{ success: boolean; message: string }>(
      `${API_BASE}/admin/subscriptions/moderate-vendor`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, action, daysToAdd })
      }
    );
  },

  /**
   * Admin updates plan pricing or quotas
   */
  async updatePromotionPlan(planId: string, updates: Partial<PromotionPlan>) {
    return safeFetch<{ success: boolean; message: string; plan: PromotionPlan }>(
      `${API_BASE}/admin/promotion-plans/${planId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );
  }
};
