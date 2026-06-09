import { create } from "zustand";

export interface Provider {
  id: string;
  business_name: string;
  category: string;
  city: string;
  description: string;
  is_verified: boolean;
  accepts_commissions: boolean;
  rating_avg: number;
  review_count: number;
  price_min: number;
  price_max: number;
  cover_photo: string;
}

interface MarketplaceStore {
  selectedForComparison: Provider[];
  addToComparison: (provider: Provider) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;
}

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  selectedForComparison: [],
  addToComparison: (provider) =>
    set((s) => {
      if (s.selectedForComparison.length >= 3) return s;
      if (s.selectedForComparison.find((p) => p.id === provider.id)) return s;
      return { selectedForComparison: [...s.selectedForComparison, provider] };
    }),
  removeFromComparison: (id) =>
    set((s) => ({ selectedForComparison: s.selectedForComparison.filter((p) => p.id !== id) })),
  clearComparison: () => set({ selectedForComparison: [] }),
  isInComparison: (id) => get().selectedForComparison.some((p) => p.id === id),
}));
