import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider, useToast } from './context/ToastContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { ReviewModal } from './components/common/ReviewModal';
import { DemoSwitcher } from './components/common/DemoSwitcher';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { ProductCompareModal } from './components/common/ProductCompareModal';
import { NovaAICopilot } from './components/common/NovaAICopilot';
import { MobileBottomNav } from './components/common/MobileBottomNav';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { CustomerDashboardView } from './views/CustomerDashboardView';
import { AuthViews } from './views/AuthViews';
import { StaticPages } from './views/StaticPages';

// Admin Views
import { AdminLayout } from './views/admin/AdminLayout';
import { AdminOverviewView } from './views/admin/AdminOverviewView';
import { AdminVendorsView } from './views/admin/AdminVendorsView';
import { AdminProductsView } from './views/admin/AdminProductsView';
import { AdminOrdersView } from './views/admin/AdminOrdersView';
import { AdminCategoriesView } from './views/admin/AdminCategoriesView';
import { AdminCouponsView } from './views/admin/AdminCouponsView';
import { AdminCustomersView } from './views/admin/AdminCustomersView';
import { AdminReviewsView } from './views/admin/AdminReviewsView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';
// Vendor / Seller Views
import { VendorLayout } from './views/vendor/VendorLayout';
import { VendorOverviewView } from './views/vendor/VendorOverviewView';
import { VendorProductsView } from './views/vendor/VendorProductsView';
import { VendorOrdersView } from './views/vendor/VendorOrdersView';
import { VendorPayoutsView } from './views/vendor/VendorPayoutsView';
import { VendorProfileView } from './views/vendor/VendorProfileView';
import { VendorReviewsView } from './views/vendor/VendorReviewsView';
import { BecomeSellerView } from './views/BecomeSellerView';
import { VendorStoreView } from './views/VendorStoreView';

import { ScentQuizModal } from './components/common/ScentQuizModal';
import { DiscoveryBoxView } from './views/DiscoveryBoxView';
import { api } from './services/api';

