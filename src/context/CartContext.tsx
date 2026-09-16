import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Coupon, Product, ProductVariation } from '../types/index';
import { useSettings } from './SettingsContext';
import { useToast } from './ToastContext';
import { api } from '../services/api';

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  appliedCoupon: Coupon | null;
  deliveryMethod: 'standard' | 'express' | 'store_pickup';
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, variation?: ProductVariation, quantity?: number) => boolean;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  setDeliveryMethod: (method: 'standard' | 'express' | 'store_pickup') => void;
}

const DEFAULT_CART_CONTEXT: CartContextType = {
  cart: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  appliedCoupon: null,
  deliveryMethod: 'standard',
  isCartDrawerOpen: false,
  setIsCartDrawerOpen: () => {},
  addToCart: () => false,
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  applyCoupon: async () => false,
  removeCoupon: () => {},
  setDeliveryMethod: () => {}
};

const CartContext = createContext<CartContextType>(DEFAULT_CART_CONTEXT);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('novamart_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const stored = localStorage.getItem('novamart_coupon');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express' | 'store_pickup'>('standard');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const { settings } = useSettings();
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('novamart_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('novamart_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('novamart_coupon');
      }
    } catch {}
  }, [appliedCoupon]);

  const addToCart = useCallback((product: Product, variation?: ProductVariation, quantity = 1): boolean => {
    const cartItemId = variation ? `${product.id}-${variation.id}` : `${product.id}-default`;
    const unitPrice = variation
      ? variation.discountPrice || variation.price
      : product.discountPrice || product.price;
    const regularPrice = variation ? variation.price : product.price;
    const availableStock = variation ? variation.stockQuantity : product.stockQuantity;

    if (availableStock <= 0) {
      showToast('error', 'Out of Stock', `Sorry, ${product.name} is currently out of stock.`);
      return false;
    }

    let added = true;
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      const currentQtyInCart = existingIndex > -1 ? prev[existingIndex].quantity : 0;

      if (currentQtyInCart + quantity > availableStock) {
        showToast('warning', 'Stock Limit Exceeded', `Only ${availableStock} units available in stock.`);
        added = false;
        return prev;
      }

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          variationId: variation?.id,
          variationName: variation?.name,
          name: product.name,
          image: variation?.image || product.featuredImage,
          price: unitPrice,
          regularPrice,
          quantity,
          stockQuantity: availableStock,
          sku: variation?.sku || product.sku
        };
        return [...prev, newItem];
      }
    });

    if (added) {
      showToast('success', 'Added to Cart', `${product.name} (${quantity}) added to your shopping bag.`);
    }
    return added;
  }, [showToast]);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      showToast('info', 'Item Removed', 'Product was removed from your cart.');
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          if (quantity > item.stockQuantity) {
            showToast('warning', 'Max Available Reached', `Only ${item.stockQuantity} items in stock.`);
            return { ...item, quantity: item.stockQuantity };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [showToast]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('info', 'Item Removed', 'Product was removed from your cart.');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('novamart_cart');
      localStorage.removeItem('novamart_coupon');
    } catch {}
  }, []);

  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (rawSubtotal <= 0) {
      showToast('error', 'Empty Cart', 'Add products before applying promo codes.');
      return false;
    }

    try {
      const res = await api.validateCoupon(code, rawSubtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        showToast('success', 'Coupon Applied!', `You saved with ${res.coupon.code}.`);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Invalid Coupon', err.message || 'Coupon could not be applied.');
      return false;
    }
  }, [cart, showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('info', 'Coupon Removed', 'Discount coupon was removed.');
  }, [showToast]);

  // Calculations wrapped in useMemo to avoid recomputing on every render
  const { itemCount, subtotal } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const item of cart) {
      count += item.quantity;
      sum += item.price * item.quantity;
    }
    return { itemCount: count, subtotal: sum };
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal < appliedCoupon.minimumPurchase) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      const computed = (subtotal * appliedCoupon.value) / 100;
      return appliedCoupon.maximumDiscount && computed > appliedCoupon.maximumDiscount
        ? appliedCoupon.maximumDiscount
        : computed;
    }
    return appliedCoupon.value;
  }, [appliedCoupon, subtotal]);

  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (deliveryMethod === 'store_pickup') return 0;
    if (subtotal >= settings.freeDeliveryThreshold) return 0;
    if (deliveryMethod === 'express') return settings.expressDeliveryFee;
    return settings.standardDeliveryFee;
  }, [cart.length, deliveryMethod, settings.expressDeliveryFee, settings.freeDeliveryThreshold, settings.standardDeliveryFee, subtotal]);

  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = settings.taxRate || 0.035;
  const tax = useMemo(() => Number((taxableAmount * taxRate).toFixed(2)), [taxableAmount, taxRate]);
  const total = useMemo(
    () => Number((taxableAmount + deliveryFee + tax).toFixed(2)),
    [taxableAmount, deliveryFee, tax]
  );

  const contextValue = useMemo<CartContextType>(() => ({
    cart,
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    appliedCoupon,
    deliveryMethod,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    setDeliveryMethod
  }), [
    cart,
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    appliedCoupon,
    deliveryMethod,
    isCartDrawerOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  return context || DEFAULT_CART_CONTEXT;
};

