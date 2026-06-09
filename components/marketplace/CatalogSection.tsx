"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Flame, Tag } from "lucide-react";
import { CatalogItem } from "@/lib/mockData";
import { useQuoteRequestStore, QuoteContext } from "@/stores/quoteRequest";
import { formatSoles } from "@/lib/budget";
import QuoteContextModal from "@/components/marketplace/QuoteContextModal";

interface Props {
  providerId: string;
  providerName: string;
  providerCategory: string;
  catalog: CatalogItem[];
}

export default function CatalogSection({ providerId, providerName, providerCategory, catalog }: Props) {
  const { items, addItem, updateQty, providerId: quotingId, contextSet, setContext } = useQuoteRequestStore();
  const quoteItems = quotingId === providerId ? items : [];

  // Build category list preserving order of first appearance
  const categories = ["Todos", ...Array.from(new Set(catalog.map((c) => c.catalogCategory)))];
  const [activeCategory, setActiveCategory] = useState("Todos");

  // Context modal state
  const [pendingItem, setPendingItem] = useState<CatalogItem | null>(null);

  const filtered =
    activeCategory === "Todos"
      ? catalog
      : catalog.filter((c) => c.catalogCategory === activeCategory);

  function getLineItem(id: string) {
    return quoteItems.find((i) => i.catalogItemId === id) ?? null;
  }

  function commitAdd(item: CatalogItem) {
    addItem(providerId, providerName, providerCategory, {
      catalogItemId: item.id,
      name: item.name,
      catalogCategory: item.catalogCategory,
      priceMin: item.priceMin,
      priceMax: item.priceMax,
      unit: item.unit,
    });
  }

  function handleAdd(item: CatalogItem) {
    const isNewProvider = quotingId !== providerId;
    const needsContext = isNewProvider || !contextSet;
    if (needsContext) {
      // Queue this item — show context modal first
      setPendingItem(item);
    } else {
      commitAdd(item);
    }
  }

  function handleContextConfirm(ctx: QuoteContext) {
    setContext(ctx);
    if (pendingItem) commitAdd(pendingItem);
    setPendingItem(null);
  }

  function handleContextCancel() {
    setPendingItem(null);
  }

  return (
    <div>
      {/* Context modal */}
      {pendingItem && (
        <QuoteContextModal
          providerCategory={providerCategory}
          providerName={providerName}
          itemName={pendingItem.name}
          onConfirm={handleContextConfirm}
          onCancel={handleContextCancel}
        />
      )}

      <h2
        className="font-bold text-primary text-base mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Catálogo
      </h2>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              "shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
              activeCategory === cat
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted border-border hover:border-primary/50 hover:text-primary",
            ].join(" ")}
          >
            {cat}
            {cat !== "Todos" && (
              <span className="ml-1 opacity-60">
                ({catalog.filter((c) => c.catalogCategory === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const lineItem = getLineItem(item.id);
          const inQuote = !!lineItem;
          const isIncluded = item.priceMin === null;

          return (
            <div
              key={item.id}
              className={[
                "bg-white border rounded-[var(--radius-card)] overflow-hidden transition-all duration-150",
                inQuote ? "border-primary shadow-sm" : "border-border hover:border-primary/30",
              ].join(" ")}
            >
              {/* Image */}
              {item.image ? (
                <div className="relative h-36 bg-border overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {item.popular && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Flame size={9} /> Popular
                    </span>
                  )}
                  {inQuote && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-10" />
              )}

              <div className="p-4">
                {/* Category + name */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    {!item.image && item.popular && (
                      <span className="inline-flex items-center gap-1 bg-accent/15 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                        <Flame size={9} /> Popular
                      </span>
                    )}
                    <p
                      className="font-semibold text-primary text-sm leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.name}
                    </p>
                  </div>
                </div>

                {/* Category badge (only when showing "Todos") */}
                {activeCategory === "Todos" && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted bg-border/50 px-2 py-0.5 rounded-full mb-1.5">
                    <Tag size={9} /> {item.catalogCategory}
                  </span>
                )}

                {/* Description */}
                <p className="text-xs text-muted leading-snug mb-3">{item.description}</p>

                {/* Price + action */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {isIncluded ? (
                      <p className="text-xs text-secondary font-semibold">{item.unit}</p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-secondary">
                          {item.priceMax && item.priceMax !== item.priceMin
                            ? `${formatSoles(item.priceMin!)} – ${formatSoles(item.priceMax)}`
                            : formatSoles(item.priceMin!)}
                        </p>
                        <p className="text-[10px] text-muted">{item.unit}</p>
                      </>
                    )}
                  </div>

                  {isIncluded ? (
                    <span className="text-xs text-secondary font-semibold bg-accent/10 px-3 py-1.5 rounded-[var(--radius-btn)]">
                      Incluido
                    </span>
                  ) : inQuote ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, lineItem.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold text-primary w-5 text-center">
                        {lineItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, lineItem.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(item)}
                      className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-btn)] hover:bg-primary/90 transition-colors"
                    >
                      <Plus size={12} /> Agregar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
