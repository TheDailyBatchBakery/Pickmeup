import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CustomerInfo } from '@/types';

interface CartStore {
  items: CartItem[];
  customerInfo: CustomerInfo | null;
  pickupTime: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  setPickupTime: (time: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerInfo: null,
      pickupTime: null,
      addItem: (item) => {
        const existingItem = get().items.find((i) => i.id === item.id);
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
        } else {
          set({
            items: get().items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          });
        }
      },
      clearCart: () => {
        set({ items: [], customerInfo: null, pickupTime: null });
      },
      setCustomerInfo: (info) => {
        set({ customerInfo: info });
      },
      setPickupTime: (time) => {
        set({ pickupTime: time });
      },
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'pickmeup-cart',
    }
  )
);

