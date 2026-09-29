import { StoreSettings } from '../../types/index';
import { API_BASE, STORAGE_KEYS, getLocal, setLocal, safeFetch } from './storage';

export const settingsApi = {
  async getSettings() {
    return safeFetch<StoreSettings>(
      `${API_BASE}/settings`,
      undefined,
      () => ({
        storeName: 'NovaMart Ghana',
        tagline: "Ghana's Premier Online Superstore & Marketplace",
        logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&auto=format&fit=crop&q=80',
        storeEmail: 'support@novamart.com.gh',
        storePhone: '+233 24 555 0199',
        businessAddress: 'Independence Avenue, Airport City, Accra, Ghana',
        currency: 'GHS',
        currencySymbol: 'GH₵',
        exchangeRateToUSD: 0.065,
        standardDeliveryFee: 35,
        expressDeliveryFee: 70,
        freeDeliveryThreshold: 500,
        taxRate: 0.035,
        enableCOD: true,
        enableMoMo: false,
        enableCard: false,
        enablePaystack: false,
        socialLinks: {
          facebook: 'https://facebook.com/novamartgh',
          instagram: 'https://instagram.com/novamartgh',
          twitter: 'https://twitter.com/novamartgh',
          whatsapp: '+233245550199'
        }
      })
    );
  },

  async updateSettings(data: Partial<StoreSettings>) {
    return safeFetch<StoreSettings>(
      `${API_BASE}/settings`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const settings: StoreSettings = getLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, {
          storeName: 'NovaMart Ghana',
          tagline: "Ghana's Premier Online Superstore & Marketplace",
          logo: '',
          storeEmail: 'support@novamart.com.gh',
          storePhone: '+233 24 555 0199',
          businessAddress: 'Accra, Ghana',
          currency: 'GHS',
          currencySymbol: 'GH₵',
          exchangeRateToUSD: 0.065,
          standardDeliveryFee: 35,
          expressDeliveryFee: 70,
          freeDeliveryThreshold: 500,
          taxRate: 0.035,
          enableCOD: true,
          enableMoMo: false,
          enableCard: false,
          enablePaystack: false,
          socialLinks: {
            facebook: 'https://facebook.com/novamartgh',
            instagram: 'https://instagram.com/novamartgh',
            twitter: 'https://twitter.com/novamartgh',
            whatsapp: '+233245550199'
          }
        });
        const updated: StoreSettings = { ...settings, ...data };
        setLocal(STORAGE_KEYS.SETTINGS, updated);
        return updated;
      }
    );
  },

  // Payment provider integration is intentionally deferred.
  async initializePaystack(data: {
    email: string;
    amount: number;
    orderId?: string;
    paymentMethod: string;
    phone?: string;
    channel?: string;
  }) {
    void data;
    throw new Error('Online payments are not available until a payment provider is integrated.');
  },

  async verifyPaystack(reference: string, orderId?: string) {
    void reference;
    void orderId;
    throw new Error('Payment verification is unavailable until a payment provider is integrated.');
  },

  // SMS & Customer Communications
  async sendOrderSMS(data: { phone: string; message: string; orderNumber?: string; type?: string }) {
    return safeFetch<any>(
      `${API_BASE}/notifications/send-sms`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );
  }
};
