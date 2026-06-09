"use client";

import Image from "next/image";
import { X, Star, ShieldCheck, CheckCircle, XCircle, ShoppingCart } from "lucide-react";
import { useMarketplaceStore } from "@/stores/marketplace";
import { formatSoles } from "@/lib/budget";

export default function ComparisonPanel({ onClose }: { onClose: () => void }) {
  const { selectedForComparison, clearComparison } = useMarketplaceStore();
  const category = selectedForComparison[0]?.category ?? "";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
      <div className="bg-background w-full max-w-4xl max-h-[90vh] rounded-[var(--radius-card)] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-border">
          <div>
            <h2 className="font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Comparando proveedores
            </h2>
            <p className="text-xs text-muted">{category}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Comparison table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedForComparison.length}, 1fr)` }}>
            {selectedForComparison.map((p) => (
              <div key={p.id} className="bg-white rounded-[var(--radius-card)] border border-border overflow-hidden">
                {/* Cover */}
                <div className="relative h-36">
                  <Image src={p.cover_photo} alt={p.business_name} fill className="object-cover" />
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="font-bold text-primary text-sm" style={{ fontFamily: "var(--font-display)" }}>
                        {p.business_name}
                      </h3>
                      {p.is_verified && <ShieldCheck size={14} className="text-accent" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-primary">{p.rating_avg}</span>
                      <span className="text-xs text-muted">({p.review_count})</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">Precio base</p>
                    <p className="text-sm font-bold text-secondary">
                      {formatSoles(p.price_min)} – {formatSoles(p.price_max)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">Comisiones</p>
                    <div className="flex items-center gap-1">
                      {p.accepts_commissions ? (
                        <>
                          <XCircle size={14} className="text-muted" />
                          <span className="text-xs text-muted">Acepta comisiones</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} className="text-secondary" />
                          <span className="text-xs text-secondary">Sin comisiones</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button className="mt-auto flex items-center justify-center gap-2 bg-primary text-white text-xs font-semibold py-2 px-3 rounded-[var(--radius-btn)] hover:bg-primary-light transition-colors">
                    <ShoppingCart size={13} />
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border bg-white">
          <p className="text-xs text-muted text-center">Los precios son referenciales. El proveedor confirma el monto final.</p>
        </div>
      </div>
    </div>
  );
}
