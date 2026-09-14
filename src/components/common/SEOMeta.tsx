/**
 * NovaMart SEO Meta Manager
 * Dynamically updates <head> meta tags for each view/page.
 * Uses useEffect to write directly to document.head — no external dependencies.
 */

import { useEffect } from 'react';

interface SEOMetaProps {
  title?: string;
  description?: string;
  /** Absolute URL to a product/promo image (1200×630px ideal) */
  image?: string;
  /** Canonical URL for this page */
  url?: string;
  /** 'website' for pages, 'product' for product detail */
  type?: 'website' | 'product';
  /** Structured data (JSON-LD) object — pass null to skip */
  jsonLd?: object | null;
}

const SITE_NAME = 'NovaMart Ghana';
const DEFAULT_TITLE = "NovaMart | Ghana's Premier Online Superstore & Marketplace";
const DEFAULT_DESC =
  'Shop electronics, phones, fashion, beauty, home appliances & groceries online at NovaMart Ghana. Fast nationwide delivery & secure MTN MoMo / Telecel / card checkout.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://novamart.com.gh';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setJsonLd(data: object) {
  const id = 'novamart-json-ld';
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function SEOMeta({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  jsonLd = null,
}: SEOMetaProps) {
  useEffect(() => {
    const fullTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;
    const pageUrl = url || SITE_URL;

    // ── Document title
    document.title = fullTitle;

    // ── Standard
    setMeta('description', description);
    setMeta('robots', 'index, follow');
    setMeta('theme-color', '#059669');

    // ── Open Graph
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', pageUrl, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('og:locale', 'en_GH', 'property');

    // ── Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    setMeta('twitter:site', '@novamartgh');

    // ── Canonical link
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = pageUrl;

    // ── JSON-LD Structured Data
    if (jsonLd) {
      setJsonLd(jsonLd);
    }
  }, [title, description, image, url, type, jsonLd]);

  // Renders nothing — only side-effects
  return null;
}

// ── Preset factories for common page types ────────────────────────────────────

export function homeSEO() {
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  };
}

export function shopSEO(category?: string) {
  const catLabel = category && category !== 'all' ? ` — ${category}` : '';
  return {
    title: `Shop${catLabel} | NovaMart Ghana`,
    description: `Browse genuine products${catLabel} at NovaMart Ghana. Secure payment, fast Accra & nationwide delivery.`,
  };
}

export function productSEO(product: {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  brand: string;
  sku: string;
  stockQuantity: number;
}) {
  const price = product.discountPrice || product.price;
  return {
    title: `${product.name} — ${product.brand}`,
    description: `${product.description.slice(0, 155)}...`,
    image: product.images?.[0],
    type: 'product' as const,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      brand: { '@type': 'Brand', name: product.brand },
      sku: product.sku,
      image: product.images,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'GHS',
        price: price.toFixed(2),
        availability: product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: SITE_NAME },
      },
    },
  };
}

export function cartSEO() {
  return {
    title: 'Shopping Bag | NovaMart Ghana',
    description: 'Review your selected items and proceed to secure checkout with MTN MoMo, Telecel Cash or card.',
  };
}

export function checkoutSEO() {
  return {
    title: 'Secure Checkout | NovaMart Ghana',
    description: 'Complete your purchase securely with MTN MoMo, Telecel Cash, or debit/credit card.',
  };
}

export function authSEO(mode: string) {
  if (mode === 'register') {
    return {
      title: 'Create Account | NovaMart Ghana',
      description: 'Join NovaMart Ghana to track orders, save your wishlist and get exclusive member discounts.',
    };
  }
  return {
    title: 'Sign In | NovaMart Ghana',
    description: 'Sign in to your NovaMart account to access your orders, wishlist and exclusive deals.',
  };
}

export function wishlistSEO() {
  return {
    title: 'My Wishlist | NovaMart Ghana',
    description: 'View and manage your saved items on NovaMart Ghana.',
  };
}

export function accountSEO() {
  return {
    title: 'My Account | NovaMart Ghana',
    description: 'Manage your NovaMart orders, delivery addresses, and account settings.',
  };
}

export function adminSEO(tab: string) {
  const labels: Record<string, string> = {
    overview: 'Dashboard & Analytics',
    orders: 'Orders & Dispatch',
    products: 'Products & Catalog',
    vendors: 'Vendors & Merchants',
    customers: 'Customer Base',
    settings: 'Store Settings',
  };
  return {
    title: `${labels[tab] || 'Admin'} | NovaMart HQ`,
    description: 'NovaMart Ghana Admin Portal — Manage products, orders, vendors and store settings.',
  };
}

export function vendorSEO(tab: string, storeName?: string) {
  const labels: Record<string, string> = {
    overview: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    payouts: 'Payouts',
    profile: 'Store Profile',
  };
  const store = storeName ? ` — ${storeName}` : '';
  return {
    title: `${labels[tab] || 'Seller'} Portal${store} | NovaMart`,
    description: 'Manage your NovaMart seller store, products, orders and payouts.',
  };
}
