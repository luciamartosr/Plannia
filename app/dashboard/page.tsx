"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays, MapPin, Users, Clock, ArrowRight, ChevronRight,
  BarChart2, CreditCard, BadgeCheck, CheckCircle2, Circle,
  Bell, Info, Pencil, Building2, Star, X, TrendingUp,
  ShoppingBag, AlertCircle,
} from "lucide-react";
import Header from "@/components/ui/Header";
import { formatSoles, estimateBudget } from "@/lib/budget";
import { useOnboardingStore } from "@/stores/onboarding";
import { useTaskPlanStore } from "@/stores/taskPlan";
import { useGuestStore, Guest } from "@/stores/guests";
import {
  EventTask, TaskProvider, STATUS_LABELS, STATUS_COLORS,
  getContractedProvider,
} from "@/lib/taskPlan";
import { differenceInDays, parseISO, format, isPast } from "date-fns";
import { es } from "date-fns/locale";

// ─── Event metadata ──────────────────────────────────────────
const EVENT_META: Record<string, { label: string; icon: string }> = {
  boda:                { label: "Boda",                icon: "💍" },
  cumpleanos_adulto:   { label: "Cumpleaños",          icon: "🎂" },
  cumpleanos_infantil: { label: "Cumpleaños infantil", icon: "🎈" },
  aniversario:         { label: "Aniversario",         icon: "💑" },
  baby_shower:         { label: "Baby Shower",         icon: "🍼" },
  graduacion:          { label: "Graduación",          icon: "🎓" },
  evento_corporativo:  { label: "Evento corporativo",  icon: "🤝" },
  conferencia:         { label: "Conferencia",         icon: "🎤" },
  seminario:           { label: "Seminario",           icon: "📋" },
  lanzamiento:         { label: "Lanzamiento",         icon: "🚀" },
  feria:               { label: "Feria",               icon: "🏛️" },
  concierto:           { label: "Concierto",           icon: "🎸" },
  otro:                { label: "Evento",              icon: "✨" },
};

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

interface UpcomingPayment {
  id: string; providerName: string; taskName: string;
  type: "adelanto" | "saldo" | "pendiente";
  amount: number | null; date: Date; paid: boolean;
}

// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data } = useOnboardingStore();
  const { tasks, initTasks } = useTaskPlanStore();
  const { guests } = useGuestStore();
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  const {
    eventName, eventType, eventTypeCustom, eventDate, unknownDate,
    city, guestCount, budgetType, budgetDefined, services, isDestinationEvent,
  } = data;

  useEffect(() => {
    initTasks(services, city, guestCount, isDestinationEvent, budgetDefined ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Event metadata ──
  const meta = eventType ? EVENT_META[eventType] : null;
  const eventTypeLabel = eventType === "otro" ? (eventTypeCustom || "Evento") : (meta?.label ?? "Evento");
  const eventIcon = meta?.icon ?? "✨";
  const displayName = eventName?.trim() || `Mi ${eventTypeLabel.toLowerCase()}`;

  const parsedDate = eventDate && !unknownDate ? parseISO(eventDate) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysLeft = parsedDate ? differenceInDays(parsedDate, today) : null;
  const formattedDate = parsedDate ? format(parsedDate, "d 'de' MMMM 'de' yyyy", { locale: es }) : null;
  const dayOfWeek = parsedDate ? format(parsedDate, "EEEE", { locale: es }) : null;

  // ── Budget ──
  const budget = estimateBudget(city, guestCount, services, isDestinationEvent);
  const hasCap = budgetType === "defined" && budgetDefined != null;
  const budgetAvg = budget.min > 0 ? Math.round((budget.min + budget.max) / 2) : null;
  const displayBudget = hasCap ? budgetDefined! : budgetAvg;

  // ── KPIs ──
  const completedCount = tasks.filter((t) => t.status === "completado").length;
  const contractedCount = tasks.filter((t) => t.status === "contratado").length;
  const checklistPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const committed = tasks.reduce((acc, t) => {
    const cp = t.providers.find((p) => p.state === "contracted");
    return acc + (cp?.contractedPrice ?? 0);
  }, 0);

  const paid = tasks.reduce((acc, t) =>
    acc + t.providers.filter((p) => p.state === "contracted").reduce((a, p) => {
      let s = 0;
      if (p.adelantoPaid && p.adelanto) s += p.adelanto;
      if (p.finalPaymentPaid && p.finalPayment) s += p.finalPayment;
      return a + s;
    }, 0), 0);

  const confirmedGuests = guests.filter((g) => g.rsvp === "confirmado");
  const confirmedCount = confirmedGuests.reduce((a, g) => a + 1 + g.companions.length, 0);
  const allProviders = tasks.flatMap((t) => t.providers);
  const evaluatedProviders = allProviders.filter((p) => p.state !== "suggested").length;
  const budgetPct = displayBudget && displayBudget > 0 ? Math.min(100, Math.round((committed / displayBudget) * 100)) : 0;

  // ── Priority task ──
  const priorityTaskId = useMemo(() => {
    const localTask = tasks.find((t) => t.service === "locales_espacios" && t.status !== "completado");
    if (localTask) return localTask.id;
    return tasks.find((t) => t.status !== "completado")?.id ?? null;
  }, [tasks]);

  // ── Reminders ──
  const allReminders = useMemo(() => {
    const list: { id: string; description: string; date: string | null; done: boolean; taskName: string; taskIcon: string }[] = [];
    tasks.forEach((t) => {
      t.reminders.forEach((r) => {
        list.push({ ...r, taskName: t.name, taskIcon: t.icon });
      });
    });
    return list
      .filter((r) => !r.done)
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      });
  }, [tasks]);

  // ── Upcoming payments ──
  const upcomingPayments = useMemo<UpcomingPayment[]>(() => {
    const list: UpcomingPayment[] = [];
    tasks.forEach((t) => {
      t.providers.filter((p) => p.state === "contracted").forEach((p) => {
        if (p.adelantoDate)       list.push({ id: `${p.id}-a`, providerName: p.name, taskName: t.name, type: "adelanto",   amount: p.adelanto,      date: parseISO(p.adelantoDate),       paid: p.adelantoPaid });
        if (p.finalPaymentDate)   list.push({ id: `${p.id}-f`, providerName: p.name, taskName: t.name, type: "saldo",      amount: p.finalPayment,  date: parseISO(p.finalPaymentDate),   paid: p.finalPaymentPaid });
        if (p.pendingPaymentDate) list.push({ id: `${p.id}-p`, providerName: p.name, taskName: t.name, type: "pendiente", amount: null,            date: parseISO(p.pendingPaymentDate), paid: false });
      });
    });
    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks]);

  // ── Provider tabs ──
  const contractedProviders = tasks.flatMap((t) =>
    t.providers.filter((p) => p.state === "contracted").map((p) => ({ ...p, taskName: t.name, taskIcon: t.icon }))
  );
  const suggestedProviders = tasks.flatMap((t) =>
    t.providers.filter((p) => p.state !== "contracted").map((p) => ({ ...p, taskName: t.name, taskIcon: t.icon }))
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8">

        {/* Back link */}
        <Link href="/onboarding/resumen" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors mb-7">
          ← Volver al resumen
        </Link>

        {/* ─────────────── 2-COLUMN LAYOUT ─────────────── */}
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ══════════ LEFT COLUMN ══════════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* ── 1. Hero card — forest green ── */}
            <div
              className="rounded-[var(--radius-card)] overflow-hidden"
              style={{ background: "var(--color-primary)", boxShadow: "0 8px 32px rgba(47,91,46,0.25)" }}
            >
              {/* Top section */}
              <div className="px-7 pt-7 pb-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Event type label */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{eventIcon}</span>
                    <span
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color: "rgba(248,245,238,0.65)" }}
                    >
                      {eventTypeLabel}
                    </span>
                    <Link href="/onboarding/nombre" style={{ color: "rgba(248,245,238,0.5)" }} className="hover:opacity-100 transition-opacity ml-1">
                      <Pencil size={12} />
                    </Link>
                  </div>
                  {/* Event name — Playfair Display */}
                  <h1
                    className="text-3xl md:text-4xl font-bold leading-tight mb-1"
                    style={{ fontFamily: "var(--font-display)", color: "#F8F5EE" }}
                  >
                    {displayName}
                  </h1>
                  {/* Date + city */}
                  {(formattedDate || city) && (
                    <p className="text-sm mt-2" style={{ color: "rgba(248,245,238,0.75)" }}>
                      {formattedDate && dayOfWeek ? `${cap(dayOfWeek)}, ${formattedDate}` : formattedDate || ""}
                      {formattedDate && city ? " · " : ""}
                      {city}
                    </p>
                  )}
                </div>

                {/* Countdown badge */}
                {daysLeft !== null && (
                  <div
                    className="shrink-0 flex flex-col items-center justify-center rounded-2xl px-5 py-4 min-w-[88px] text-center"
                    style={{ background: "rgba(248,245,238,0.12)", backdropFilter: "blur(8px)" }}
                  >
                    {daysLeft < 0 ? (
                      <>
                        <span className="text-2xl">🎉</span>
                        <p className="text-[11px] font-semibold mt-1" style={{ color: "rgba(248,245,238,0.8)" }}>Ocurrió</p>
                      </>
                    ) : daysLeft === 0 ? (
                      <>
                        <span className="text-2xl">🎊</span>
                        <p className="text-[11px] font-bold mt-1" style={{ color: "#F8F5EE" }}>¡Hoy!</p>
                      </>
                    ) : (
                      <>
                        <p className="text-4xl font-extrabold leading-none" style={{ color: "#F8F5EE", fontFamily: "var(--font-body)" }}>
                          {daysLeft}
                        </p>
                        <p className="text-[11px] font-semibold mt-1" style={{ color: "rgba(248,245,238,0.7)" }}>
                          {daysLeft === 1 ? "día" : "días"}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Stats grid */}
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-px"
                style={{ background: "rgba(248,245,238,0.12)" }}
              >
                {[
                  { icon: <CalendarDays size={12} />, label: "Fecha", value: unknownDate ? "Por definir" : (formattedDate ?? "—"), sub: dayOfWeek ? cap(dayOfWeek) : undefined },
                  { icon: <MapPin size={12} />, label: "Ciudad", value: city || "—", sub: "Perú" },
                  { icon: <Users size={12} />, label: "Invitados", value: `${guestCount}`, sub: "personas" },
                  {
                    icon: <BarChart2 size={12} />,
                    label: hasCap ? "Presupuesto máximo" : "Presupuesto estimado",
                    value: displayBudget != null ? formatSoles(displayBudget) : "—",
                    sub: !hasCap && budget.min > 0 ? `${formatSoles(budget.min)}–${formatSoles(budget.max)}` : undefined,
                  },
                ].map((cell) => (
                  <div key={cell.label} className="px-5 py-4" style={{ background: "rgba(0,0,0,0.12)" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span style={{ color: "rgba(248,245,238,0.5)" }}>{cell.icon}</span>
                      <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "rgba(248,245,238,0.55)" }}>
                        {cell.label}
                      </p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: "#F8F5EE" }}>{cell.value}</p>
                    {cell.sub && (
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(248,245,238,0.55)" }}>{cell.sub}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress footer */}
              <div className="px-7 py-5" style={{ background: "rgba(0,0,0,0.08)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: "rgba(248,245,238,0.8)" }}>
                    Avance de planificación
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#F8F5EE" }}>
                    {checklistPct}%
                  </p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(248,245,238,0.2)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${checklistPct}%`, background: "#8A9A3A" }}
                  />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: "rgba(248,245,238,0.5)" }}>
                  {completedCount} de {tasks.length} pendientes completados
                </p>
              </div>
            </div>

            {/* ── 2. KPI strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Contratados",
                  value: contractedCount,
                  sub: `de ${tasks.length} servicios`,
                  icon: <BadgeCheck size={18} />,
                  iconBg: "bg-primary/8",
                  iconColor: "text-primary",
                },
                {
                  label: "Evaluados",
                  value: evaluatedProviders,
                  sub: "proveedores",
                  icon: <Star size={18} />,
                  iconBg: "bg-primary/8",
                  iconColor: "text-primary",
                },
                {
                  label: "Comprometido",
                  value: `${budgetPct}%`,
                  sub: formatSoles(committed),
                  icon: <BarChart2 size={18} />,
                  iconBg: "bg-secondary/10",
                  iconColor: "text-secondary",
                },
                {
                  label: "Confirmados",
                  value: guests.length > 0 ? confirmedCount : "—",
                  sub: "invitados",
                  icon: <Users size={18} />,
                  iconBg: "bg-primary/8",
                  iconColor: "text-primary",
                },
              ].map((k) => (
                <div
                  key={k.label}
                  className="bg-surface border border-border rounded-[var(--radius-card)] px-5 py-5 flex items-center gap-4"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <div className={`w-10 h-10 rounded-2xl ${k.iconBg} ${k.iconColor} flex items-center justify-center shrink-0`}>
                    {k.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold text-text leading-none">
                      {k.value}
                    </p>
                    <p className="text-[10px] text-muted mt-1 truncate">{k.sub}</p>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mt-0.5">{k.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── 3. Acción recomendada ── */}
            {tasks.find((t) => t.service === "locales_espacios" && t.status !== "completado" && t.status !== "contratado") && (
              <div
                className="rounded-[var(--radius-card)] p-5 flex items-center gap-5"
                style={{ background: "rgba(138,154,58,0.08)", border: "1px solid rgba(138,154,58,0.2)" }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(138,154,58,0.15)" }}>
                  <Building2 size={22} className="text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">
                    Acción recomendada por Plannia
                  </p>
                  <p className="text-sm font-semibold text-text leading-snug">
                    Reserva tu local cuanto antes
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Es el primer paso para asegurar la fecha y comenzar a planificar.
                  </p>
                </div>
                <Link
                  href="/marketplace?categoria=locales"
                  className="shrink-0 bg-primary text-white text-xs font-bold px-5 py-3 rounded-[var(--radius-btn)] hover:bg-primary-light transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  style={{ boxShadow: "0 2px 8px rgba(47,91,46,0.3)" }}
                >
                  Explorar locales <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* ── 4. Pendientes ── */}
            <div
              className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-border">
                <div>
                  <p className="text-sm font-bold text-text">
                    Pendientes del evento
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {completedCount} de {tasks.length} completados
                  </p>
                </div>
                <Link href="/dashboard/checklist" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                  Ver todo <ChevronRight size={12} />
                </Link>
              </div>
              {tasks.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Circle size={32} className="text-border mx-auto mb-3" />
                  <p className="text-sm text-muted">Completa el onboarding para ver tus pendientes.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tasks.map((task) => (
                    <TaskRow key={task.id} task={task} hasCap={hasCap} isPriority={task.id === priorityTaskId} />
                  ))}
                </div>
              )}
            </div>

            {/* ── 5. Recordatorios ── */}
            <div
              className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bell size={15} className="text-accent" />
                  <p className="text-sm font-bold text-text">Recordatorios</p>
                </div>
                <Link href="/dashboard/checklist" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Gestionar <ChevronRight size={12} />
                </Link>
              </div>
              {allReminders.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Bell size={28} className="text-border mx-auto mb-3" />
                  <p className="text-sm text-muted">Sin recordatorios activos.</p>
                  <p className="text-xs text-muted mt-1">Agrégalos desde el detalle de cada pendiente.</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-border">
                  {allReminders.map((r) => {
                    const d = r.date ? parseISO(r.date) : null;
                    const isLate = d ? isPast(d) : false;
                    const daysUntil = d ? differenceInDays(d, today) : null;
                    return (
                      <div key={r.id} className="flex items-start gap-3 px-6 py-3.5">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${isLate ? "bg-red-400" : daysUntil !== null && daysUntil <= 7 ? "bg-yellow-400" : "bg-accent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text leading-snug">{r.description}</p>
                          <p className="text-[10px] text-muted mt-0.5">
                            {r.taskIcon} {r.taskName}
                            {d && (
                              <span className={`ml-2 font-semibold ${isLate ? "text-red-500" : daysUntil !== null && daysUntil <= 7 ? "text-yellow-600" : "text-muted"}`}>
                                · {isLate ? `Venció ${format(d, "d MMM", { locale: es })}` : daysUntil === 0 ? "Hoy" : daysUntil === 1 ? "Mañana" : format(d, "d MMM", { locale: es })}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── 6. Invitados ── */}
            <GuestsCard guests={guests} guestCount={guestCount} />
          </div>

          {/* ══════════ RIGHT COLUMN ══════════ */}
          <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6">

            {/* ── Próximos pagos ── */}
            <div
              className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="px-5 pt-5 pb-4 border-b border-border flex items-center gap-2.5">
                <CreditCard size={15} className="text-accent" />
                <p className="text-sm font-bold text-text">Próximos pagos</p>
              </div>
              {upcomingPayments.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <CreditCard size={28} className="text-border mx-auto mb-3" />
                  <p className="text-xs text-muted">Sin pagos programados aún.</p>
                  <p className="text-xs text-muted mt-1">Se mostrarán al contratar un proveedor y registrar fechas de pago.</p>
                </div>
              ) : (
                <div className="divide-y divide-border max-h-72 overflow-y-auto">
                  {upcomingPayments.slice(0, 6).map((pmt) => {
                    const diffs = differenceInDays(pmt.date, today);
                    const isOverdue = !pmt.paid && isPast(pmt.date);
                    const isSoon   = !pmt.paid && !isOverdue && diffs <= 7;
                    return (
                      <div key={pmt.id} className={["flex items-center justify-between gap-3 px-5 py-3.5",
                        pmt.paid ? "opacity-60" : "",
                      ].join(" ")}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0">
                            {pmt.paid ? "✅" : isOverdue ? "🔴" : isSoon ? "🟡" : "🔵"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-text truncate">{pmt.providerName}</p>
                            <p className="text-[10px] text-muted">
                              {pmt.type === "adelanto" ? "Adelanto" : pmt.type === "saldo" ? "Saldo final" : "Pago pendiente"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {pmt.amount != null && (
                            <p className="text-xs font-bold text-text">{formatSoles(pmt.amount)}</p>
                          )}
                          <p className={`text-[10px] font-semibold ${isOverdue ? "text-red-500" : isSoon ? "text-yellow-600" : "text-muted"}`}>
                            {pmt.paid ? "Pagado"
                              : isOverdue ? "Vencido"
                              : diffs === 0 ? "Hoy"
                              : diffs === 1 ? "Mañana"
                              : format(pmt.date, "d MMM", { locale: es })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Resumen financiero ── */}
            {displayBudget != null && (
              <div
                className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <div className="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BarChart2 size={15} className="text-accent" />
                    <p className="text-sm font-bold text-text">Resumen financiero</p>
                  </div>
                  <button
                    onClick={() => setBudgetModalOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Ver detalle <ChevronRight size={12} />
                  </button>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  {[
                    { label: hasCap ? "Presupuesto máximo" : "Presupuesto estimado", value: formatSoles(displayBudget), emphasis: true },
                    { label: "Comprometido", value: formatSoles(committed) },
                    { label: "Pagado", value: formatSoles(paid) },
                    { label: "Por ejecutar", value: formatSoles(Math.max(0, displayBudget - committed)), muted: true },
                  ].map((row) => (
                    <div key={row.label} className="flex flex-col gap-1">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-wider">{row.label}</p>
                      <p className={`text-sm font-bold ${row.emphasis ? "text-primary" : row.muted ? "text-muted" : "text-secondary"}`}>
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? "#ef4444" : "var(--color-accent)" }}
                    />
                  </div>
                  <p className="text-[10px] text-muted mt-1.5">{budgetPct}% del presupuesto comprometido</p>
                </div>
              </div>
            )}

            {/* ── Proveedores ── */}
            <ProvidersCard contractedProviders={contractedProviders} suggestedProviders={suggestedProviders} tasks={tasks} services={services} city={city} budgetDefined={budgetDefined} />
          </div>
        </div>
      </div>

      {/* ── Budget detail modal ── */}
      {budgetModalOpen && (
        <BudgetDetailModal
          tasks={tasks}
          displayBudget={hasCap ? budgetDefined! : null}
          hasCap={hasCap}
          budgetMin={budget.min}
          budgetMax={budget.max}
          onClose={() => setBudgetModalOpen(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Task row
// ─────────────────────────────────────────────────────────────
function TaskRow({ task, hasCap, isPriority }: { task: EventTask; hasCap: boolean; isPriority: boolean }) {
  const isComplete = task.status === "completado";
  const cp = getContractedProvider(task);

  return (
    <Link href={`/dashboard/checklist?taskId=${task.id}`}
      className="px-6 py-3.5 flex items-start gap-3 hover:bg-primary/3 transition-colors">
      <div className="mt-0.5 shrink-0">
        {isComplete
          ? <CheckCircle2 size={15} className="text-accent" />
          : <Circle size={15} className="text-border" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-text">{task.icon} {task.name}</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
          {isPriority && !isComplete && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
              ★ Prioritaria
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {hasCap && task.budgetAllocated != null ? (
            <p className="text-[10px] text-muted">
              Asignado: <span className="font-semibold text-secondary">{formatSoles(task.budgetAllocated)}</span>
            </p>
          ) : (
            <p className="text-[10px] text-muted">
              {formatSoles(task.budgetSuggestedMin)} – {formatSoles(task.budgetSuggestedMax)}
            </p>
          )}
          {cp && <p className="text-[10px] text-secondary font-semibold truncate">· {cp.name}</p>}
        </div>
      </div>
      <ChevronRight size={13} className="text-muted shrink-0 mt-1" />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Providers card with tabs
// ─────────────────────────────────────────────────────────────
function ProvidersCard({
  contractedProviders, suggestedProviders, tasks,
  services, city, budgetDefined,
}: {
  contractedProviders: (TaskProvider & { taskName: string; taskIcon: string })[];
  suggestedProviders: (TaskProvider & { taskName: string; taskIcon: string })[];
  tasks: EventTask[];
  services: string[];
  city: string;
  budgetDefined: number | null | undefined;
}) {
  const [tab, setTab] = useState<"contratados" | "sugeridos">("contratados");
  const list = tab === "contratados" ? contractedProviders : suggestedProviders;

  return (
    <div
      className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="px-5 pt-5 pb-4 border-b border-border flex items-center gap-2.5">
        <ShoppingBag size={15} className="text-accent" />
        <p className="text-sm font-bold text-text">Proveedores</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["contratados", "sugeridos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={["flex-1 py-3 text-xs font-bold transition-colors border-b-2",
              tab === t
                ? "border-primary text-primary bg-primary/4"
                : "border-transparent text-muted hover:text-primary hover:bg-primary/3",
            ].join(" ")}>
            {t === "contratados" ? "Contratados" : "Sugeridos"}
            <span className={["ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold",
              tab === t ? "bg-primary text-white" : "bg-border text-muted",
            ].join(" ")}>
              {(t === "contratados" ? contractedProviders : suggestedProviders).length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <ShoppingBag size={28} className="text-border mx-auto mb-3" />
          {tab === "contratados" ? (
            <>
              <p className="text-sm text-muted">Ningún proveedor contratado aún.</p>
              <Link href="/marketplace" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-[var(--radius-btn)] hover:bg-primary/5 transition-colors">
                Explorar marketplace <ArrowRight size={11} />
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Sin proveedores evaluados aún.</p>
              <Link href="/dashboard/checklist" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-[var(--radius-btn)] hover:bg-primary/5 transition-colors">
                Ir a pendientes <ArrowRight size={11} />
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border max-h-72 overflow-y-auto">
          {list.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0">{p.taskIcon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{p.name}</p>
                  <p className="text-[10px] text-muted truncate">{p.taskName}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {tab === "contratados" && p.contractedPrice != null && (
                  <p className="text-xs font-bold text-secondary">{formatSoles(p.contractedPrice)}</p>
                )}
                {tab === "sugeridos" && p.quotedPrice != null && (
                  <p className="text-xs font-bold text-text">{formatSoles(p.quotedPrice)}</p>
                )}
                {tab === "sugeridos" && p.quotedPrice == null && p.priceEstMin > 0 && (
                  <p className="text-[10px] text-muted">{formatSoles(p.priceEstMin)}+</p>
                )}
                <span className={["text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                  p.state === "contracted" ? "bg-accent/15 text-secondary"
                  : p.state === "quoted" ? "bg-primary/10 text-primary"
                  : "bg-border text-muted",
                ].join(" ")}>
                  {p.state === "contracted" ? "Contratado" : p.state === "quoted" ? "Cotizado" : "Sugerido"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3.5 border-t border-border">
        <Link
          href={(() => {
            const params = new URLSearchParams();
            if (services.length) params.set("categorias", services.join(","));
            if (city) params.set("ciudad", city);
            if (budgetDefined) params.set("precioMax", String(budgetDefined));
            params.set("desde", "dashboard");
            return `/marketplace?${params.toString()}`;
          })()}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 py-2.5 rounded-[var(--radius-btn)] hover:bg-primary/5 transition-colors">
          Ver detalle de proveedores <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Guests card
// ─────────────────────────────────────────────────────────────
function GuestsCard({ guests, guestCount }: { guests: Guest[]; guestCount: number }) {
  const totalWithCompanions = guests.reduce((a, g) => a + 1 + g.companions.length, 0);
  const confirmed  = guests.filter((g) => g.rsvp === "confirmado").reduce((a, g) => a + 1 + g.companions.length, 0);
  const noAsiste   = guests.filter((g) => g.rsvp === "no_asiste").reduce((a, g) => a + 1 + g.companions.length, 0);
  const pendiente  = totalWithCompanions - confirmed - noAsiste;
  const confirmedPct = totalWithCompanions > 0 ? Math.round((confirmed / totalWithCompanions) * 100) : 0;

  return (
    <div
      className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Users size={15} className="text-accent" />
          <p className="text-sm font-bold text-text">Invitados</p>
        </div>
        <Link href="/dashboard/invitados" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          Gestionar lista <ChevronRight size={12} />
        </Link>
      </div>

      {guests.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <Users size={28} className="text-border mx-auto mb-3" />
          <p className="text-sm text-muted">Aún no tienes invitados registrados.</p>
          <p className="text-xs text-muted mt-1">Tu estimado actual: <span className="font-semibold text-text">{guestCount} personas</span></p>
          <Link href="/dashboard/invitados"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-[var(--radius-btn)] hover:bg-primary/5 transition-colors">
            <Users size={11} /> Agregar invitados <ArrowRight size={11} />
          </Link>
        </div>
      ) : (
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Total", value: totalWithCompanions, color: "text-text" },
              { label: "Confirmados", value: confirmed, color: "text-secondary" },
              { label: "Pendientes", value: pendiente, color: "text-muted" },
            ].map((s) => (
              <div key={s.label} className="bg-background rounded-2xl py-3">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted mb-1.5">
              <span>RSVP confirmados</span>
              <span className="font-semibold text-secondary">{confirmedPct}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${confirmedPct}%` }} />
            </div>
          </div>
          {noAsiste > 0 && (
            <p className="text-xs text-muted text-center">
              {noAsiste} {noAsiste === 1 ? "persona no asiste" : "personas no asisten"}
            </p>
          )}
          {confirmed > 0 && totalWithCompanions > 0 && confirmedPct < 50 && (
            <div className="bg-warning rounded-xl px-4 py-3">
              <p className="text-xs text-warning-text">
                💡 Menos del 50% confirmado. Considera enviar recordatorio a los invitados pendientes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Budget detail modal
// ─────────────────────────────────────────────────────────────
function BudgetDetailModal({ tasks, displayBudget, hasCap, budgetMin, budgetMax, onClose }: {
  tasks: EventTask[];
  displayBudget: number | null;
  hasCap: boolean;
  budgetMin: number;
  budgetMax: number;
  onClose: () => void;
}) {
  const rows = tasks.map((t) => {
    const cp = t.providers.find((p) => p.state === "contracted");
    const contracted = cp?.contractedPrice ?? 0;
    const paidAmt = cp
      ? (cp.adelantoPaid ? (cp.adelanto ?? 0) : 0) + (cp.finalPaymentPaid ? (cp.finalPayment ?? 0) : 0)
      : 0;
    const allocated = hasCap
      ? (t.budgetAllocated ?? Math.round((t.budgetSuggestedMin + t.budgetSuggestedMax) / 2))
      : null;
    const barReference = contracted > 0 ? contracted : (allocated ?? t.budgetSuggestedMax);
    const paidPct = contracted > 0 && paidAmt > 0
      ? Math.min(100, Math.round((paidAmt / contracted) * 100))
      : 0;
    const budgetRef = allocated ?? t.budgetSuggestedMax;
    const overBudget = contracted > 0 && budgetRef > 0 && contracted > budgetRef;
    return { task: t, contracted, paidAmt, allocated, barReference, paidPct, overBudget };
  });

  const totalContracted = rows.reduce((a, r) => a + r.contracted, 0);
  const totalPaid       = rows.reduce((a, r) => a + r.paidAmt, 0);
  const globalPct = hasCap && displayBudget
    ? Math.min(100, Math.round((totalContracted / displayBudget) * 100))
    : 0;
  const disponible = hasCap && displayBudget ? displayBudget - totalContracted : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-surface rounded-[var(--radius-card)] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
            <div>
              <h2 className="font-bold text-text">Ejecución del presupuesto</h2>
              <p className="text-xs text-muted mt-0.5">
                {hasCap
                  ? "Plannia distribuyó tu presupuesto entre las categorías."
                  : "Montos de referencia según tipo de evento y proveedores contratados."}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors shrink-0 ml-3">
              <X size={18} />
            </button>
          </div>

          {/* KPI chips */}
          <div className="px-6 pt-5 pb-4 border-b border-border shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-bold text-muted uppercase tracking-wider">
                  {hasCap ? "Presupuesto" : "Costo estimado"}
                </p>
                {hasCap ? (
                  <p className="text-base font-extrabold text-primary">{formatSoles(displayBudget!)}</p>
                ) : (
                  <p className="text-sm font-extrabold text-primary leading-tight">
                    {formatSoles(budgetMin)}<span className="text-muted font-normal text-xs"> – </span>{formatSoles(budgetMax)}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Contratado</p>
                <p className="text-base font-extrabold text-secondary">{formatSoles(totalContracted)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Pagado</p>
                <p className="text-base font-extrabold text-secondary">{formatSoles(totalPaid)}</p>
              </div>
              {hasCap && disponible !== null && (
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Disponible</p>
                  <p className={`text-base font-extrabold ${disponible < 0 ? "text-red-500" : "text-primary"}`}>
                    {formatSoles(Math.abs(disponible))}{disponible < 0 ? " sobre" : ""}
                  </p>
                </div>
              )}
            </div>
            {hasCap && displayBudget && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-muted mb-1.5">
                  <span className="font-semibold text-text">Presupuesto utilizado</span>
                  <span className={`font-bold ${globalPct >= 100 ? "text-red-500" : "text-secondary"}`}>{globalPct}%</span>
                </div>
                <div className="h-2.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={["h-full rounded-full transition-all", globalPct >= 100 ? "bg-red-400" : "bg-accent"].join(" ")}
                    style={{ width: `${Math.min(100, globalPct)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted mt-1">
                  {formatSoles(totalContracted)} contratados de {formatSoles(displayBudget)}
                </p>
              </div>
            )}
          </div>

          {/* Category rows */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
            {rows.map(({ task, contracted, paidAmt, allocated, paidPct, overBudget }) => {
              const notContracted = contracted === 0;
              return (
                <div key={task.id}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{task.icon}</span>
                      <p className="text-xs font-semibold text-text truncate">{task.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {notContracted ? (
                        <p className="text-[10px] text-muted italic">Sin proveedor</p>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-secondary">{formatSoles(contracted)}</p>
                          {paidAmt > 0 && (
                            <p className="text-[9px] text-muted">Pagado: {formatSoles(paidAmt)}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-muted mb-1.5">
                    {notContracted ? (
                      hasCap && allocated != null
                        ? <span>Asignado: <span className="font-semibold text-text">{formatSoles(allocated)}</span></span>
                        : <span>Estimado: <span className="font-semibold text-text">{formatSoles(task.budgetSuggestedMin)} – {formatSoles(task.budgetSuggestedMax)}</span></span>
                    ) : (
                      hasCap && allocated != null
                        ? <span>Contratado: <span className="font-semibold text-text">{formatSoles(contracted)}</span> · Asignado: {formatSoles(allocated)}</span>
                        : <span>Contratado: <span className="font-semibold text-text">{formatSoles(contracted)}</span> · Est: {formatSoles(task.budgetSuggestedMin)}–{formatSoles(task.budgetSuggestedMax)}</span>
                    )}
                    {!notContracted && (
                      <span className={`font-bold ${paidPct >= 100 ? "text-secondary" : overBudget ? "text-red-500" : "text-muted"}`}>
                        {paidPct}% pagado
                      </span>
                    )}
                  </div>
                  <div className="h-2.5 bg-border rounded-full overflow-hidden">
                    {!notContracted && (
                      <div
                        className={["h-full rounded-full transition-all",
                          paidPct >= 100 ? "bg-secondary" : overBudget ? "bg-red-400" : "bg-accent",
                        ].join(" ")}
                        style={{ width: `${paidPct}%` }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {!notContracted && paidPct < 100 && (
                      <p className="text-[9px] text-muted">
                        Pendiente: <span className="font-semibold text-text">{formatSoles(contracted - paidAmt)}</span>
                      </p>
                    )}
                    {!notContracted && paidPct >= 100 && (
                      <p className="text-[9px] font-semibold text-secondary">✓ Pagado al 100%</p>
                    )}
                    {overBudget && (
                      <p className="text-[9px] font-bold text-red-500 flex items-center gap-1 ml-auto">
                        <AlertCircle size={9} />
                        {hasCap ? "⚠ Excede presupuesto asignado" : "⚠ Por encima del estimado"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent/70 inline-block shrink-0" />
            <p className="text-[10px] text-muted">Contratado</p>
            <span className="w-2 h-2 rounded-full bg-secondary/80 inline-block shrink-0 ml-3" />
            <p className="text-[10px] text-muted">Pagado</p>
          </div>
        </div>
      </div>
    </>
  );
}
