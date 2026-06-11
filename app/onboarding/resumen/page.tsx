"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding";
import { useEventsStore } from "@/stores/events";
import { formatSoles, estimateBudget } from "@/lib/budget";
import EnvelopeIntro from "@/components/EnvelopeIntro";
import {
  generateTaskPlan, STATUS_LABELS, STATUS_COLORS, EventTask, getContractedProvider, taskContractedAmount,
} from "@/lib/taskPlan";
import {
  CalendarDays, MapPin, Users, Clock, Pencil, ArrowRight,
  BarChart2, ShoppingBag, Info, ChevronRight, Building2,
  CheckCircle2, Circle,
} from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { Sparkles } from "lucide-react";
import { useUserStore } from "@/stores/user";
import AuthGateModal from "@/components/AuthGateModal";

const EVENT_META: Record<string, { label: string; icon: string }> = {
  boda:                { label: "Boda",                  icon: "💍" },
  cumpleanos_adulto:   { label: "Cumpleaños",            icon: "🎂" },
  cumpleanos_infantil: { label: "Cumpleaños infantil",   icon: "🎈" },
  aniversario:         { label: "Aniversario",           icon: "💑" },
  baby_shower:         { label: "Baby Shower",           icon: "🍼" },
  graduacion:          { label: "Graduación",            icon: "🎓" },
  evento_corporativo:  { label: "Evento corporativo",    icon: "🤝" },
  conferencia:         { label: "Conferencia",           icon: "🎤" },
  seminario:           { label: "Seminario",             icon: "📋" },
  lanzamiento:         { label: "Lanzamiento",           icon: "🚀" },
  feria:               { label: "Feria",                 icon: "🏛️" },
  concierto:           { label: "Concierto",             icon: "🎸" },
  otro:                { label: "Evento",                icon: "✨" },
};

