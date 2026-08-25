import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types/index';
import { api } from '../services/api';

interface SettingsContextType {
  settings: StoreSettings;
  currency: 'GHS' | 'USD';
  setCurrency: (c: 'GHS' | 'USD') => void;
  formatPrice: (amountInGHS: number) => string;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "NovaMart Ghana",
  tagline: "Your Premier Online Shopping Destination in Ghana & West Africa",
  logo: "https://images.unsplash.com/photo-1572584642822-6f8de0243c93?w=150&auto=format&fit=crop&q=80",
  storeEmail: "support@novamart.com.gh",
  storePhone: "+233 24 555 0199",
  businessAddress: "Independence Avenue, Airport City, Accra, Ghana",
  currency: "GHS",
  currencySymbol: "GH₵",
  exchangeRateToUSD: 0.065,
  standardDeliveryFee: 35,
  expressDeliveryFee: 70,
  freeDeliveryThreshold: 500,
  taxRate: 0.035,
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

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS');
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data) setSettings(data);
    } catch (e) {
      console.warn("Using fallback settings", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const formatPrice = (amountInGHS: number): string => {
    const num = Number(amountInGHS) || 0;
    if (currency === 'USD') {
      const usdRate = settings.exchangeRateToUSD || 0.065;
      const val = num * usdRate;
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `GH₵ ${num.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        currency,
        setCurrency,
        formatPrice,
        refreshSettings,
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