import { Product, Order } from './types/index';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Admin Tab State
  const [adminTab, setAdminTab] = useState<string>('overview');

  // Vendor Tab State
  const [vendorTab, setVendorTab] = useState<string>('overview');
  const [isVendorAddOpen, setIsVendorAddOpen] = useState(false);

  // Modals & Quizzes
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScentQuizOpen, setIsScentQuizOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Global Ctrl+K / Cmd+K listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load products for global scent quiz
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.getProducts({ limit: 30 });
        if (res && res.products) {
          setAllProducts(res.products);
        }
      } catch (e) {
        console.error('Failed to load products for quiz:', e);
      }
    };
    loadProducts();
  }, []);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParams]);

  const handleNavigate = (view: string, param?: any) => {
    if (view === 'scent-quiz') {
      setIsScentQuizOpen(true);
      return;
    }
    setCurrentView(view);
    setViewParams(param || {});
  };

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleOpenReview = (product: Product) => {
    setReviewProduct(product);
  };

  // Render Admin Dashboard
  if (currentView === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => setAdminTab(tab)}
        onNavigateToStore={() => handleNavigate('home')}
      >
        {adminTab === 'overview' && <AdminOverviewView onNavigateTab={(tab) => setAdminTab(tab)} />}
        {adminTab === 'vendors' && <AdminVendorsView />}
        {adminTab === 'products' && <AdminProductsView />}
        {adminTab === 'orders' && <AdminOrdersView />}
        {adminTab === 'categories' && <AdminCategoriesView />}
        {adminTab === 'coupons' && <AdminCouponsView />}
        {adminTab === 'customers' && <AdminCustomersView />}
        {adminTab === 'reviews' && <AdminReviewsView />}
        {adminTab === 'settings' && <AdminSettingsView />}
      </AdminLayout>
    );
  }

  // Render Vendor / Seller Dashboard Portal
  if (currentView === 'vendor') {
    return (
      <VendorLayout
        currentTab={vendorTab}
        onTabChange={(tab) => {
          setVendorTab(tab);
          setIsVendorAddOpen(false);
        }}
        onNavigateToStore={() => handleNavigate('home')}
        onOpenAddProduct={() => {
          setVendorTab('products');
          setIsVendorAddOpen(true);
        }}
      >
        {vendorTab === 'overview' && (
          <VendorOverviewView
            onNavigateTab={(tab) => setVendorTab(tab)}
            onOpenAddProduct={() => {
              setVendorTab('products');
              setIsVendorAddOpen(true);
            }}
          />
        )}
        {vendorTab === 'products' && (
          <VendorProductsView initialOpenAdd={isVendorAddOpen} />
        )}
        {vendorTab === 'orders' && <VendorOrdersView />}
        {vendorTab === 'payouts' && <VendorPayoutsView />}
        {vendorTab === 'profile' && <VendorProfileView />}
        {vendorTab === 'reviews' && <VendorReviewsView />}
      </VendorLayout>
    );
  }

  // Render Customer Storefront
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200 pb-16 md:pb-0">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenQuickView={handleOpenQuickView}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            initialCategory={viewParams.category}
            initialSearch={viewParams.search}
            initialDealsOnly={viewParams.dealsOnly || viewParams.isFlashDeal}
            initialFlashDealOnly={viewParams.dealsOnly || viewParams.isFlashDeal}
            onNavigate={handleNavigate}
            onOpenQuickView={handleOpenQuickView}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailView
            productId={viewParams.productId || 'prod-portable-blender'}
            onNavigate={handleNavigate}
            onOpenQuickView={handleOpenQuickView}
          />
        )}

        {currentView === 'cart' && (
          <CartView onNavigate={handleNavigate} />
        )}

        {currentView === 'checkout' && (
          <CheckoutView onNavigate={handleNavigate} />
        )}

        {currentView === 'order-confirmation' && (
          <OrderConfirmationView
            order={viewParams.order}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'track-order' && (
          <OrderTrackingView
            initialOrderNumber={viewParams.orderNumber}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'account' && (
          <CustomerDashboardView
            initialTab={viewParams.tab || 'overview'}
            onNavigate={handleNavigate}
            onOpenQuickView={handleOpenQuickView}
          />
        )}

        {(currentView === 'login' || currentView === 'register' || currentView === 'forgot-password') && (
          <AuthViews
            mode={currentView as any}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'discovery-box' && (
          <DiscoveryBoxView onNavigate={handleNavigate} />
        )}

        {currentView === 'become-seller' && (
          <BecomeSellerView onNavigate={handleNavigate} />
        )}

        {currentView === 'vendor-store' && (
          <VendorStoreView
            vendorId={viewParams.vendorId || 'vend-kofi'}
            onNavigate={handleNavigate}
            onOpenQuickView={handleOpenQuickView}
          />
        )}

        {['about', 'contact', 'faq', 'terms', 'privacy', 'returns'].includes(currentView) && (
          <StaticPages
            page={currentView as any}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Overlays & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={handleNavigate}
      />

      <QuickViewModal
        isOpen={Boolean(quickViewProduct)}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigateToDetail={(productId) => handleNavigate('product-detail', { productId })}
      />

      <ReviewModal
        isOpen={Boolean(reviewProduct)}
        product={reviewProduct}
        onClose={() => setReviewProduct(null)}
      />

      <ScentQuizModal
        isOpen={isScentQuizOpen}
        onClose={() => setIsScentQuizOpen(false)}
        products={allProducts}
        onNavigateToProduct={(productId) => {
          setIsScentQuizOpen(false);
          handleNavigate('product-detail', { productId });
        }}
        onNavigateToDiscovery={() => {
          setIsScentQuizOpen(false);
          handleNavigate('discovery-box');
        }}
      />

      {/* Global Command Palette (Ctrl+K & Voice Search) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Product Comparison Floating Dock & Matrix Modal */}
      <ProductCompareModal
        onNavigateToProduct={(productId) => handleNavigate('product-detail', { productId })}
      />

      {/* NovaAI Intelligent Shopping Copilot & Stylist */}
      <NovaAICopilot
        onNavigate={handleNavigate}
        onOpenQuickView={handleOpenQuickView}
      />

      {/* Sticky Mobile App Bottom Navigation Dock */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
    </div>
  );
};

import { ThemeProvider } from './context/ThemeContext';
import { FontSizeProvider } from './context/FontSizeContext';

export default function App() {
  return (
    <FontSizeProvider>
      <ThemeProvider>
        <ToastProvider>
          <SettingsProvider>
            <AuthProvider>
              <RecentlyViewedProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <CartProvider>
                      <MainApp />
                    </CartProvider>
                  </CompareProvider>
                </WishlistProvider>
              </RecentlyViewedProvider>
            </AuthProvider>
          </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </FontSizeProvider>
  );
}
