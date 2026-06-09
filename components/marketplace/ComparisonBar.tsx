"use client";

import { useMarketplaceStore } from "@/stores/marketplace";

export default function ComparisonBar({ onCompare }: { onCompare: () => void }) {
  const { selectedForComparison, clearComparison } = useMarketplaceStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
      <div className="max-w-lg mx-auto bg-primary text-white rounded-[var(--radius-card)] shadow-2xl px-5 py-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium">
          {selectedForComparison.length} proveedores seleccionados
        </span>
        <div className="flex gap-2">
          <button
            onClick={clearComparison}
            className="text-xs text-white/70 hover:text-white transition-colors px-2 py-1"
          >
            Limpiar
          </button>
          <button
            onClick={onCompare}
            className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-[var(--radius-btn)] hover:opacity-90 transition-opacity"
          >
            Comparar {selectedForComparison.length} proveedores →
          </button>
        </div>
      </div>
    </div>
  );
}
