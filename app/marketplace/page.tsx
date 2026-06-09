"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, X, ArrowLeft, SlidersHorizontal, ChevronDown,
  ChevronUp, Star, CalendarDays, Users, Wallet, MapPin,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import ProviderCard from "@/components/marketplace/ProviderCard";
import ComparisonBar from "@/components/marketplace/ComparisonBar";
import ComparisonPanel from "@/components/marketplace/ComparisonPanel";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useOnboardingStore } from "@/stores/onboarding";
import { MOCK_PROVIDERS } from "@/lib/mockData";
import { MARKETPLACE_CATEGORIES, SERVICE_TO_CATEGORY, SERVICES_BY_CATEGORY } from "@/lib/serviceToCategory";
import { formatSoles } from "@/lib/budget";

const CITIES = ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura", "Ica", "Chiclayo"];
const SORT_OPTIONS = [
  { value: "recomendados",    label: "Recomendados por Plannia" },
  { value: "mejor_evaluados", label: "Mejor evaluados" },
  { value: "menor_precio",    label: "Menor precio" },
  { value: "mayor_precio",    label: "Mayor precio" },
  { value: "mas_contratados", label: "Más contratados" },
];
const RATING_OPTIONS = [4.0, 4.5, 4.8];
const PAYMENT_OPTIONS = [
  { value: "adelanto", label: "Adelanto" },
  { value: "cuotas",   label: "Cuotas" },
  { value: "unico",    label: "Pago único" },
];

interface Filters {
  categorias:      string[];   // multi-select; empty = Todos
  ciudad:          string;
  fecha:           string;
  invitados:       string;
  presupuestoMin:  string;
  presupuestoMax:  string;
  rating:          number | null;
  soloDisponibles: boolean;
  formasPago:      string[];
  servicios:       string[];
  ordenarPor:      string;
}

function defaultFilters(): Filters {
  return {
    categorias: [], ciudad: "", fecha: "", invitados: "",
    presupuestoMin: "", presupuestoMax: "", rating: null,
    soloDisponibles: false, formasPago: [], servicios: [],
    ordenarPor: "recomendados",
  };
}

export default function MarketplacePage() {
  return <Suspense><MarketplaceContent /></Suspense>;
}

