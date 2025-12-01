import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  
  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  removeItem: (bookId: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
  
  // Helpers
  getItem: (bookId: number) => CartItem | undefined;
}

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.book_price || 0) * item.quantity,
    0
  );
  return { totalItems, totalPrice };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.book_id === newItem.book_id
          );

          let newItems: CartItem[];
          if (existingItemIndex > -1) {
            // Update existing item
            newItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          } else {
            // Add new item
            newItems = [...state.items, newItem];
          }

          const { totalItems, totalPrice } = calculateTotals(newItems);
          return { items: newItems, totalItems, totalPrice };
        });
      },

      updateQuantity: (bookId, quantity) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.book_id === bookId ? { ...item, quantity } : item
          );
          const { totalItems, totalPrice } = calculateTotals(newItems);
          return { items: newItems, totalItems, totalPrice };
        });
      },

      removeItem: (bookId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.book_id !== bookId);
          const { totalItems, totalPrice } = calculateTotals(newItems);
          return { items: newItems, totalItems, totalPrice };
        });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      setCart: (items) => {
        const { totalItems, totalPrice } = calculateTotals(items);
        set({ items, totalItems, totalPrice });
      },

      getItem: (bookId) => {
        return get().items.find((item) => item.book_id === bookId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
