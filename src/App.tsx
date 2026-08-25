import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider, useToast } from './context/ToastContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { ReviewModal } from './components/common/ReviewModal';
import { DemoSwitcher } from './components/common/DemoSwitcher';

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
import { AdminProductsView } from './views/admin/AdminProductsView';
import { AdminOrdersView } from './views/admin/AdminOrdersView';
import { AdminCategoriesView } from './views/admin/AdminCategoriesView';
import { AdminCouponsView } from './views/admin/AdminCouponsView';
import { AdminCustomersView } from './views/admin/AdminCustomersView';
import { AdminReviewsView } from './views/admin/AdminReviewsView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';

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

  // Modals & Quizzes
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScentQuizOpen, setIsScentQuizOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

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

  // Render Customer Storefront
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
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
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <MainApp />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  );
}
