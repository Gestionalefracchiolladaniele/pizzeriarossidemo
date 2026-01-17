import { useState, useCallback, useEffect } from 'react';

// Flexible MenuItem interface that works with both static and dynamic data
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
  ingredients?: string[];
  allergens?: string[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  deliveryType: 'takeaway' | 'delivery' | 'dine_in';
  deliveryAddress?: string;
  pickupTime?: string;
  tableNumber?: string; // For dine-in orders
}

const CART_STORAGE_KEY = 'pizzeria-cart';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old 'asporto' to 'takeaway'
        if (parsed.deliveryType === 'asporto') {
          parsed.deliveryType = 'takeaway';
        }
        return parsed;
      } catch {
        return { items: [], deliveryType: 'takeaway' };
      }
    }
    return { items: [], deliveryType: 'takeaway' };
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

  const setDeliveryType = useCallback((type: 'takeaway' | 'delivery' | 'dine_in') => {
    setCart(prev => ({ ...prev, deliveryType: type }));
  }, []);

  const setDeliveryAddress = useCallback((address: string) => {
    setCart(prev => ({ ...prev, deliveryAddress: address }));
  }, []);

  const setPickupTime = useCallback((time: string) => {
    setCart(prev => ({ ...prev, pickupTime: time }));
  }, []);

  const setTableNumber = useCallback((tableNumber: string) => {
    setCart(prev => ({ ...prev, tableNumber }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], deliveryType: 'takeaway' });
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
    setTableNumber,
    clearCart,
    totalItems,
    totalPrice,
  };
};
