import { create } from "zustand";

export interface CartItem {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  priceMin: number;
  priceMax: number;
  unit: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: () => { min: number; max: number };
  count: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((s) => {
      const existing = s.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...s.items, { ...item, quantity: 1 }] };
    }),
  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  updateQty: (id, qty) =>
    set((s) => ({
      items: qty <= 0
        ? s.items.filter((i) => i.id !== id)
        : s.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    })),
  clearCart: () => set({ items: [] }),
  total: () => {
    const items = get().items;
    return {
      min: items.reduce((acc, i) => acc + i.priceMin * i.quantity, 0),
      max: items.reduce((acc, i) => acc + i.priceMax * i.quantity, 0),
    };
  },
  count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
}));
