import { useState, useCallback, useEffect } from 'react';
import { MenuItem } from '@/data/menuData';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  deliveryType: 'asporto' | 'delivery';
  deliveryAddress?: string;
  pickupTime?: string;
}

const CART_STORAGE_KEY = 'pizzeria-cart';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { items: [], deliveryType: 'asporto' };
      }
    }
    return { items: [], deliveryType: 'asporto' };
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((menuItem: MenuItem, quantity: number = 1, notes?: string) => {
    setCart(prev => {
      const existingIndex = prev.items.findIndex(item => item.menuItem.id === menuItem.id);
      
      if (existingIndex >= 0) {
        const newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          notes: notes || newItems[existingIndex].notes,
        };
        return { ...prev, items: newItems };
      }
      
      return {
        ...prev,
        items: [...prev.items, { menuItem, quantity, notes }],
      };
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.menuItem.id !== menuItemId),
    }));
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      ),
    }));
  }, [removeItem]);

  const updateNotes = useCallback((menuItemId: string, notes: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.menuItem.id === menuItemId ? { ...item, notes } : item
      ),
    }));
  }, []);

  const setDeliveryType = useCallback((type: 'asporto' | 'delivery') => {
    setCart(prev => ({ ...prev, deliveryType: type }));
  }, []);

  const setDeliveryAddress = useCallback((address: string) => {
    setCart(prev => ({ ...prev, deliveryAddress: address }));
  }, []);

  const setPickupTime = useCallback((time: string) => {
    setCart(prev => ({ ...prev, pickupTime: time }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], deliveryType: 'asporto' });
  }, []);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    setDeliveryType,
    setDeliveryAddress,
    setPickupTime,
    clearCart,
    totalItems,
    totalPrice,
  };
};
