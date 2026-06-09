"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, CheckCircle2, Plus } from "lucide-react";
import { Provider } from "@/stores/marketplace";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useTaskPlanStore } from "@/stores/taskPlan";
import { formatSoles } from "@/lib/budget";
import { TaskProvider } from "@/lib/taskPlan";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  provider: Provider & { availability?: boolean };
}

function providerToTask(p: Provider): TaskProvider {
  return {
    id: `mkt-${p.id}`,
    source: "plannia",
    name: p.business_name,
    priceEstMin: p.price_min,
    priceEstMax: p.price_max ?? p.price_min,
    rating: p.rating_avg,
    phone: "", email: "", notes: "",
    state: "suggested",
    quotedPrice: null, quoteNotes: "",
    contractedPrice: null, contractedDate: null, deliveryDate: null,
    adelanto: null, adelantoDate: null, adelantoPaid: false,
    finalPayment: null, finalPaymentDate: null, finalPaymentPaid: false,
    pendingPaymentDate: null,
  };
}

export default function ProviderCard({ provider }: Props) {
  const { addToComparison, removeFromComparison, isInComparison } = useMarketplaceStore();
  const { tasks, addProvider } = useTaskPlanStore();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const selected = isInComparison(provider.id);

  const task = taskId ? tasks.find((t) => t.id === taskId) : null;
  const alreadyAdded = task?.providers.some((p) => p.id === `mkt-${provider.id}`) ?? false;
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToTask(e: React.MouseEvent) {
    e.preventDefault();
    if (!taskId || alreadyAdded || justAdded) return;
    addProvider(taskId, providerToTask(provider));
    setJustAdded(true);
  }

  function toggleCompare(e: React.MouseEvent) {
    e.preventDefault();
    if (selected) removeFromComparison(provider.id);
    else addToComparison(provider);
  }

  const profileHref = taskId
    ? `/marketplace/${provider.id}?taskId=${taskId}`
    : `/marketplace/${provider.id}`;

  return (
    <div className={[
      "group relative bg-surface rounded-[var(--radius-card)] border overflow-hidden transition-all duration-300",
      "hover:-translate-y-0.5",
      selected
        ? "border-primary"
        : "border-border hover:border-primary/40",
    ].join(" ")}
      style={{ boxShadow: selected ? "0 4px 20px rgba(47,91,46,0.15)" : "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Image */}
      <Link href={profileHref}>
        <div className="relative h-52 overflow-hidden bg-border">
          <Image
            src={provider.cover_photo}
            alt={provider.business_name}
            fill
            className="object-cover group-hover:scale-103 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Verified badge */}
          {provider.is_verified && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
              <ShieldCheck size={10} className="text-primary" />
              <span className="text-[9px] font-bold text-primary">Verificado</span>
            </div>
          )}

          {/* Compare checkbox */}
          {!taskId && (
            <button
              onClick={toggleCompare}
              className={[
                "absolute top-3 right-3 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                selected
                  ? "bg-primary border-primary opacity-100 shadow-md"
                  : "bg-white/90 border-white/80 opacity-0 group-hover:opacity-100 backdrop-blur-sm",
              ].join(" ")}
              title={selected ? "Quitar de comparación" : "Comparar"}
            >
              {selected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </Link>

      {/* Content */}
      <Link href={profileHref}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-text text-sm leading-tight">
              {provider.business_name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] font-semibold text-muted">{provider.category}</span>
            <span className="text-border text-xs">·</span>
            <span className="text-[10px] text-muted">{provider.city}</span>
          </div>

          <div className="flex items-center gap-1.5 mb-4">
            <Star size={12} className="text-yellow-400 fill-yellow-400 shrink-0" />
            <span className="text-xs font-bold text-text">{provider.rating_avg}</span>
            <span className="text-[10px] text-muted">({provider.review_count} reseñas)</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">Desde</p>
              <span className="text-base font-extrabold text-primary">
                {formatSoles(provider.price_min)}
              </span>
            </div>
            <span className={[
              "text-[10px] px-2.5 py-1 rounded-full font-semibold",
              provider.accepts_commissions
                ? "bg-warning text-warning-text"
                : "bg-primary/8 text-primary",
            ].join(" ")}>
              {provider.accepts_commissions ? "Con comisiones" : "Sin comisiones"}
            </span>
          </div>
        </div>
      </Link>

      {/* Add-to-task CTA */}
      {taskId && (
        <div className="px-5 pb-5">
          <button
            onClick={handleAddToTask}
            disabled={alreadyAdded || justAdded}
            className={[
              "w-full flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-[var(--radius-btn)] border-2 transition-all duration-200",
              alreadyAdded || justAdded
                ? "border-accent/40 bg-accent/8 text-secondary cursor-default"
                : "border-primary bg-primary text-white hover:bg-primary-light",
            ].join(" ")}
          >
            {alreadyAdded || justAdded ? (
              <><CheckCircle2 size={13} /> Agregado a mis sugeridos</>
            ) : (
              <><Plus size={13} /> Agregar a mis sugeridos</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
