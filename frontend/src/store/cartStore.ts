import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  description?: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartState {
  // Cart Items
  items: CartItem[];
  isOpen: boolean;
  
  // Totals
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  
  // Shipping & Checkout
  shippingInfo: ShippingInfo | null;
  
  // Loading states
  isLoading: boolean;
  isProcessingPayment: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setShippingInfo: (info: ShippingInfo) => void;
  calculateTotals: () => void;
  setLoading: (loading: boolean) => void;
  setProcessingPayment: (processing: boolean) => void;
}

const TAX_RATE = 0.08; // 8% tax rate
const SHIPPING_RATE = 15.00; // Flat shipping rate
const FREE_SHIPPING_THRESHOLD = 500; // Free shipping over $500

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      shippingInfo: null,
      isLoading: false,
      isProcessingPayment: false,

      // Add item to cart
      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === newItem.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          get().updateQuantity(existingItem.id, existingItem.quantity + 1);
        } else {
          // Add new item
          set(state => ({
            items: [...state.items, { ...newItem, quantity: 1 }]
          }));
          toast.success(`${newItem.name} added to cart`);
        }
        
        get().calculateTotals();
      },

      // Remove item from cart
      removeItem: (id) => {
        const { items } = get();
        const item = items.find(item => item.id === id);
        
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
        
        if (item) {
          toast.success(`${item.name} removed from cart`);
        }
        
        get().calculateTotals();
      },

      // Update item quantity
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        }));
        
        get().calculateTotals();
      },

      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0
        });
        toast.success('Cart cleared');
      },

      // Toggle cart visibility
      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },

      // Set shipping information
      setShippingInfo: (info) => {
        set({ shippingInfo: info });
      },

      // Calculate totals
      calculateTotals: () => {
        const { items } = get();
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * TAX_RATE;
        const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
        const total = subtotal + tax + shipping;
        
        set({
          subtotal: Number(subtotal.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          shipping: Number(shipping.toFixed(2)),
          total: Number(total.toFixed(2))
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set payment processing state
      setProcessingPayment: (processing) => {
        set({ isProcessingPayment: processing });
      }
    }),
    {
      name: 'cast-stone-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        shippingInfo: state.shippingInfo
      })
    }
  )
);

// Utility functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

export const getCartItemCount = (): number => {
  const { items } = useCartStore.getState();
  return items.reduce((count, item) => count + item.quantity, 0);
};

export const getCartTotal = (): number => {
  const { total } = useCartStore.getState();
  return total;
};
