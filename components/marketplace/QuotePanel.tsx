"use client";

import { Minus, Plus, Trash2, FileText, Tag, CalendarDays, Users, MapPin, Edit2 } from "lucide-react";
import { useQuoteRequestStore } from "@/stores/quoteRequest";
import { formatSoles } from "@/lib/budget";
import { CONTEXT_CONFIG, CATEGORY_TO_SERVICE_KEY } from "@/lib/quoteContextConfig";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  providerId: string;
  providerCategory: string;
  onRequestQuote: () => void;
  onEditContext?: () => void;
}

export default function QuotePanel({ providerId, providerCategory, onRequestQuote, onEditContext }: Props) {
  const { items, updateQty, removeItem, totalMin, totalMax, providerId: quotingId, context, contextSet } = useQuoteRequestStore();
  const quoteItems = quotingId === providerId ? items : [];
  const min = totalMin();
  const max = totalMax();
  const hasItems = quoteItems.length > 0;
  const hasPrice = min > 0;
  const serviceKey = CATEGORY_TO_SERVICE_KEY[providerCategory] ?? "otros";

  return (
    <div className="bg-white border border-border rounded-[var(--radius-card)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-primary" />
          <h3 className="font-bold text-primary text-sm" style={{ fontFamily: "var(--font-display)" }}>
            Mi solicitud de cotización
          </h3>
        </div>
        {hasItems && (
          <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {quoteItems.reduce((a, i) => a + i.quantity, 0)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Context summary — visible once set */}
        {contextSet && context && (
          <div className="bg-primary/5 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Contexto del evento</p>
              {onEditContext && (
                <button onClick={onEditContext} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <Edit2 size={9} /> Editar
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {context.guests && (
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <Users size={11} className="shrink-0 text-primary" />
                  {context.guests} personas
                </p>
              )}
              {context.date && (
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <CalendarDays size={11} className="shrink-0 text-primary" />
                  {(() => { try { return format(new Date(context.date + "T12:00:00"), "d 'de' MMMM yyyy", { locale: es }); } catch { return context.date; } })()}
                </p>
              )}
              {context.city && (
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin size={11} className="shrink-0 text-primary" />
                  {context.city}
                </p>
              )}
              {context.eventType && (
                <p className="text-xs text-muted">🎉 {context.eventType}</p>
              )}
              {(context.refs?.length ?? 0) > 0 && (
                <p className="text-xs text-muted">📎 {context.refs!.length} referencia(s) adjunta(s)</p>
              )}
            </div>
          </div>
        )}

        {!hasItems ? (
          <div className="text-center py-5">
            <div className="w-10 h-10 rounded-full bg-border/60 flex items-center justify-center mx-auto mb-3">
              <FileText size={18} className="text-muted" />
            </div>
            <p className="text-xs text-muted leading-snug">
              Explora el catálogo y agrega los servicios que te interesan
            </p>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex flex-col gap-3 mb-4">
              {quoteItems.map((item) => (
                <div key={item.catalogItemId} className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary leading-snug">{item.name}</p>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted">
                        <Tag size={8} /> {item.catalogCategory}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.catalogItemId)}
                      className="text-muted hover:text-red-500 transition-colors shrink-0 mt-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.catalogItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-xs font-bold text-primary w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.catalogItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    {item.priceMin !== null ? (
                      <p className="text-xs font-bold text-secondary">
                        {formatSoles(item.priceMin * item.quantity)}+
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted italic">a consultar</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            {hasPrice && (
              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs text-muted">Estimado referencial</p>
                  <p className="text-sm font-bold text-secondary">
                    {formatSoles(min)}{max > min ? ` – ${formatSoles(max)}` : ""}
                  </p>
                </div>
                <p className="text-[10px] text-muted mt-0.5">
                  El proveedor confirmará el precio final
                </p>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <button
          onClick={onRequestQuote}
          disabled={!hasItems}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-2.5 rounded-[var(--radius-btn)] hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <FileText size={14} />
          Solicitar cotización
        </button>
      </div>
    </div>
  );
}