function MarketplaceContent() {
  const searchParams   = useSearchParams();
  const { data }       = useOnboardingStore();
  const taskId         = searchParams.get("taskId") ?? "";
  const desde          = searchParams.get("desde") ?? "";

  // Detect if user has an event (any meaningful onboarding data)
  const hasEvent = !!(data.city || data.eventDate || data.services.length);

  // Build initial filters:
  // - Direct navigation (/marketplace, no context params) → clean slate, no event data injected
  // - Coming from event context (desde=resumen, taskId, or explicit categoria/categorias) → apply URL params + event data
  const [filters, setFilters] = useState<Filters>(() => {
    const f = defaultFilters();

    const urlCat       = searchParams.get("categoria");
    const urlCategorias = searchParams.get("categorias");
    const urlCiudad    = searchParams.get("ciudad");
    const urlPrecioMax = searchParams.get("precioMax");
    const fromContext  = !!(desde || taskId || urlCat || urlCategorias);

    // Category filters — only from explicit URL params
    if (urlCat) f.categorias = [urlCat];
    if (urlCategorias) {
      const mapped = urlCategorias.split(",").map((s) => SERVICE_TO_CATEGORY[s]).filter(Boolean);
      if (mapped.length > 0) f.categorias = mapped;
    }

    // City, date, guests, budget — only inject from event when coming from a context link
    if (fromContext) {
      f.ciudad = urlCiudad || data.city || "";
      f.fecha  = data.eventDate && !data.unknownDate ? data.eventDate : "";
      if (data.guestCount) f.invitados = String(data.guestCount);
      if (urlPrecioMax) f.presupuestoMax = urlPrecioMax;
      else if (data.budgetDefined) f.presupuestoMax = String(data.budgetDefined);
    } else {
      // Pure direct navigation — explicit URL city still respected, nothing else
      f.ciudad = urlCiudad || "";
      if (urlPrecioMax) f.presupuestoMax = urlPrecioMax;
    }

    return f;
  });

  const [search,       setSearch]       = useState("");
  const [showFilters,  setShowFilters]  = useState(!!desde || !!taskId);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { selectedForComparison } = useMarketplaceStore();

  function patch(p: Partial<Filters>) { setFilters((f) => ({ ...f, ...p })); }

  // ── Filtering ────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...MOCK_PROVIDERS];

    // text search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.business_name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }
    // category (multi-select; empty = show all)
    if (filters.categorias.length > 0) {
      list = list.filter((p) => filters.categorias.includes(p.category));
    }
    // city
    if (filters.ciudad) {
      list = list.filter((p) => p.city.toLowerCase() === filters.ciudad.toLowerCase());
    }
    // budget
    const pMin = filters.presupuestoMin ? Number(filters.presupuestoMin) : null;
    const pMax = filters.presupuestoMax ? Number(filters.presupuestoMax) : null;
    if (pMin != null) list = list.filter((p) => p.price_max >= pMin);
    if (pMax != null) list = list.filter((p) => p.price_min <= pMax);
    // rating
    if (filters.rating != null) list = list.filter((p) => p.rating_avg >= filters.rating!);
    // availability
    if (filters.soloDisponibles) list = list.filter((p) => p.availability !== false);

    // sort
    switch (filters.ordenarPor) {
      case "mejor_evaluados": list.sort((a, b) => b.rating_avg - a.rating_avg); break;
      case "menor_precio":    list.sort((a, b) => a.price_min - b.price_min); break;
      case "mayor_precio":    list.sort((a, b) => b.price_max - a.price_max); break;
      default: break; // recomendados = original order
    }

    return list;
  }, [search, filters]);

  // Active filter count (for badge)
  const activeFilterCount = [
    filters.categorias.length > 0,
    !!filters.ciudad,
    !!filters.fecha,
    !!filters.invitados,
    !!filters.presupuestoMin || !!filters.presupuestoMax,
    filters.rating != null,
    filters.soloDisponibles,
    filters.formasPago.length > 0,
    filters.servicios.length > 0,
  ].filter(Boolean).length;

  function clearAll() { setFilters(defaultFilters()); }

  // Dynamic services: use first selected category, or none
  const dynamicServices = filters.categorias.length === 1
    ? (SERVICES_BY_CATEGORY[filters.categorias[0]] ?? [])
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Context bars */}
      {taskId && (
        <div className="bg-primary/6 border-b border-primary/20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs text-primary font-medium">
              Estás buscando proveedores para un pendiente de tu evento.
            </p>
            <Link href="/dashboard/checklist"
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
              <ArrowLeft size={12} /> Volver a mis pendientes
            </Link>
          </div>
        </div>
      )}
      {desde === "resumen" && !taskId && (
        <div className="bg-accent/10 border-b border-accent/25 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs text-secondary font-medium">
              ✨ Filtros precargados con la información de tu evento.
            </p>
            <Link href="/onboarding/resumen"
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-secondary border border-secondary/30 px-3 py-1.5 rounded-lg hover:bg-secondary/5 transition-colors">
              <ArrowLeft size={12} /> Volver al resumen
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex flex-col gap-5">

        {/* ── Search bar + filter toggle ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Buscar proveedor, categoría o ciudad..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-surface border border-border rounded-[var(--radius-btn)] text-sm focus:outline-none focus:border-primary transition-colors" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                <X size={16} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters((v) => !v)}
            className={[
              "flex items-center gap-2 px-4 py-3 rounded-[var(--radius-btn)] border-2 text-sm font-semibold transition-all whitespace-nowrap",
              showFilters || activeFilterCount > 0
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-muted hover:border-primary/50",
            ].join(" ")}>
            <SlidersHorizontal size={16} />
            Filtros
            {activeFilterCount > 0 && (
              <span className={[
                "text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center",
                showFilters ? "bg-white text-primary" : "bg-accent text-white",
              ].join(" ")}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* ── Filter panel ── */}
        {showFilters && (
          <div className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-border/20">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-primary" />
                <p className="text-sm font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  Filtros
                </p>
                {hasEvent && (
                  <span className="text-[10px] font-bold text-secondary bg-accent/15 px-2 py-0.5 rounded-full">
                    ✓ Basado en tu evento
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-xs text-muted hover:text-primary underline transition-colors">
                  Limpiar todos
                </button>
              )}
            </div>

            {/* ── BLOQUE 1: Categoría — multi-select ── */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                  Tipo de servicio
                  {filters.categorias.length > 0 && (
                    <span className="ml-2 text-primary normal-case font-bold">
                      · {filters.categorias.length} seleccionado{filters.categorias.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </p>
                {filters.categorias.length > 0 && (
                  <button onClick={() => patch({ categorias: [], servicios: [] })}
                    className="text-[10px] text-muted hover:text-primary underline transition-colors">
                    Quitar todos
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MARKETPLACE_CATEGORIES.filter((c) => c !== "Todos").map((cat) => {
                  const active = filters.categorias.includes(cat);
                  return (
                    <button key={cat}
                      onClick={() => {
                        const next = active
                          ? filters.categorias.filter((c) => c !== cat)
                          : [...filters.categorias, cat];
                        patch({ categorias: next, servicios: [] });
                      }}
                      className={["px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap flex items-center gap-1",
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-border text-muted bg-white hover:border-primary/50",
                      ].join(" ")}>
                      {active && <span className="text-[9px]">✓</span>}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── BLOQUE 2: Datos del evento (4 campos en fila) ── */}
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Datos del evento</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                {/* Ciudad — input con sugerencias */}
                <CityInput value={filters.ciudad} onChange={(v) => patch({ ciudad: v })} />

                {/* Fecha */}
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-muted mb-1.5">
                    <CalendarDays size={10} /> Fecha del evento
                  </label>
                  <input type="date" value={filters.fecha}
                    onChange={(e) => patch({ fecha: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-[var(--radius-input)] text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface" />
                </div>

                {/* Invitados */}
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-muted mb-1.5">
                    <Users size={10} /> Invitados
                  </label>
                  <input type="number" min={1} placeholder="Ej: 120"
                    value={filters.invitados}
                    onChange={(e) => patch({ invitados: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-[var(--radius-input)] text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface" />
                </div>

                {/* Presupuesto */}
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-muted mb-1.5">
                    <Wallet size={10} /> Presupuesto (S/)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input type="number" placeholder="Desde" value={filters.presupuestoMin}
                      onChange={(e) => patch({ presupuestoMin: e.target.value })}
                      className="w-full px-2.5 py-2.5 border border-border rounded-[var(--radius-input)] text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface" />
                    <span className="text-muted text-xs shrink-0">—</span>
                    <input type="number" placeholder="Hasta" value={filters.presupuestoMax}
                      onChange={(e) => patch({ presupuestoMax: e.target.value })}
                      className="w-full px-2.5 py-2.5 border border-border rounded-[var(--radius-input)] text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── BLOQUE 3: Evaluación (secundario, compacto) ── */}
            <div className="px-5 py-3 border-b border-border bg-border/10">
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest shrink-0">Evaluación mínima</p>
                <div className="flex gap-2">
                  {RATING_OPTIONS.map((r) => (
                    <button key={r} onClick={() => patch({ rating: filters.rating === r ? null : r })}
                      className={["flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all",
                        filters.rating === r
                          ? "border-primary bg-primary text-white"
                          : "border-border text-muted bg-white hover:border-primary/50",
                      ].join(" ")}>
                      <Star size={10} className={filters.rating === r ? "fill-white text-white" : "fill-yellow-400 text-yellow-400"} />
                      {r}+
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── BLOQUE 4: Filtros avanzados (colapsable) ── */}
            <div>
              <button onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-muted hover:text-primary hover:bg-border/10 transition-colors">
                <span className="flex items-center gap-1.5">
                  {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  Filtros avanzados
                  <span className="text-[10px] text-muted font-normal">— disponibilidad, forma de pago, servicios incluidos</span>
                </span>
                {(filters.soloDisponibles || filters.formasPago.length > 0 || filters.servicios.length > 0) && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {[filters.soloDisponibles, filters.formasPago.length > 0, filters.servicios.length > 0].filter(Boolean).length}
                  </span>
                )}
              </button>

              {showAdvanced && (
                <div className="px-5 py-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6">

                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Disponibilidad</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filters.soloDisponibles}
                        onChange={(e) => patch({ soloDisponibles: e.target.checked })}
                        className="accent-primary w-4 h-4" />
                      <span className="text-sm text-primary">Solo disponibles para la fecha</span>
                    </label>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Forma de pago</p>
                    <div className="flex flex-col gap-1.5">
                      {PAYMENT_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox"
                            checked={filters.formasPago.includes(opt.value)}
                            onChange={(e) => patch({
                              formasPago: e.target.checked
                                ? [...filters.formasPago, opt.value]
                                : filters.formasPago.filter((v) => v !== opt.value),
                            })}
                            className="accent-primary w-4 h-4" />
                          <span className="text-sm text-primary">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {dynamicServices.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">
                        Servicios incluidos — {filters.categorias[0]}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {dynamicServices.map((s) => (
                          <button key={s}
                            onClick={() => patch({
                              servicios: filters.servicios.includes(s)
                                ? filters.servicios.filter((v) => v !== s)
                                : [...filters.servicios, s],
                            })}
                            className={["px-2.5 py-1 rounded-full text-[10px] font-semibold border-2 transition-all",
                              filters.servicios.includes(s)
                                ? "border-primary bg-primary text-white"
                                : "border-border text-muted bg-white hover:border-primary/50",
                            ].join(" ")}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Sort + results count ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-muted">
            <span className="font-semibold text-primary">{filtered.length}</span> proveedor{filtered.length !== 1 ? "es" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            {filters.categorias.length > 0 && (
              <span className="text-primary"> · {filters.categorias.join(", ")}</span>
            )}
            {activeFilterCount > 0 && (
              <span className="text-muted"> · {activeFilterCount} filtro{activeFilterCount !== 1 ? "s" : ""}</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted shrink-0">Ordenar por</span>
            <select value={filters.ordenarPor} onChange={(e) => patch({ ordenarPor: e.target.value })}
              className="text-xs font-semibold text-primary bg-white border-2 border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Provider grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
          {filtered.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full bg-surface border border-border rounded-[var(--radius-card)] text-center py-16 px-8">
              <p className="text-muted text-sm mb-1">No se encontraron proveedores con estos filtros.</p>
              <button onClick={clearAll} className="text-primary text-sm font-semibold underline hover:no-underline mt-1">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedForComparison.length >= 2 && !showComparison && (
        <ComparisonBar onCompare={() => setShowComparison(true)} />
      )}
      {showComparison && (
        <ComparisonPanel onClose={() => setShowComparison(false)} />
      )}
    </div>
  );
}

function CityInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const suggestions = CITIES.filter(
    (c) => c.toLowerCase().includes(value.toLowerCase()) && c.toLowerCase() !== value.toLowerCase()
  );

  return (
    <div className="relative">
      <label className="flex items-center gap-1 text-[10px] font-semibold text-muted mb-1.5">
        <MapPin size={10} /> Ciudad
      </label>
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Escribe una ciudad..."
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="w-full pl-8 pr-8 py-2.5 border border-border rounded-[var(--radius-input)] text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface"
        />
        {value && (
          <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
            <X size={13} />
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-30 overflow-hidden">
          {suggestions.map((c) => (
            <button key={c} onMouseDown={() => { onChange(c); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors text-left">
              <MapPin size={12} className="text-muted shrink-0" /> {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
