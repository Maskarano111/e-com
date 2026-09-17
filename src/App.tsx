import React from 'react';
import { AppProviders } from './components/AppProviders';
import { useAppNavigation } from './hooks/useAppNavigation';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import {
  SEOMeta,
  homeSEO,
  shopSEO,
  cartSEO,
  checkoutSEO,
  authSEO,
  wishlistSEO,
  accountSEO,
  adminSEO,
  vendorSEO,
} from './components/common/SEOMeta';
import { useAuth } from './context/AuthContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { ReviewModal } from './components/common/ReviewModal';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { ProductCompareModal } from './components/common/ProductCompareModal';
import { NovaAICopilot } from './components/common/NovaAICopilot';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ScentQuizModal } from './components/common/ScentQuizModal';
import { WhatsAppButton } from './components/common/WhatsAppButton';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { WishlistView } from './views/WishlistView';
import { AuthViews } from './views/AuthViews';

// Lazy-Loaded Views for Performance and Route Code-Splitting
import { PageSkeleton } from './components/common/Skeletons';

const OrderTrackingView = React.lazy(() => import('./views/OrderTrackingView').then(m => ({ default: m.OrderTrackingView })));
const CustomerDashboardView = React.lazy(() => import('./views/CustomerDashboardView').then(m => ({ default: m.CustomerDashboardView })));
const StaticPages = React.lazy(() => import('./views/StaticPages').then(m => ({ default: m.StaticPages })));
const BecomeSellerView = React.lazy(() => import('./views/BecomeSellerView').then(m => ({ default: m.BecomeSellerView })));
const VendorStoreView = React.lazy(() => import('./views/VendorStoreView').then(m => ({ default: m.VendorStoreView })));
const DiscoveryBoxView = React.lazy(() => import('./views/DiscoveryBoxView').then(m => ({ default: m.DiscoveryBoxView })));

