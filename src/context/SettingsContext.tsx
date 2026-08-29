import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '../types/index';
import { api } from '../services/api';

export type SupportedCurrency = 'GHS' | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'KES';
export type SupportedCountry = 'GH' | 'NG';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateFromGHS: number; // multiplier to convert 1 GHS to this currency
  flag: string;
}

export interface CountryConfig {
  code: SupportedCountry;
  name: string;
  flag: string;
  defaultCurrency: SupportedCurrency;
  currencySymbol: string;
  phoneCode: string;
  supportPhone: string;
  supportEmail: string;
  hubName: string;
  hubLocation: string;
  deliveryPromo: string;
  freeThresholdInGHS: number;
}

export const COUNTRY_MAP: Record<SupportedCountry, CountryConfig> = {
  GH: {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    defaultCurrency: 'GHS',
    currencySymbol: 'GH₵',
    phoneCode: '+233',
    supportPhone: '+233 24 555 0199',
    supportEmail: 'support@novamart.com.gh',
    hubName: 'Airport City Fulfillment Hub',
    hubLocation: 'Independence Ave, Accra',
    deliveryPromo: 'Free Delivery in Accra on orders over GH₵ 500',
    freeThresholdInGHS: 500
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    defaultCurrency: 'NGN',
    currencySymbol: '₦',
    phoneCode: '+234',
    supportPhone: '+234 802 555 0199',
    supportEmail: 'support@novamart.ng',
    hubName: 'Ikeja & Lekki Distribution Depot',
    hubLocation: 'Allen Avenue, Ikeja, Lagos',
    deliveryPromo: 'Free Nationwide Delivery on orders over ₦50,000',
    freeThresholdInGHS: 500
  }
};

export const CURRENCY_MAP: Record<SupportedCurrency, CurrencyConfig> = {
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', rateFromGHS: 1, flag: '🇬🇭' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rateFromGHS: 98.5, flag: '🇳🇬' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromGHS: 0.065, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromGHS: 0.060, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromGHS: 0.051, flag: '🇬🇧' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateFromGHS: 8.4, flag: '🇰🇪' }
};

interface SettingsContextType {
  settings: StoreSettings;
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  currencyConfig: CurrencyConfig;
  country: SupportedCountry;
  setCountry: (country: SupportedCountry) => void;
  countryConfig: CountryConfig;
  formatPrice: (amountInGHS: number) => string;
  convertPrice: (amountInGHS: number) => number;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "NovaMart West Africa",
  tagline: "Your Premier Online Shopping Destination in Ghana & Nigeria",
  logo: "https://images.unsplash.com/photo-1572584642822-6f8de0243c93?w=150&auto=format&fit=crop&q=80",
  storeEmail: "support@novamart.com.gh",
  storePhone: "+233 24 555 0199",
  businessAddress: "Independence Avenue, Airport City, Accra & Ikeja, Lagos",
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

  const [country, setCountryState] = useState<SupportedCountry>(() => {
    // 1. Check URL parameters first (e.g. ?country=NG or ?market=nigeria)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramCountry = urlParams.get('country')?.toUpperCase() || urlParams.get('market')?.toUpperCase();
      if (paramCountry === 'NG' || paramCountry === 'NIGERIA') return 'NG';
      if (paramCountry === 'GH' || paramCountry === 'GHANA') return 'GH';
    } catch {}

    // 2. Check explicitly stored user preference
    try {
      const stored = localStorage.getItem('novamart_country');
      if (stored === 'GH' || stored === 'NG') return stored as SupportedCountry;
    } catch {}

    // 3. Check browser timezone (Lagos / West Africa vs Accra)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
      if (tz.includes('lagos') || tz.includes('nigeria') || tz.includes('porto-novo')) {
        return 'NG';
      }
    } catch {}

    return 'GH';
  });

  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramCountry = urlParams.get('country')?.toUpperCase() || urlParams.get('market')?.toUpperCase();
      if (paramCountry === 'NG' || paramCountry === 'NIGERIA') return 'NGN';
      if (paramCountry === 'GH' || paramCountry === 'GHANA') return 'GHS';
    } catch {}

    try {
      const stored = localStorage.getItem('novamart_currency');
      if (stored && stored in CURRENCY_MAP) return stored as SupportedCurrency;
    } catch {}
    return country === 'NG' ? 'NGN' : 'GHS';
  });

  const [isLoading, setIsLoading] = useState(true);

  // Auto Geo-IP detection on initial visit if not manually chosen
  useEffect(() => {
    const detectGeoCountry = async () => {
      try {
        const stored = localStorage.getItem('novamart_country');
        if (stored) return; // User already made an explicit choice

        // Free IP country lookup
        const res = await fetch('https://api.country.is/').catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.country === 'NG') {
            setCountry('NG');
          } else if (data && data.country === 'GH') {
            setCountry('GH');
          }
        }
      } catch {}
    };
    detectGeoCountry();
  }, []);

  const setCountry = (newCountry: SupportedCountry) => {
    setCountryState(newCountry);
    try {
      localStorage.setItem('novamart_country', newCountry);
    } catch {}
    // Automatically match the default currency of the market
    const defaultCurr = COUNTRY_MAP[newCountry].defaultCurrency;
    setCurrency(defaultCurr);
  };

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('novamart_currency', c);
    } catch {}
  };

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


  const currencyConfig = CURRENCY_MAP[currency] || CURRENCY_MAP.GHS;
  const countryConfig = COUNTRY_MAP[country] || COUNTRY_MAP.GH;

  const convertPrice = (amountInGHS: number): number => {
    const num = Number(amountInGHS) || 0;
    if (currency === 'GHS') return num;
    const rate = currencyConfig.rateFromGHS;
    return num * rate;
  };

  const formatPrice = (amountInGHS: number): string => {
    const num = Number(amountInGHS) || 0;
    const converted = convertPrice(num);
    const symbol = currencyConfig.symbol;

    if (currency === 'GHS') {
      return `GH₵ ${num.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'NGN') {
      return `₦${converted.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (currency === 'USD') {
      return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'EUR') {
      return `€${converted.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'GBP') {
      return `£${converted.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'KES') {
      return `KSh ${converted.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    return `${symbol} ${converted.toFixed(2)}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        currency,
        setCurrency,
        currencyConfig,
        country,
        setCountry,
        countryConfig,
        formatPrice,
        convertPrice,
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
