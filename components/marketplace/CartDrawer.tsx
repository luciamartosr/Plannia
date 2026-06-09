"use client";

import { X, Minus, Plus, ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { formatSoles } from "@/lib/budget";

export default function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, updateQty, removeItem, total } = useCartStore();
  const { min, max } = total();

  // Group by provider
  const byProvider = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.providerName]) acc[item.providerName] = [];
    acc[item.providerName].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-white">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary" />
            <h2 className="font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Carrito de cotización
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <ShoppingCart size={40} className="text-border" />
              <p className="text-muted text-sm">Tu carrito está vacío</p>
              <button onClick={onClose} className="text-primary text-sm font-semibold hover:underline">
                Explorar proveedores →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {Object.entries(byProvider).map(([providerName, provItems]) => (
                <div key={providerName}>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{providerName}</p>
                  <div className="flex flex-col gap-3">
                    {provItems.map((item) => (
                      <div key={item.id} className="bg-white border border-border rounded-[var(--radius-card)] p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <p className="text-sm font-semibold text-primary leading-tight">{item.name}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-semibold text-primary w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-light transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-secondary">
                              {formatSoles(item.priceMin * item.quantity)}+
                            </p>
                            <p className="text-xs text-muted">{item.unit}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-white px-5 py-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted">Total estimado</span>
              <span className="text-lg font-bold text-secondary" style={{ fontFamily: "var(--font-display)" }}>
                {formatSoles(min)} – {formatSoles(max)}
              </span>
            </div>
            <p className="text-xs text-muted mb-4">Los montos son referenciales. El proveedor confirma el precio final.</p>
            <button className="w-full flex items-center justify-center gap-2 bg-accent text-white font-semibold py-3 rounded-[var(--radius-btn)] hover:opacity-90 transition-opacity shadow-md">
              Cerrar trato
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-muted mt-2 hover:text-primary transition-colors py-1"
            >
              Seguir explorando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
