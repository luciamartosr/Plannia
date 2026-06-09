import { create } from "zustand";

export interface QuoteLineItem {
  catalogItemId: string;
  name: string;
  catalogCategory: string;
  priceMin: number | null;
  priceMax: number | null;
  unit: string;
  quantity: number;
}

export interface QuoteContext {
  guests?: number;
  date?: string;
  city?: string;
  time?: string;
  hours?: number;
  venueCapacity?: number;
  sendDate?: string;
  quantity?: number;
  serviceDetails?: string;
  eventType?: string;
  refs?: string[];      // data URLs of uploaded images
  notes?: string;       // extra notes from user
}

interface QuoteRequestStore {
  providerId: string | null;
  providerName: string;
  providerCategory: string;
  items: QuoteLineItem[];
  context: QuoteContext | null;    // service-specific context
  contextSet: boolean;             // true once user has confirmed context

  addItem: (providerId: string, providerName: string, providerCategory: string, item: Omit<QuoteLineItem, "quantity">) => void;
  removeItem: (catalogItemId: string) => void;
  updateQty: (catalogItemId: string, qty: number) => void;
  setContext: (ctx: QuoteContext) => void;
  clearQuote: () => void;

  count: () => number;
  totalMin: () => number;
  totalMax: () => number;
}

export const useQuoteRequestStore = create<QuoteRequestStore>((set, get) => ({
  providerId: null,
  providerName: "",
  providerCategory: "",
  items: [],
  context: null,
  contextSet: false,

  addItem: (providerId, providerName, providerCategory, item) =>
    set((s) => {
      // If switching to a different provider, clear everything
      if (s.providerId && s.providerId !== providerId) {
        return {
          providerId,
          providerName,
          providerCategory,
          items: [{ ...item, quantity: 1 }],
          context: null,
          contextSet: false,
        };
      }
      const existing = s.items.find((i) => i.catalogItemId === item.catalogItemId);
      return {
        providerId,
        providerName,
        providerCategory,
        items: existing
          ? s.items.map((i) =>
              i.catalogItemId === item.catalogItemId ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [...s.items, { ...item, quantity: 1 }],
      };
    }),

  removeItem: (catalogItemId) =>
    set((s) => ({ items: s.items.filter((i) => i.catalogItemId !== catalogItemId) })),

  updateQty: (catalogItemId, qty) =>
    set((s) => ({
      items:
        qty <= 0
          ? s.items.filter((i) => i.catalogItemId !== catalogItemId)
          : s.items.map((i) => (i.catalogItemId === catalogItemId ? { ...i, quantity: qty } : i)),
    })),

  setContext: (ctx) => set({ context: ctx, contextSet: true }),

  clearQuote: () => set({
    providerId: null, providerName: "", providerCategory: "",
    items: [], context: null, contextSet: false,
  }),

  count: () => get().items.reduce((a, i) => a + i.quantity, 0),
  totalMin: () =>
    get().items.reduce((a, i) => a + (i.priceMin ?? 0) * i.quantity, 0),
  totalMax: () =>
    get().items.reduce((a, i) => a + (i.priceMax ?? i.priceMin ?? 0) * i.quantity, 0),
}));
