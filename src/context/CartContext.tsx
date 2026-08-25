import React, { createContext, useContext, useState, useEffect } from 'react';
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

const CartContext = createContext<CartContextType | undefined>(undefined);

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
    localStorage.setItem('novamart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('novamart_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('novamart_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, variation?: ProductVariation, quantity = 1): boolean => {
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

    const existingIndex = cart.findIndex((item) => item.id === cartItemId);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart + quantity > availableStock) {
      showToast('warning', 'Stock Limit Exceeded', `Only ${availableStock} units available in stock.`);
      return false;
    }

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
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
      setCart((prev) => [...prev, newItem]);
    }

    showToast('success', 'Added to Cart', `${product.name} (${quantity}) added to your shopping bag.`);
    return true;
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
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
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('info', 'Item Removed', 'Product was removed from your cart.');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('novamart_cart');
    localStorage.removeItem('novamart_coupon');
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
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
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('info', 'Coupon Removed', 'Discount coupon was removed.');
  };

  // Calculations
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minimumPurchase) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maximumDiscount && discount > appliedCoupon.maximumDiscount) {
        discount = appliedCoupon.maximumDiscount;
      }
    } else {
      discount = appliedCoupon.value;
    }
  }

  let deliveryFee = settings.standardDeliveryFee;
  if (deliveryMethod === 'express') {
    deliveryFee = settings.expressDeliveryFee;
  } else if (deliveryMethod === 'store_pickup') {
    deliveryFee = 0;
  } else if (subtotal >= settings.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * (settings.taxRate || 0.035)).toFixed(2));
  const total = Number((taxableAmount + (cart.length > 0 ? deliveryFee : 0) + tax).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        discount,
        deliveryFee: cart.length > 0 ? deliveryFee : 0,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