const PROVIDER_IMAGES = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1487530811015-780ee2e4f4d7?w=200&h=200&fit=crop",
];

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export default function ResumenPage() {
  const router = useRouter();
  const { createEvent, activeEventId, syncOnboarding } = useEventsStore();
  const { data } = useOnboardingStore();
  const session = useUserStore((s) => s.session);
  const [gateContext, setGateContext] = useState<"dashboard" | "checklist" | "proveedores" | null>(null);
  const {
    eventType, eventTypeCustom, eventName, guestCount,
    eventDate, unknownDate, city, isDestinationEvent,
    services, budgetType, budgetDefined,
  } = data;

  const budget = estimateBudget(city, guestCount, services, isDestinationEvent);
  const tasks = generateTaskPlan(services, city, guestCount, isDestinationEvent, budgetDefined ?? null);

  const meta = eventType ? EVENT_META[eventType] : null;
  const eventTypeLabel = eventType === "otro" ? (eventTypeCustom || "Evento") : (meta?.label ?? "Evento");
  const eventIcon = meta?.icon ?? "✨";
  const displayName = eventName.trim() || `Mi ${eventTypeLabel.toLowerCase()}`;

  const parsedDate = eventDate && !unknownDate ? parseISO(eventDate) : null;
  const daysLeft = parsedDate ? differenceInDays(parsedDate, new Date()) : null;
  const formattedDate = parsedDate
    ? format(parsedDate, "d 'de' MMMM 'de' yyyy", { locale: es })
    : null;
  const dayOfWeek = parsedDate ? format(parsedDate, "EEEE", { locale: es }) : null;

  // Budget display logic
  const hasCap = budgetType === "defined" && budgetDefined != null;
  const budgetAvg = budget.min > 0 ? Math.round((budget.min + budget.max) / 2) : null;
  const displayBudget = hasCap ? budgetDefined! : budgetAvg;

  // ── Intro animation ──────────────────────────────────────
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("plannia-show-intro") === "1") {
      sessionStorage.removeItem("plannia-show-intro");
      setShowIntro(true);
    }
  }, []);

  function handleGoToDashboard() {
    if (!session) { setGateContext("dashboard"); return; }
    if (activeEventId) {
      syncOnboarding(activeEventId, data);
    } else {
      createEvent(data);
    }
    router.push("/dashboard");
  }

  function requireAuth(action: "dashboard" | "checklist" | "proveedores") {
    if (!session) { setGateContext(action); return false; }
    return true;
  }

  // Financial summary
  const committed = 0;  // will come from contracted tasks
  const paid = 0;

  return (
    <>
    {/* ── Auth gate modal ── */}
    {gateContext && (
      <AuthGateModal context={gateContext} onClose={() => setGateContext(null)} />
    )}

    {/* ── Envelope intro animation (plays once on first arrival from onboarding) ── */}
    {showIntro && (
      <EnvelopeIntro
        eventIcon={eventIcon}
        eventTypeLabel={eventTypeLabel}
        displayName={displayName}
        formattedDate={formattedDate}
        city={city}
        guestCount={guestCount}
        displayBudget={displayBudget}
        servicesCount={services.length}
        services={services}
        onComplete={() => setShowIntro(false)}
      />
    )}

    <div className="flex flex-col gap-6 pb-10">

      {/* ── Celebration header ── */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/15 rounded-full mb-3">
          <Sparkles size={24} className="text-accent" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>
          ¡Tu evento está listo para brillar!
        </h1>
        <p className="text-muted mt-1.5 text-sm">Hemos creado tu plan inicial. Ahora, hagámoslo inolvidable.</p>
      </div>

      {/* ── 1. Hero Card ── */}
      <div className="bg-white border border-border rounded-[var(--radius-card)] overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl shrink-0">
              {eventIcon}
            </div>
            <div>
              <span className="inline-block text-[10px] font-bold tracking-widest text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-1 uppercase">
                {eventTypeLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-extrabold text-primary leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {displayName}
                </h2>
                <button className="text-muted hover:text-primary transition-colors">
                  <Pencil size={13} />
                </button>
              </div>
            </div>
          </div>
          <button onClick={handleGoToDashboard} className="shrink-0 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors flex items-center gap-1 whitespace-nowrap">
            Gestionar evento <ArrowRight size={12} />
          </button>
        </div>

        {/* Data grid */}
        <div className="grid grid-cols-4 gap-px bg-border border-t border-border">
          <div className="bg-white px-3 py-3">
            <div className="flex items-center gap-1 mb-1"><CalendarDays size={11} className="text-accent" /><p className="text-[9px] font-bold text-muted uppercase tracking-wider">Fecha</p></div>
            <p className="text-xs font-bold text-primary leading-tight">{unknownDate ? "Por definir" : (formattedDate ?? "—")}</p>
            {dayOfWeek && <p className="text-[10px] text-muted mt-0.5">{cap(dayOfWeek)}</p>}
          </div>
          <div className="bg-white px-3 py-3">
            <div className="flex items-center gap-1 mb-1"><MapPin size={11} className="text-accent" /><p className="text-[9px] font-bold text-muted uppercase tracking-wider">Ciudad</p></div>
            <p className="text-xs font-bold text-primary leading-tight">{city || "—"}</p>
            <p className="text-[10px] text-muted mt-0.5">Perú</p>
          </div>
          <div className="bg-white px-3 py-3">
            <div className="flex items-center gap-1 mb-1"><Users size={11} className="text-accent" /><p className="text-[9px] font-bold text-muted uppercase tracking-wider">Invitados</p></div>
            <p className="text-xs font-bold text-primary leading-tight">{guestCount} personas</p>
            <p className="text-[10px] text-muted mt-0.5">Aprox.</p>
          </div>
          <div className="bg-white px-3 py-3">
            <div className="flex items-center gap-1 mb-1"><Clock size={11} className="text-accent" /><p className="text-[9px] font-bold text-muted uppercase tracking-wider">Faltan</p></div>
            <p className="text-xs font-bold text-primary leading-tight">
              {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} días` : "¡Hoy!") : "—"}
            </p>
            {daysLeft !== null && daysLeft > 0 && <p className="text-[10px] text-muted mt-0.5">para tu evento</p>}
          </div>
        </div>

        {/* Budget + Progress */}
        <div className="grid grid-cols-2 gap-px bg-border border-t border-border">
          <div className="bg-white px-4 py-4">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Presupuesto {hasCap ? "máximo" : "estimado"}</p>
              <Info size={10} className="text-muted" />
            </div>
            {displayBudget != null ? (
              <>
                <p className="text-xl font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  {formatSoles(displayBudget)}
                </p>
                {!hasCap && budget.min > 0 && (
                  <p className="text-[10px] text-muted mt-0.5">Rango: {formatSoles(budget.min)} – {formatSoles(budget.max)}</p>
                )}
                {hasCap && budgetAvg != null && (
                  <p className="text-[10px] text-muted mt-0.5">Estimado Plannia: {formatSoles(budget.min)} – {formatSoles(budget.max)}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">Sin servicios</p>
            )}
          </div>
          <div className="bg-white px-4 py-4">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Estado de planificación</p>
            </div>
            <p className="text-xl font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>0% completado</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: "0%" }} />
              </div>
              <p className="text-[10px] text-muted whitespace-nowrap">0 de {tasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Próximo paso ── */}
      <div className="bg-accent/8 border border-accent/25 rounded-[var(--radius-card)] p-4 flex items-start gap-4">
        <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center shrink-0">
          <Building2 size={22} className="text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-0.5">Tu próximo paso recomendado</p>
          <p className="text-base font-bold text-primary leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            Reserva tu local cuanto antes
          </p>
          <p className="text-xs text-muted mt-1 leading-snug">
            Es el primer paso para asegurar la fecha de tu evento y comenzar a planificar con tranquilidad.
          </p>
        </div>
        <Link href="/marketplace" className="shrink-0 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 whitespace-nowrap self-center">
          Explorar locales <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── 3. Pendientes del evento ── */}
      {tasks.length > 0 && (
        <div className="bg-white border border-border rounded-[var(--radius-card)] overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-border">
            <div>
              <p className="text-sm font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                Pendientes del evento
              </p>
              <p className="text-[10px] text-muted mt-0.5">{tasks.length} elementos · 0 completados</p>
            </div>
            <button onClick={() => requireAuth("checklist")} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer p-0">
              Ver todo <ChevronRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-border">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} hasCap={hasCap} onGate={() => requireAuth("checklist")} />
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Resumen financiero ── */}
      {displayBudget != null && (
        <div className="bg-white border border-border rounded-[var(--radius-card)] p-4">
          <p className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>Resumen financiero</p>
          <div className="grid grid-cols-2 gap-3">
            <FinRow label={hasCap ? "Presupuesto máximo" : "Presupuesto estimado"} value={formatSoles(displayBudget)} highlight />
            <FinRow label="Monto comprometido" value={formatSoles(committed)} />
            <FinRow label="Monto pagado" value={formatSoles(paid)} />
            <FinRow label="Pendiente por pagar" value={formatSoles(displayBudget - committed)} muted />
          </div>
        </div>
      )}

      {/* ── 5. Proveedores recomendados ── */}
      <div className="bg-white border border-border rounded-[var(--radius-card)] p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>Proveedores sugeridos</p>
            <p className="text-xs text-muted">
              {tasks.length > 0
                ? `Encontramos proveedores para tus ${tasks.length} pendientes.`
                : "Encontramos 48 proveedores compatibles con tu evento."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!requireAuth("proveedores")) return;
              const params = new URLSearchParams();
              if (services.length) params.set("categorias", services.join(","));
              if (city) params.set("ciudad", city);
              if (budgetDefined) params.set("precioMax", String(budgetDefined));
              params.set("desde", "resumen");
              router.push(`/marketplace?${params.toString()}`);
            }}
            className="shrink-0 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            Explorar proveedores <ArrowRight size={13} />
          </button>
          <div className="flex gap-2 overflow-hidden">
            {PROVIDER_IMAGES.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. Indicadores del evento ── */}
      <div className="bg-white border border-border rounded-[var(--radius-card)] p-4">
        <p className="text-base font-bold text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>Tu evento en Plannia</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "✅", label: "Avance",       value: "0%",               sub: `0 de ${tasks.length} completados` },
            { icon: "🤝", label: "Contratados",  value: "0",                sub: `de ${tasks.length} pendientes` },
            { icon: "💰", label: "Comprometido", value: formatSoles(committed), sub: displayBudget ? `de ${formatSoles(displayBudget)}` : "presupuesto" },
            { icon: "💳", label: "Pagado",        value: formatSoles(paid),  sub: "en total" },
            { icon: "👥", label: "Invitados",     value: "0",                sub: `de ${guestCount} confirmados` },
            { icon: "📋", label: "Proveedores",  value: "0",                sub: "evaluados" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{m.icon} {m.label}</p>
              <p className="text-base font-extrabold text-primary leading-none" style={{ fontFamily: "var(--font-display)" }}>{m.value}</p>
              <p className="text-[10px] text-muted leading-tight">{m.sub}</p>
              <div className="w-full h-1 bg-border rounded-full mt-0.5">
                <div className="h-full bg-accent/40 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <button
        onClick={handleGoToDashboard}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-4 rounded-[var(--radius-btn)] hover:bg-primary/90 transition-all shadow-md text-base"
      >
        Gestionar evento <ArrowRight size={18} />
      </button>

    </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function TaskRow({ task, hasCap, onGate }: { task: EventTask; hasCap: boolean; onGate: () => void }) {
  const isComplete = task.status === "completado";
  return (
    <button onClick={onGate} className="w-full px-4 py-3 flex items-start gap-3 hover:bg-primary/4 transition-colors bg-transparent border-none cursor-pointer text-left">
      {/* Status icon */}
      <div className="mt-0.5 shrink-0">
        {isComplete
          ? <CheckCircle2 size={16} className="text-accent" />
          : <Circle size={16} className="text-border" />}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-primary">{task.icon} {task.name}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>

        {/* Budget */}
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {hasCap && task.budgetAllocated != null ? (
            <span className="text-xs text-muted">
              Asignado: <span className="font-semibold text-secondary">{formatSoles(task.budgetAllocated)}</span>
              <span className="text-muted"> · Estimado Plannia: {formatSoles(task.budgetSuggestedMin)}–{formatSoles(task.budgetSuggestedMax)}</span>
            </span>
          ) : (
            <span className="text-xs text-muted">
              Rango estimado: <span className="font-semibold text-secondary">{formatSoles(task.budgetSuggestedMin)} – {formatSoles(task.budgetSuggestedMax)}</span>
            </span>
          )}
        </div>

        {/* Provider */}
        <p className="text-[10px] text-muted mt-1">
          {(() => { const cp = getContractedProvider(task); return cp ? <><span className="font-semibold text-primary">{cp.name}</span> · Contratado</> : "Sin proveedor seleccionado"; })()}
        </p>
      </div>

      <ChevronRight size={14} className="text-muted shrink-0 mt-1" />
    </button>
  );
}

function FinRow({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-primary" : muted ? "text-muted" : "text-secondary"}`}
        style={highlight ? { fontFamily: "var(--font-display)" } : {}}>
        {value}
      </p>
    </div>
  );
}
