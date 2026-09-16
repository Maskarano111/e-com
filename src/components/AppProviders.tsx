import React from 'react';
import { ErrorBoundary } from './common/ErrorBoundary';
import { FontSizeProvider } from '../context/FontSizeContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { SettingsProvider } from '../context/SettingsContext';
import { AuthProvider } from '../context/AuthContext';
import { RecentlyViewedProvider } from '../context/RecentlyViewedContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CompareProvider } from '../context/CompareContext';
import { CartProvider } from '../context/CartContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders
 *
 * Composes all global context providers into a single wrapper.
 * The provider order matters -- providers that depend on others
 * (e.g. CartProvider depends on SettingsProvider and ToastProvider)
 * must be nested inside their dependencies.
 *
 * Order (outermost -> innermost):
 *   FontSize -> Theme -> Toast -> Settings -> Auth
 *     -> RecentlyViewed -> Wishlist -> Compare -> Cart
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <ErrorBoundary name="NovaMart App">
    <FontSizeProvider>
      <ThemeProvider>
        <ToastProvider>
          <SettingsProvider>
            <AuthProvider>
              <RecentlyViewedProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <CartProvider>
                      {children}
                    </CartProvider>
                  </CompareProvider>
                </WishlistProvider>
              </RecentlyViewedProvider>
            </AuthProvider>
          </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </FontSizeProvider>
  </ErrorBoundary>
);
