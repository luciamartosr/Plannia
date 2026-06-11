"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEventsStore, StoredEvent } from "@/stores/events";
import { useOnboardingStore } from "@/stores/onboarding";
import { useTaskPlanStore } from "@/stores/taskPlan";
import Header from "@/components/ui/Header";
import { CalendarDays, MapPin, Users, Plus, ArrowRight, Trash2, Sparkles, Calendar } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

const EVENT_META: Record<string, { label: string; icon: string }> = {
  boda:                { label: "Boda",                icon: "💍" },
  cumpleanos_adulto:   { label: "Cumpleaños",          icon: "🎂" },
  cumpleanos_infantil: { label: "Cumpleaños infantil", icon: "🎈" },
  aniversario:         { label: "Aniversario",         icon: "💑" },
  baby_shower:         { label: "Baby Shower",         icon: "🍼" },
  graduacion:          { label: "Graduación",          icon: "🎓" },
  evento_corporativo:  { label: "Corporativo",         icon: "🤝" },
  conferencia:         { label: "Conferencia",         icon: "🎤" },
  seminario:           { label: "Seminario",           icon: "📋" },
  lanzamiento:         { label: "Lanzamiento",         icon: "🚀" },
  feria:               { label: "Feria",               icon: "🏛️" },
  concierto:           { label: "Concierto",           icon: "🎸" },
  otro:                { label: "Evento",              icon: "✨" },
};

export default function MisEventosPage() {
  const router = useRouter();
  const eventsStore = useEventsStore();
  const onboardingStore = useOnboardingStore();
  const taskPlanStore = useTaskPlanStore();

  const { events, activeEventId } = eventsStore;

  function handleNewEvent() {
    eventsStore.clearActive();
    onboardingStore.resetToInitial();
    taskPlanStore.resetAll();
    router.push("/onboarding/nuevo");
  }

  function handleOpenEvent(event: StoredEvent) {
    eventsStore.setActiveEvent(event.id);
    onboardingStore.loadSnapshot(event.onboarding);
    taskPlanStore.loadSnapshot(event.tasks, event.tasksInitialized);
    router.push("/dashboard");
  }

  function handleDeleteEvent(event: StoredEvent) {
    if (!window.confirm("¿Eliminar este evento?")) return;
    eventsStore.deleteEvent(event.id);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Back link */}
        {activeEventId && (
          <Link href="/dashboard" className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-1 w-fit">
            ← Volver al panel
          </Link>
        )}

        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text" style={{ fontFamily: "var(--font-display)" }}>
              Mis eventos
            </h1>
            <p className="text-sm text-muted mt-0.5">
              {events.length === 0
                ? "Aún no tienes eventos"
                : `${events.length} evento${events.length !== 1 ? "s" : ""} creado${events.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={handleNewEvent}
            className="bg-primary text-white font-bold px-5 py-2.5 rounded-[var(--radius-btn)] text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ boxShadow: "0 2px 8px rgba(47,91,46,0.25)" }}
          >
            <Plus size={16} />
            Nuevo evento
          </button>
        </div>

        {/* Empty state */}
        {events.length === 0 && (
          <div
            className="bg-surface border border-border rounded-[var(--radius-card)] p-14 flex flex-col items-center gap-5 text-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div className="text-6xl">📅</div>
            <div>
              <p className="font-bold text-text text-xl" style={{ fontFamily: "var(--font-display)" }}>
                Aún no tienes eventos
              </p>
              <p className="text-sm text-muted mt-2">
                Crea tu primer evento para empezar a planificar tu momento especial.
              </p>
            </div>
            <button
              onClick={handleNewEvent}
              className="bg-primary text-white font-bold px-6 py-3 rounded-[var(--radius-btn)] text-sm flex items-center gap-2 hover:opacity-90 transition-opacity mt-1"
              style={{ boxShadow: "0 2px 8px rgba(47,91,46,0.25)" }}
            >
              <Plus size={16} />
              Crear mi primer evento
            </button>
          </div>
        )}

        {/* Events grid */}
        {events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isActive={event.id === activeEventId}
                onOpen={handleOpenEvent}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EventCard({
  event,
  isActive,
  onOpen,
  onDelete,
}: {
  event: StoredEvent;
  isActive: boolean;
  onOpen: (event: StoredEvent) => void;
  onDelete: (event: StoredEvent) => void;
}) {
  const { onboarding, tasks, tasksInitialized } = event;
  const meta = onboarding.eventType ? EVENT_META[onboarding.eventType] : null;
  const eventTypeLabel = onboarding.eventType === "otro"
    ? (onboarding.eventTypeCustom || "Evento")
    : (meta?.label ?? "Evento");
  const eventIcon = meta?.icon ?? "✨";
  const displayName = onboarding.eventName.trim() || `Mi ${eventTypeLabel.toLowerCase()}`;

  const parsedDate =
    onboarding.eventDate && !onboarding.unknownDate
      ? parseISO(onboarding.eventDate)
      : null;
  const formattedDate = parsedDate
    ? format(parsedDate, "d 'de' MMMM 'de' yyyy", { locale: es })
    : null;
  const daysLeft = parsedDate ? differenceInDays(parsedDate, new Date()) : null;

  const completed = tasks.filter((t) => t.status === "completado").length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div
      className={[
        "bg-surface rounded-[var(--radius-card)] overflow-hidden transition-all duration-300 hover:-translate-y-0.5 flex flex-col",
        isActive ? "border-2 border-primary" : "border border-border",
      ].join(" ")}
      style={{ boxShadow: isActive ? "0 4px 20px rgba(47,91,46,0.12)" : "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            {eventIcon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="inline-block text-[9px] font-bold tracking-widest text-primary bg-primary/8 rounded-full px-2.5 py-0.5 uppercase">
                {eventTypeLabel}
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  Activo
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-text leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {displayName}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(event)}
          className="text-muted hover:text-red-500 transition-colors p-1.5 shrink-0 rounded-lg hover:bg-red-50"
          aria-label="Eliminar evento"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-1 mb-1">
            <CalendarDays size={10} className="text-accent" />
            <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Fecha</p>
          </div>
          <p className="text-xs font-semibold text-text leading-tight">
            {onboarding.unknownDate ? "Por definir" : (formattedDate ?? "—")}
          </p>
          {daysLeft !== null && daysLeft > 0 && (
            <p className="text-[10px] text-muted mt-0.5">{daysLeft} días</p>
          )}
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-1 mb-1">
            <MapPin size={10} className="text-accent" />
            <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Ciudad</p>
          </div>
          <p className="text-xs font-semibold text-text leading-tight">{onboarding.city || "—"}</p>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-1 mb-1">
            <Users size={10} className="text-accent" />
            <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Invitados</p>
          </div>
          <p className="text-xs font-semibold text-text leading-tight">{onboarding.guestCount}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Progreso</p>
          <p className="text-[10px] font-bold text-text">{progress}%</p>
        </div>
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted mt-1.5">
          {completed} de {tasks.length} tareas completadas
          {!tasksInitialized && tasks.length === 0 && " · Sin inicializar"}
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border mt-auto flex items-center justify-between">
        <p className="text-[11px] text-muted">
          {tasksInitialized ? `${tasks.length - completed} pendiente${tasks.length - completed !== 1 ? "s" : ""}` : "Plan no generado"}
        </p>
        <button
          onClick={() => onOpen(event)}
          className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
        >
          Abrir evento <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