// Admin Views (Code-Split)
const AdminLayout = React.lazy(() => import('./views/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverviewView = React.lazy(() => import('./views/admin/AdminOverviewView').then(m => ({ default: m.AdminOverviewView })));
const AdminVendorsView = React.lazy(() => import('./views/admin/AdminVendorsView').then(m => ({ default: m.AdminVendorsView })));
const AdminProductsView = React.lazy(() => import('./views/admin/AdminProductsView').then(m => ({ default: m.AdminProductsView })));
const AdminInventoryView = React.lazy(() => import('./views/admin/AdminInventoryView').then(m => ({ default: m.AdminInventoryView })));
const AdminOrdersView = React.lazy(() => import('./views/admin/AdminOrdersView').then(m => ({ default: m.AdminOrdersView })));
const AdminReturnRequestsView = React.lazy(() => import('./views/admin/AdminReturnRequestsView').then(m => ({ default: m.AdminReturnRequestsView })));
const AdminPaymentsView = React.lazy(() => import('./views/admin/AdminPaymentsView').then(m => ({ default: m.AdminPaymentsView })));
const AdminCategoriesView = React.lazy(() => import('./views/admin/AdminCategoriesView').then(m => ({ default: m.AdminCategoriesView })));
const AdminCouponsView = React.lazy(() => import('./views/admin/AdminCouponsView').then(m => ({ default: m.AdminCouponsView })));
const AdminBannersView = React.lazy(() => import('./views/admin/AdminBannersView').then(m => ({ default: m.AdminBannersView })));
const AdminCustomersView = React.lazy(() => import('./views/admin/AdminCustomersView').then(m => ({ default: m.AdminCustomersView })));
const AdminReviewsView = React.lazy(() => import('./views/admin/AdminReviewsView').then(m => ({ default: m.AdminReviewsView })));
const AdminSettingsView = React.lazy(() => import('./views/admin/AdminSettingsView').then(m => ({ default: m.AdminSettingsView })));
const AdminPromotionsView = React.lazy(() => import('./views/admin/AdminPromotionsView').then(m => ({ default: m.AdminPromotionsView })));

// Vendor / Seller Views (Code-Split)
const VendorLayout = React.lazy(() => import('./views/vendor/VendorLayout').then(m => ({ default: m.VendorLayout })));
const VendorOverviewView = React.lazy(() => import('./views/vendor/VendorOverviewView').then(m => ({ default: m.VendorOverviewView })));
const VendorProductsView = React.lazy(() => import('./views/vendor/VendorProductsView').then(m => ({ default: m.VendorProductsView })));
const VendorOrdersView = React.lazy(() => import('./views/vendor/VendorOrdersView').then(m => ({ default: m.VendorOrdersView })));
const VendorPayoutsView = React.lazy(() => import('./views/vendor/VendorPayoutsView').then(m => ({ default: m.VendorPayoutsView })));
const VendorProfileView = React.lazy(() => import('./views/vendor/VendorProfileView').then(m => ({ default: m.VendorProfileView })));
const VendorReviewsView = React.lazy(() => import('./views/vendor/VendorReviewsView').then(m => ({ default: m.VendorReviewsView })));
const VendorPromotionsView = React.lazy(() => import('./views/vendor/VendorPromotionsView').then(m => ({ default: m.VendorPromotionsView })));

// -----------------------------------------------------------------------------
// MainApp -- renders the active view and wires up global overlays.
// All navigation and modal state lives in useAppNavigation.
// -----------------------------------------------------------------------------
const MainApp: React.FC = () => {
  const { user } = useAuth();

  const {
    currentView,
    viewParams,
    handleNavigate,
    adminTab,
    setAdminTab,
    vendorTab,
    setVendorTab,
    isVendorAddOpen,
    setIsVendorAddOpen,
    isCartOpen,
    setIsCartOpen,
    isScentQuizOpen,
    setIsScentQuizOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    quickViewProduct,
    setQuickViewProduct,
    reviewProduct,
    setReviewProduct,
    handleOpenQuickView,
    handleOpenReview,
    allProducts,
  } = useAppNavigation();

  // Derived flags to avoid repeating compound conditions in JSX
  const isAuthView = currentView === 'login' || currentView === 'register' || currentView === 'forgot-password';
  const isStaticPage = ['about', 'contact', 'faq', 'terms', 'privacy', 'returns'].includes(currentView);

  // Admin Dashboard Portal
  if (currentView === 'admin') {
    return (
      <ErrorBoundary name="Admin Dashboard">
        <SEOMeta {...adminSEO(adminTab)} />
        <React.Suspense fallback={<PageSkeleton title="NovaMart Administration Portal" />}>
          <AdminLayout
            currentTab={adminTab}
            onTabChange={(tab) => setAdminTab(tab)}
            onNavigateToStore={() => handleNavigate('home')}
          >
            {adminTab === 'overview'   && <ErrorBoundary name="Admin Overview" inline><AdminOverviewView onNavigateTab={(tab) => setAdminTab(tab)} /></ErrorBoundary>}
            {adminTab === 'promotions' && <ErrorBoundary name="Admin Promotions" inline><AdminPromotionsView /></ErrorBoundary>}
            {adminTab === 'vendors'    && <ErrorBoundary name="Vendors" inline><AdminVendorsView /></ErrorBoundary>}
            {adminTab === 'products'   && <ErrorBoundary name="Products" inline><AdminProductsView /></ErrorBoundary>}
            {adminTab === 'inventory'  && <ErrorBoundary name="Inventory" inline><AdminInventoryView /></ErrorBoundary>}
            {adminTab === 'orders'     && <ErrorBoundary name="Orders" inline><AdminOrdersView /></ErrorBoundary>}
            {adminTab === 'returns'    && <ErrorBoundary name="Returns" inline><AdminReturnRequestsView /></ErrorBoundary>}
            {adminTab === 'payments'   && <ErrorBoundary name="Payments" inline><AdminPaymentsView /></ErrorBoundary>}
            {adminTab === 'categories' && <ErrorBoundary name="Categories" inline><AdminCategoriesView /></ErrorBoundary>}
            {adminTab === 'coupons'    && <ErrorBoundary name="Coupons" inline><AdminCouponsView /></ErrorBoundary>}
            {adminTab === 'banners'    && <ErrorBoundary name="Banners" inline><AdminBannersView /></ErrorBoundary>}
            {adminTab === 'customers'  && <ErrorBoundary name="Customers" inline><AdminCustomersView /></ErrorBoundary>}
            {adminTab === 'reviews'    && <ErrorBoundary name="Reviews" inline><AdminReviewsView /></ErrorBoundary>}
            {adminTab === 'settings'   && <ErrorBoundary name="Settings" inline><AdminSettingsView /></ErrorBoundary>}
          </AdminLayout>
        </React.Suspense>
      </ErrorBoundary>
    );
  }

  // Vendor / Seller Dashboard Portal
  if (currentView === 'vendor') {
    return (
      <ErrorBoundary name="Vendor Dashboard">
        <SEOMeta {...vendorSEO(vendorTab)} />
        <React.Suspense fallback={<PageSkeleton title="NovaMart Seller Portal" />}>
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
              <ErrorBoundary name="Vendor Overview" inline>
                <VendorOverviewView
                  onNavigateTab={(tab) => setVendorTab(tab)}
                  onOpenAddProduct={() => {
                    setVendorTab('products');
                    setIsVendorAddOpen(true);
                  }}
                />
              </ErrorBoundary>
            )}
            {vendorTab === 'promotions' && <ErrorBoundary name="Vendor Promotions" inline><VendorPromotionsView /></ErrorBoundary>}
            {vendorTab === 'products' && <ErrorBoundary name="Vendor Products" inline><VendorProductsView initialOpenAdd={isVendorAddOpen} /></ErrorBoundary>}
            {vendorTab === 'orders'   && <ErrorBoundary name="Vendor Orders" inline><VendorOrdersView /></ErrorBoundary>}
            {vendorTab === 'payouts'  && <ErrorBoundary name="Vendor Payouts" inline><VendorPayoutsView /></ErrorBoundary>}
            {vendorTab === 'profile'  && <ErrorBoundary name="Vendor Profile" inline><VendorProfileView /></ErrorBoundary>}
            {vendorTab === 'reviews'  && <ErrorBoundary name="Vendor Reviews" inline><VendorReviewsView /></ErrorBoundary>}
          </VendorLayout>
        </React.Suspense>
      </ErrorBoundary>
    );
  }

  // Customer Storefront
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200 pb-16 md:pb-0">
      {/* Dynamic SEO -- updates <head> on every view change */}
      {currentView === 'home'     && <SEOMeta {...homeSEO()} />}
      {currentView === 'shop'     && <SEOMeta {...shopSEO(viewParams.category)} />}
      {currentView === 'cart'     && <SEOMeta {...cartSEO()} />}
      {currentView === 'checkout' && <SEOMeta {...checkoutSEO()} />}
      {currentView === 'wishlist' && <SEOMeta {...wishlistSEO()} />}
      {currentView === 'account'  && <SEOMeta {...accountSEO()} />}
      {isAuthView                 && <SEOMeta {...authSEO(currentView)} />}

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
          <ErrorBoundary name="Home">
            <HomeView onNavigate={handleNavigate} onOpenQuickView={handleOpenQuickView} />
          </ErrorBoundary>
        )}

        {currentView === 'shop' && (
          <ErrorBoundary name="Shop">
            <ShopView
              initialCategory={viewParams.category}
              initialSearch={viewParams.search}
              initialDealsOnly={viewParams.dealsOnly || viewParams.isFlashDeal}
              initialFlashDealOnly={viewParams.dealsOnly || viewParams.isFlashDeal}
              onNavigate={handleNavigate}
              onOpenQuickView={handleOpenQuickView}
            />
          </ErrorBoundary>
        )}

        {currentView === 'product-detail' && (
          <ErrorBoundary name="Product Detail">
            <ProductDetailView
              productId={viewParams.productId || viewParams.id || 'prod-portable-blender'}
              onNavigate={handleNavigate}
              onOpenQuickView={handleOpenQuickView}
            />
          </ErrorBoundary>
        )}

        {currentView === 'cart' && (
          <ErrorBoundary name="Cart">
            <CartView onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}

        {currentView === 'checkout' && (
          <ErrorBoundary name="Checkout">
            <CheckoutView onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}

        {currentView === 'order-confirmation' && (
          <ErrorBoundary name="Order Confirmation">
            <OrderConfirmationView order={viewParams.order} onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}

        {currentView === 'track-order' && (
          <ErrorBoundary name="Order Tracking">
            <React.Suspense fallback={<PageSkeleton />}>
              <OrderTrackingView initialOrderNumber={viewParams.orderNumber || viewParams.orderId} onNavigate={handleNavigate} />
            </React.Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'account' && (
          <ErrorBoundary name="Account">
            <React.Suspense fallback={<PageSkeleton />}>
              <CustomerDashboardView
                initialTab={viewParams.tab || 'overview'}
                onNavigate={handleNavigate}
                onOpenQuickView={handleOpenQuickView}
              />
            </React.Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'wishlist' && (
          <ErrorBoundary name="Wishlist">
            <WishlistView onNavigate={handleNavigate} onOpenQuickView={handleOpenQuickView} />
          </ErrorBoundary>
        )}

        {isAuthView && (
          <ErrorBoundary name="Auth">
            <AuthViews mode={currentView as any} onNavigate={handleNavigate} />
          </ErrorBoundary>
        )}

        {currentView === 'discovery-box' && (
          <ErrorBoundary name="Discovery Box">
            <React.Suspense fallback={<PageSkeleton />}>
              <DiscoveryBoxView onNavigate={handleNavigate} />
            </React.Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'become-seller' && (
          <ErrorBoundary name="Become a Seller">
            <React.Suspense fallback={<PageSkeleton />}>
              <BecomeSellerView onNavigate={handleNavigate} />
            </React.Suspense>
          </ErrorBoundary>
        )}

        {currentView === 'vendor-store' && (
          <ErrorBoundary name="Vendor Store">
            <React.Suspense fallback={<PageSkeleton />}>
              <VendorStoreView
                vendorId={viewParams.vendorId || 'vend-kofi'}
                onNavigate={handleNavigate}
                onOpenQuickView={handleOpenQuickView}
              />
            </React.Suspense>
          </ErrorBoundary>
        )}

        {isStaticPage && (
          <ErrorBoundary name="Page">
            <React.Suspense fallback={<PageSkeleton />}>
              <StaticPages page={currentView as any} onNavigate={handleNavigate} />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Overlays and Drawers */}
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

      {/* Global Command Palette (Ctrl+K and Voice Search) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Product Comparison Floating Dock and Matrix Modal */}
      <ProductCompareModal
        onNavigateToProduct={(productId) => handleNavigate('product-detail', { productId })}
      />

      {/* NovaAI Intelligent Shopping Copilot and Stylist */}
      <NovaAICopilot onNavigate={handleNavigate} onOpenQuickView={handleOpenQuickView} />

      {/* WhatsApp Floating Chat Widget */}
      <WhatsAppButton />

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

// -----------------------------------------------------------------------------
// App -- root entry point. Wraps MainApp in all global context providers.
// Provider composition lives in AppProviders to keep this file readable.
// -----------------------------------------------------------------------------
export default function App() {
  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}
