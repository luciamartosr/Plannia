"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, ExternalLink, Trash2, CalendarDays,
  StickyNote, CreditCard, ChevronRight, ChevronDown, ChevronUp,
  Store, Star, Sparkles, CheckCircle2, Circle, Bell, X,
} from "lucide-react";
import Header from "@/components/ui/Header";
import { useOnboardingStore } from "@/stores/onboarding";
import { useTaskPlanStore } from "@/stores/taskPlan";
import { formatSoles } from "@/lib/budget";
import {
  STATUS_LABELS, STATUS_COLORS, SERVICE_LABELS, SERVICE_ICONS,
  TaskStatus, EventTask, TaskProvider, Reminder,
} from "@/lib/taskPlan";
import type { ServiceType } from "@/stores/onboarding";

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function ChecklistPage() {
  return <Suspense><ChecklistContent /></Suspense>;
}

function ChecklistContent() {
  const { data } = useOnboardingStore();
  const { services, city, guestCount, isDestinationEvent, budgetType, budgetDefined } = data;
  const hasCap = budgetType === "defined" && budgetDefined != null;

  const { tasks, initTasks, updateTask, updateProvider, addProvider, addTask } = useTaskPlanStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const searchParams = useSearchParams();

  // Seed tasks from onboarding on first mount (only if not yet initialized)
  useEffect(() => {
    initTasks(services, city, guestCount, isDestinationEvent, budgetDefined ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urlTaskId = searchParams.get("taskId");
  const [selectedId, setSelectedId] = useState<string | null>(urlTaskId);
  const [mobileView, setMobileView] = useState<"list" | "detail">(urlTaskId ? "detail" : "list");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "todas">("todas");

  const FILTER_OPTIONS: (TaskStatus | "todas")[] = ["todas", "pendiente", "cotizando", "contratado", "completado"];
  const filtered = statusFilter === "todas" ? tasks : tasks.filter((t) => t.status === statusFilter);
  const completedCount = tasks.filter((t) => t.status === "completado").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const effectiveId = selectedId ?? tasks[0]?.id ?? null;
  const selectedTask = tasks.find((t) => t.id === effectiveId) ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">

        {/* ══ LEFT — list ══ */}
        <div className={[
          "flex flex-col w-full md:w-80 lg:w-96 md:border-r border-border bg-surface shrink-0",
          mobileView === "detail" ? "hidden md:flex" : "flex",
        ].join(" ")}>

          <div className="px-4 pt-5 pb-3 border-b border-border">
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary mb-3 transition-colors">
              <ArrowLeft size={13} /> Volver al panel
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-base font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>Pendientes del evento</h1>
                <p className="text-[10px] text-muted mt-0.5">{completedCount} de {tasks.length} completados</p>
              </div>
              <span className="text-sm font-extrabold text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden mt-2">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="px-3 py-2 border-b border-border flex gap-1.5 flex-wrap">
            {FILTER_OPTIONS.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={["px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all",
                  statusFilter === s ? "border-primary bg-primary text-white" : "border-border text-muted bg-white hover:border-primary/50",
                ].join(" ")}>
                {s === "todas" ? "Todos" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((task) => (
              <button key={task.id} onClick={() => { setSelectedId(task.id); setMobileView("detail"); }}
                className={["w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border transition-colors",
                  effectiveId === task.id ? "bg-primary/6 border-l-2 border-l-primary" : "hover:bg-primary/3",
                ].join(" ")}>
                <div className="mt-0.5 shrink-0">
                  {task.status === "completado" ? <CheckCircle2 size={15} className="text-accent" /> : <Circle size={15} className="text-border" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary truncate">{task.icon} {task.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                    <span className="text-[10px] text-muted">
                      {(() => {
                        const cp = task.providers.find((p) => p.state === "contracted");
                        if (cp?.contractedPrice != null) return formatSoles(cp.contractedPrice);
                        if (hasCap && task.budgetAllocated != null) return formatSoles(task.budgetAllocated);
                        if (task.budgetSuggestedMin === 0 && task.budgetSuggestedMax === 0) return "—";
                        return `${formatSoles(task.budgetSuggestedMin)}–${formatSoles(task.budgetSuggestedMax)}`;
                      })()}
                    </span>
                  </div>
                </div>
                <ChevronRight size={13} className="text-muted shrink-0 mt-1" />
              </button>
            ))}
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-border"
            >
              <Plus size={13} /> Agregar pendiente
            </button>
          </div>
        </div>

        {/* ══ RIGHT — detail ══ */}
        <div className={["flex-1 overflow-y-auto", mobileView === "list" ? "hidden md:block" : "block"].join(" ")}>
          {selectedTask ? (
            <TaskDetail
              task={selectedTask}
              hasCap={hasCap}
              budgetDefined={budgetDefined ?? null}
              onBack={() => setMobileView("list")}
              onChange={(patch) => updateTask(selectedTask.id, patch)}
              onUpdateProvider={(pid, patch) => updateProvider(selectedTask.id, pid, patch)}
              onAddProvider={(p) => addProvider(selectedTask.id, p)}
              taskId={selectedTask.id}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted p-10 text-center">
              Selecciona un pendiente para ver su detalle.
            </div>
          )}
        </div>
      </div>

      {/* ══ Add task modal ══ */}
      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onAdd={(task) => {
            addTask(task);
            setSelectedId(task.id);
            setMobileView("detail");
            setShowAddTask(false);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Task detail
// ─────────────────────────────────────────────────────────────
function TaskDetail({ task, hasCap, budgetDefined, onBack, onChange, onUpdateProvider, onAddProvider, taskId }: {
  task: EventTask;
  hasCap: boolean;
  budgetDefined: number | null;
  taskId: string;
  onBack: () => void;
  onChange: (patch: Partial<EventTask>) => void;
  onUpdateProvider: (providerId: string, patch: Partial<TaskProvider>) => void;
  onAddProvider: (p: TaskProvider) => void;
}) {
  const [showDoneModal, setShowDoneModal] = useState(false);
  const isDone = task.status === "completado";
  const contracted = task.providers.find((p) => p.state === "contracted") ?? null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-5">
      <button onClick={onBack} className="md:hidden inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors">
        <ArrowLeft size={13} /> Volver a la lista
      </button>

      {/* ── Header card ── */}
      <div className="bg-white border border-border rounded-[var(--radius-card)] overflow-hidden">
        <div className="flex items-start gap-3 p-5">
          <span className="text-3xl shrink-0">{task.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-extrabold text-primary leading-tight" style={{ fontFamily: "var(--font-display)" }}>{task.name}</h2>
              <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
            </div>
            <p className="text-[10px] text-muted mt-0.5">Estado actualizado automáticamente según tus acciones.</p>
          </div>
        </div>

        {/* Budget tiles */}
        <div className="grid grid-cols-2 gap-px bg-border border-t border-border">
          {/* Left tile: contracted amount (if any) or estimated range */}
          <div className="bg-white px-4 py-3">
            {contracted ? (
              <>
                <div className="flex items-center gap-1 mb-0.5">
                  <CheckCircle2 size={8} className="text-secondary" />
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Monto contratado</p>
                </div>
                <p className="text-sm font-extrabold text-secondary">
                  {contracted.contractedPrice != null ? formatSoles(contracted.contractedPrice) : "—"}
                </p>
                {contracted.quotedPrice != null && contracted.contractedPrice != null && contracted.contractedPrice !== contracted.quotedPrice && (
                  <p className="text-[9px] text-accent mt-0.5">
                    ✅ Ahorraste {formatSoles(contracted.quotedPrice - contracted.contractedPrice)}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 mb-0.5">
                  <Sparkles size={8} className="text-primary" />
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Presupuesto estimado</p>
                  <Tooltip text="Calculado en función de los proveedores disponibles en Plannia para esta categoría." />
                </div>
                <p className="text-sm font-extrabold text-primary">
                  {formatSoles(task.budgetSuggestedMin)} – {formatSoles(task.budgetSuggestedMax)}
                </p>
              </>
            )}
          </div>
          {/* Right tile: assigned budget (if cap) or contracted provider name */}
          {contracted ? (
            <div className="bg-white px-4 py-3">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">Proveedor</p>
              <p className="text-xs font-bold text-primary truncate">{contracted.name}</p>
              <p className="text-[9px] text-muted mt-0.5">🟢 Contratado</p>
            </div>
          ) : hasCap && task.budgetAllocated != null ? (
            <div className="bg-white px-4 py-3">
              <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">Presupuesto asignado</p>
              <p className="text-sm font-extrabold text-secondary">{formatSoles(task.budgetAllocated)}</p>
              {budgetDefined && <p className="text-[9px] text-muted">{Math.round((task.budgetAllocated / budgetDefined) * 100)}% del total</p>}
            </div>
          ) : <div className="bg-white" />}
        </div>

        {/* Mark done */}
        <div className="px-5 py-3 border-t border-border bg-background/50">
          {isDone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                <CheckCircle2 size={14} className="text-accent" />
                Marcado como listo
                {contracted && <span className="text-muted font-normal">· {contracted.name}</span>}
                {contracted?.contractedPrice != null && <span className="text-muted font-normal">· {formatSoles(contracted.contractedPrice)}</span>}
              </div>
              <button onClick={() => onChange({ markedDone: false })} className="text-xs text-muted underline hover:text-primary transition-colors">Deshacer</button>
            </div>
          ) : (
            <button onClick={() => setShowDoneModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-accent/15 text-secondary text-sm font-bold py-2.5 rounded-lg hover:bg-accent/25 transition-colors border border-accent/30">
              <CheckCircle2 size={15} /> Marcar como listo
            </button>
          )}
        </div>
      </div>

      {/* ── Unified provider list ── */}
      <ProvidersSection
        task={task}
        taskId={taskId}
        onUpdateProvider={onUpdateProvider}
        onAddProvider={onAddProvider}
      />

      {/* ── Reminders ── */}
      <RemindersSection
        reminders={task.reminders}
        onChange={(reminders) => onChange({ reminders })}
      />

      {/* ── Task notes ── */}
      <SectionCard icon={<StickyNote size={14} />} title="Notas del pendiente">
        <textarea rows={3} placeholder="Observaciones generales sobre este pendiente..."
          value={task.taskNotes}
          onChange={(e) => onChange({ taskNotes: e.target.value })}
          className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm text-primary focus:outline-none focus:border-primary transition-colors resize-none" />
      </SectionCard>

      {/* Mark done modal */}
      {showDoneModal && (
        <MarkDoneModal
          task={task}
          onConfirm={(patch) => { onChange(patch); setShowDoneModal(false); }}
          onClose={() => setShowDoneModal(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Providers section — unified list
// ─────────────────────────────────────────────────────────────
function ProvidersSection({ task, taskId, onUpdateProvider, onAddProvider }: {
  task: EventTask;
  taskId: string;
  onUpdateProvider: (id: string, patch: Partial<TaskProvider>) => void;
  onAddProvider: (p: TaskProvider) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Comparison badges
  const quoted = task.providers.filter((p) => p.quotedPrice != null && p.quotedPrice > 0);
  const cheapestId  = quoted.length > 1 ? quoted.reduce((a, b) => a.quotedPrice! < b.quotedPrice! ? a : b).id : null;
  const topRatedId  = task.providers.filter((p) => p.rating != null).length > 1
    ? task.providers.filter((p) => p.rating != null).reduce((a, b) => a.rating! > b.rating! ? a : b).id
    : null;

  function badges(p: TaskProvider): string[] {
    const b: string[] = [];
    if (p.id === cheapestId) b.push("💰 Mejor precio");
    if (p.id === topRatedId) b.push("⭐ Mejor evaluación");
    return b;
  }

  return (
    <SectionCard
      icon={<Store size={14} />}
      title="Proveedores"
      action={
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-[10px] font-semibold text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors">
          <Plus size={11} /> Agregar
        </button>
      }
    >
      {task.providers.length === 0 && !showAddForm && (
        <div className="text-center py-6">
          <Store size={28} className="text-muted mx-auto mb-2" />
          <p className="text-sm font-semibold text-primary mb-1">Sin proveedores sugeridos</p>
          <p className="text-xs text-muted mb-3">Agrega un proveedor de Plannia o uno externo.</p>
          <Link href="/marketplace" className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
            Explorar marketplace <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* Comparison banner */}
      {quoted.length > 1 && (
        <div className="mb-3 bg-accent/10 border border-accent/25 rounded-xl px-3 py-2.5 text-xs text-secondary font-medium">
          Plannia comparó {quoted.length} cotizaciones — la más económica es <strong>{task.providers.find(p => p.id === cheapestId)?.name}</strong>.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {task.providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            badges={badges(provider)}
            taskBudgetAllocated={task.budgetAllocated}
            onUpdate={(patch) => onUpdateProvider(provider.id, patch)}
          />
        ))}
      </div>

      {/* Add provider form */}
      {showAddForm && (
        <AddProviderForm
          taskId={taskId}
          service={task.service}
          onAdd={(p) => { onAddProvider(p); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Provider card — handles all states
// ─────────────────────────────────────────────────────────────
function ProviderCard({ provider, badges, taskBudgetAllocated, onUpdate }: {
  provider: TaskProvider;
  badges: string[];
  taskBudgetAllocated: number | null;
  onUpdate: (patch: Partial<TaskProvider>) => void;
}) {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [quotePrice, setQuotePrice] = useState(provider.quotedPrice ? String(provider.quotedPrice) : "");
  const [quoteNotes, setQuoteNotes] = useState(provider.quoteNotes);

  const isContracted = provider.state === "contracted";
  const isQuoted     = provider.state === "quoted";

  function saveQuote() {
    const price = quotePrice ? Number(quotePrice) : null;
    onUpdate({ state: "quoted", quotedPrice: price, quoteNotes });
    setShowQuoteForm(false);
  }

  return (
    <div className={["border rounded-[var(--radius-card)] overflow-hidden transition-all",
      isContracted ? "border-accent/40" : "border-border",
    ].join(" ")}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 bg-white">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-primary">{provider.name}</p>
            {isContracted && <span className="text-[10px] font-bold bg-accent/20 text-secondary px-2 py-0.5 rounded-full">🟢 Contratado</span>}
            {provider.source === "external" && <span className="text-[9px] font-bold bg-border text-muted px-2 py-0.5 rounded-full">Externo</span>}
            {badges.map((b) => (
              <span key={b} className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{b}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {(provider.priceEstMin > 0 || provider.priceEstMax > 0) && (
              <p className="text-xs text-muted">{formatSoles(provider.priceEstMin)} – {formatSoles(provider.priceEstMax)}</p>
            )}
            {provider.rating != null && (
              <span className="flex items-center gap-0.5 text-xs text-warning-text font-semibold">
                <Star size={10} className="fill-current" /> {provider.rating}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {provider.source === "plannia" && (
            <Link href={`/marketplace/${provider.id}`}
              className="flex items-center gap-1 text-[10px] font-semibold text-primary border border-primary/30 px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
              Ver perfil <ExternalLink size={9} />
            </Link>
          )}
        </div>
      </div>

      {/* Quote info (if quoted) */}
      {(isQuoted || isContracted) && !showQuoteForm && (
        <div className="px-4 py-2.5 bg-primary/3 border-t border-border/60 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Precio cotizado</p>
            <p className="text-sm font-extrabold text-primary">
              {provider.quotedPrice != null ? formatSoles(provider.quotedPrice) : "—"}
            </p>
            {provider.quoteNotes && <p className="text-[10px] text-muted mt-0.5 italic">"{provider.quoteNotes}"</p>}
            {provider.quotedPrice != null && taskBudgetAllocated != null && (
              <p className={`text-[9px] mt-0.5 font-medium ${provider.quotedPrice > taskBudgetAllocated ? "text-red-500" : "text-secondary"}`}>
                {provider.quotedPrice > taskBudgetAllocated ? `⚠️ Supera el asignado en ${formatSoles(provider.quotedPrice - taskBudgetAllocated)}` : `✅ Dentro del presupuesto`}
              </p>
            )}
          </div>
          {!isContracted && (
            <button onClick={() => setShowQuoteForm(true)} className="text-[10px] text-muted underline hover:text-primary transition-colors shrink-0 mt-0.5">Editar</button>
          )}
        </div>
      )}

      {/* Quote form */}
      {showQuoteForm && (
        <div className="px-4 py-3 bg-primary/3 border-t border-border/60 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Registrar cotización</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">S/</span>
            <input type="number" placeholder="Precio cotizado" value={quotePrice}
              onChange={(e) => setQuotePrice(e.target.value)} autoFocus
              className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors bg-white" />
          </div>
          <input type="text" placeholder="Notas (ej: incluye transporte, entrega en 7 días...)" value={quoteNotes}
            onChange={(e) => setQuoteNotes(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors bg-white" />
          <div className="flex gap-2">
            <button onClick={saveQuote}
              className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
              Guardar cotización
            </button>
            <button onClick={() => setShowQuoteForm(false)}
              className="px-4 text-xs font-semibold text-muted border border-border rounded-xl hover:bg-border/40 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* CTAs */}
      {!isContracted && (
        <div className="flex gap-px bg-border border-t border-border">
          {!isQuoted && !showQuoteForm && (
            <button onClick={() => setShowQuoteForm(true)}
              className="flex-1 py-2.5 bg-white hover:bg-primary/4 text-xs font-semibold text-primary transition-colors">
              Registrar cotización
            </button>
          )}
          {isQuoted && (
            <button onClick={() => setShowSelectModal(true)}
              className="flex-1 py-2.5 bg-primary/6 hover:bg-primary/12 text-xs font-bold text-primary transition-colors">
              Seleccionar proveedor →
            </button>
          )}
        </div>
      )}

      {/* Contracted details */}
      {isContracted && (
        <ContractedDetails provider={provider} onUpdate={onUpdate} taskBudgetAllocated={taskBudgetAllocated} />
      )}

      {/* Select modal */}
      {showSelectModal && (
        <SelectProviderModal
          provider={provider}
          onConfirm={(finalPrice) => {
            onUpdate({ state: "contracted", contractedPrice: finalPrice, contractedDate: new Date().toISOString().slice(0, 10) });
            setShowSelectModal(false);
          }}
          onClose={() => setShowSelectModal(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Contracted details block
// ─────────────────────────────────────────────────────────────
function ContractedDetails({ provider, onUpdate, taskBudgetAllocated }: {
  provider: TaskProvider;
  onUpdate: (patch: Partial<TaskProvider>) => void;
  taskBudgetAllocated: number | null;
}) {
  const [showPayForm, setShowPayForm]   = useState(false);
  const [payType,     setPayType]       = useState<"adelanto" | "total">("adelanto");
  const [payAmount,   setPayAmount]     = useState("");
  const [payDate,     setPayDate]       = useState("");
  const [editPrice,   setEditPrice]     = useState(false);
  const [priceInput,  setPriceInput]    = useState(provider.contractedPrice != null ? String(provider.contractedPrice) : "");

  const contracted    = provider.contractedPrice ?? 0;
  const adelantoPaid  = provider.adelantoPaid  ? (provider.adelanto  ?? 0) : 0;
  const finalPaid     = provider.finalPaymentPaid ? (provider.finalPayment ?? 0) : 0;
  const totalPaid     = adelantoPaid + finalPaid;
  const remaining     = contracted > 0 ? Math.max(0, contracted - totalPaid) : null;
  const fullyPaid     = remaining === 0 && contracted > 0;

  const hasAdelanto   = provider.adelanto != null;
  const hasFinal      = provider.finalPayment != null;
  const canRegister   = !hasAdelanto || !hasFinal;  // at least one slot free

  function handleTypeChange(t: "adelanto" | "total") {
    setPayType(t);
    if (t === "total") {
      setPayAmount(remaining != null && remaining > 0 ? String(remaining) : contracted > 0 ? String(contracted) : "");
    } else {
      setPayAmount("");
    }
  }

  function handleSave() {
    const amt  = payAmount ? Number(payAmount) : 0;
    const date = payDate || null;
    if (payType === "adelanto") {
      onUpdate({ adelanto: amt, adelantoDate: date, adelantoPaid: true });
    } else {
      onUpdate({ finalPayment: amt, finalPaymentDate: date, finalPaymentPaid: true });
    }
    setShowPayForm(false);
    setPayAmount("");
    setPayDate("");
  }

  function savePrice() {
    const v = priceInput ? Number(priceInput) : null;
    onUpdate({ contractedPrice: v });
    setEditPrice(false);
  }

  return (
    <div className="border-t border-border divide-y divide-border/60">

      {/* ── Monto contratado (editable) ── */}
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Monto contratado</p>
          {!editPrice && (
            <button onClick={() => { setEditPrice(true); setPriceInput(provider.contractedPrice != null ? String(provider.contractedPrice) : ""); }}
              className="text-[10px] text-primary underline hover:text-primary/70 transition-colors">
              Editar
            </button>
          )}
        </div>

        {editPrice ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">S/</span>
              <input type="number" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} autoFocus
                className="w-full pl-9 pr-3 py-2 border-2 border-primary rounded-xl text-sm font-semibold focus:outline-none transition-colors" />
            </div>
            <button onClick={savePrice}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors">
              Guardar
            </button>
            <button onClick={() => setEditPrice(false)}
              className="px-3 py-2 text-xs font-semibold text-muted border border-border rounded-xl hover:bg-border/40 transition-colors">
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <p className="text-xl font-extrabold text-primary">
              {provider.contractedPrice != null ? formatSoles(provider.contractedPrice) : "—"}
            </p>
            {provider.quotedPrice != null && provider.contractedPrice != null && provider.contractedPrice !== provider.quotedPrice && (
              <p className={`text-xs font-semibold ${provider.contractedPrice < provider.quotedPrice ? "text-secondary" : "text-warning-text"}`}>
                {provider.contractedPrice < provider.quotedPrice
                  ? `✅ Ahorraste ${formatSoles(provider.quotedPrice - provider.contractedPrice)}`
                  : `⚠ ${formatSoles(provider.contractedPrice - provider.quotedPrice)} sobre cotizado`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Pagos ── */}
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
            <CreditCard size={10} /> Pagos
          </p>
          {canRegister && !showPayForm && (
            <button onClick={() => { setShowPayForm(true); handleTypeChange("adelanto"); }}
              className="flex items-center gap-1 text-[10px] font-bold text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors">
              <Plus size={10} /> Registrar pago
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {/* Totals strip */}
          <div className="grid grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border mb-1">
            {[
              { label: "Total", value: contracted > 0 ? formatSoles(contracted) : "—", muted: false },
              { label: "Pagado",   value: totalPaid > 0 ? formatSoles(totalPaid) : "—", muted: false },
              { label: "Pendiente", value: remaining != null && remaining > 0 ? formatSoles(remaining) : fullyPaid ? "✓ Al día" : "—", alert: remaining != null && remaining > 0 },
            ].map((c) => (
              <div key={c.label} className="bg-white px-3 py-2 text-center">
                <p className="text-[9px] text-muted font-bold uppercase tracking-wider">{c.label}</p>
                <p className={`text-xs font-extrabold mt-0.5 ${c.alert ? "text-warning-text" : fullyPaid && c.label === "Pendiente" ? "text-secondary" : "text-primary"}`}>
                  {c.value}
                </p>
              </div>
            ))}
          </div>

          {/* Payment register form */}
          {showPayForm && (
            <div className="border-2 border-primary/25 rounded-xl p-3 bg-primary/3 flex flex-col gap-3">
              <p className="text-xs font-bold text-primary">Registrar pago</p>

              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(["adelanto", "total"] as const).map((t) => (
                  <button key={t}
                    disabled={t === "adelanto" && hasAdelanto || t === "total" && hasFinal}
                    onClick={() => handleTypeChange(t)}
                    className={[
                      "py-2 rounded-xl text-xs font-bold border-2 transition-all",
                      payType === t ? "border-primary bg-primary text-white" : "border-border text-muted bg-white hover:border-primary/40",
                      (t === "adelanto" && hasAdelanto || t === "total" && hasFinal) ? "opacity-40 cursor-not-allowed" : "",
                    ].join(" ")}>
                    {t === "adelanto" ? "Adelanto" : "Pago total"}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold text-muted block mb-1">
                  {payType === "total" ? "Monto (saldo pendiente auto-calculado)" : "Monto del adelanto"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">S/</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-xl text-sm font-semibold focus:outline-none focus:border-primary transition-colors bg-white"
                  />
                </div>
                {payType === "total" && remaining != null && remaining > 0 && (
                  <p className="text-[10px] text-muted mt-1">Saldo pendiente: {formatSoles(remaining)}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-bold text-muted block mb-1">Fecha de pago</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors bg-white"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={!payAmount}
                  className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                  Guardar pago
                </button>
                <button onClick={() => setShowPayForm(false)}
                  className="px-4 text-xs font-semibold text-muted border border-border rounded-xl hover:bg-border/40 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Registered payments */}
          {hasAdelanto && (
            <div className="flex items-center justify-between border border-border rounded-xl px-3 py-2.5 bg-white">
              <div>
                <p className="text-xs font-semibold text-primary">Adelanto</p>
                {provider.adelantoDate && (
                  <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                    <CalendarDays size={9} /> {provider.adelantoDate}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-extrabold text-primary">
                  {provider.adelanto != null ? formatSoles(provider.adelanto) : "—"}
                </p>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={provider.adelantoPaid}
                    onChange={(e) => onUpdate({ adelantoPaid: e.target.checked })}
                    className="accent-primary" />
                  <span className="text-[10px] text-muted">{provider.adelantoPaid ? "Pagado" : "Pendiente"}</span>
                </label>
              </div>
            </div>
          )}

          {hasFinal && (
            <div className="flex items-center justify-between border border-border rounded-xl px-3 py-2.5 bg-white">
              <div>
                <p className="text-xs font-semibold text-primary">Pago total</p>
                {provider.finalPaymentDate && (
                  <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                    <CalendarDays size={9} /> {provider.finalPaymentDate}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-extrabold text-primary">
                  {provider.finalPayment != null ? formatSoles(provider.finalPayment) : "—"}
                </p>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={provider.finalPaymentPaid}
                    onChange={(e) => onUpdate({ finalPaymentPaid: e.target.checked })}
                    className="accent-primary" />
                  <span className="text-[10px] text-muted">{provider.finalPaymentPaid ? "Pagado" : "Pendiente"}</span>
                </label>
              </div>
            </div>
          )}

          {/* Fully paid banner */}
          {fullyPaid && (
            <div className="flex items-center gap-2 bg-accent/15 border border-accent/30 rounded-xl px-3 py-2.5">
              <CheckCircle2 size={14} className="text-secondary shrink-0" />
              <p className="text-xs font-bold text-secondary">Pagado al 100% — {formatSoles(totalPaid)}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Fechas importantes ── */}
      <div className="px-4 py-3 bg-white">
        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
          <CalendarDays size={10} /> Fechas importantes
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Contratación", key: "contractedDate"      as const },
            { label: "Entrega",      key: "deliveryDate"        as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <p className="text-[9px] text-muted mb-1">{label}</p>
              <input type="date" value={provider[key] ?? ""}
                onChange={(e) => onUpdate({ [key]: e.target.value || null } as any)}
                className="w-full px-2 py-1.5 border-2 border-border rounded-lg text-[10px] focus:outline-none focus:border-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Select provider modal
// ─────────────────────────────────────────────────────────────
function SelectProviderModal({ provider, onConfirm, onClose }: {
  provider: TaskProvider;
  onConfirm: (contractedPrice: number | null) => void;
  onClose: () => void;
}) {
  const [price, setPrice] = useState<string>(
    provider.quotedPrice != null ? String(provider.quotedPrice) : ""
  );

  const finalPrice  = price ? Number(price) : null;
  const quoted      = provider.quotedPrice;
  const savedAmount = quoted != null && finalPrice != null && finalPrice < quoted
    ? quoted - finalPrice
    : null;
  const overAmount  = quoted != null && finalPrice != null && finalPrice > quoted
    ? finalPrice - quoted
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-border">
          <p className="text-base font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Confirmar contratación
          </p>
          <p className="text-xs text-muted mt-0.5">{provider.name}</p>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Quoted reference */}
          {quoted != null && (
            <div className="bg-border/30 rounded-xl px-4 py-3">
              <p className="text-[10px] text-muted uppercase tracking-wider font-bold">Precio cotizado</p>
              <p className="text-lg font-extrabold text-primary">{formatSoles(quoted)}</p>
              {provider.quoteNotes && <p className="text-xs text-muted mt-0.5 italic">"{provider.quoteNotes}"</p>}
            </div>
          )}

          {/* Editable contracted price */}
          <div>
            <label className="text-xs font-bold text-primary block mb-1.5">
              Monto final a contratar
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">S/</span>
              <input
                type="number"
                placeholder={quoted != null ? String(quoted) : "0"}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-3 border-2 border-border rounded-xl text-base font-semibold focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {savedAmount != null && savedAmount > 0 && (
              <p className="text-[11px] text-secondary font-semibold mt-1.5">
                ✅ Negociaste un ahorro de {formatSoles(savedAmount)}
              </p>
            )}
            {overAmount != null && overAmount > 0 && (
              <p className="text-[11px] text-warning-text font-semibold mt-1.5">
                ⚠ {formatSoles(overAmount)} por encima del precio cotizado
              </p>
            )}
            <p className="text-[10px] text-muted mt-1">
              Puedes ajustar este monto si hubo negociación después de la cotización.
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-border">
          <button
            onClick={() => onConfirm(finalPrice)}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            Confirmar contratación
          </button>
          <button onClick={onClose} className="px-4 font-semibold text-muted border border-border rounded-xl hover:bg-border/40 transition-colors text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

import { SERVICE_TO_CATEGORY } from "@/lib/serviceToCategory";

// ─────────────────────────────────────────────────────────────
// Add provider form
// ─────────────────────────────────────────────────────────────
function AddProviderForm({ taskId, service, onAdd, onCancel }: {
  taskId: string;
  service: string;
  onAdd: (p: TaskProvider) => void;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<"plannia" | "external">("plannia");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    const p: TaskProvider = {
      id: `ext-${Date.now()}`,
      source: "external",
      name: name.trim(),
      priceEstMin: 0, priceEstMax: 0, rating: null,
      phone, email, notes,
      state: "suggested",
      quotedPrice: null, quoteNotes: "",
      contractedPrice: null, contractedDate: null, deliveryDate: null,
      adelanto: null, adelantoDate: null, adelantoPaid: false,
      finalPayment: null, finalPaymentDate: null, finalPaymentPaid: false,
      pendingPaymentDate: null,
    };
    onAdd(p);
  }

  return (
    <div className="mt-3 border-2 border-dashed border-primary/30 rounded-[var(--radius-card)] p-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <Link
          href={(() => {
            const cat = SERVICE_TO_CATEGORY[service];
            const params = new URLSearchParams();
            if (cat) params.set("categoria", cat);
            params.set("taskId", taskId);
            return `/marketplace?${params.toString()}`;
          })()}
          className={["flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all text-center",
            tab === "plannia" ? "border-primary bg-primary text-white" : "border-border text-muted hover:border-primary/40",
          ].join(" ")}
        >
          Buscar en Plannia
        </Link>
        <button onClick={() => setTab("external")}
          className={["flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all",
            tab === "external" ? "border-primary bg-primary text-white" : "border-border text-muted hover:border-primary/40",
          ].join(" ")}>
          Proveedor externo
        </button>
      </div>

      {tab === "external" ? (
        <>
          <input type="text" placeholder="Nombre del proveedor *" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
          <div className="grid grid-cols-2 gap-2">
            <input type="tel" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
            <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
          </div>
          <input type="text" placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!name.trim()}
              className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
              Agregar proveedor
            </button>
            <button onClick={onCancel} className="px-4 text-xs font-semibold text-muted border border-border rounded-xl hover:bg-border/40 transition-colors">
              Cancelar
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mark done modal
// ─────────────────────────────────────────────────────────────
function MarkDoneModal({ task, onConfirm, onClose }: {
  task: EventTask;
  onConfirm: (patch: Partial<EventTask>) => void;
  onClose: () => void;
}) {
  const suggestedProviders = task.providers.filter((p) => p.source === "plannia");
  const [amount, setAmount] = useState<string>("");
  const [mode, setMode] = useState<"plannia" | "outside" | "none">(suggestedProviders.length > 0 ? "plannia" : "none");
  const [selectedId, setSelectedId] = useState(suggestedProviders[0]?.id ?? "");
  const [outsideName, setOutsideName] = useState("");

  function confirm() {
    const finalAmount = amount ? Number(amount) : null;
    let providerPatch: Partial<EventTask> = { markedDone: true };
    if (mode === "plannia" && selectedId) {
      const p = task.providers.find((p) => p.id === selectedId);
      if (p) {
        providerPatch.providers = task.providers.map((pr) =>
          pr.id === selectedId ? { ...pr, state: "contracted" as const, contractedPrice: finalAmount ?? pr.contractedPrice } : pr
        );
      }
    } else if (mode === "outside" && outsideName.trim()) {
      const newP: TaskProvider = {
        id: `ext-done-${Date.now()}`, source: "external",
        name: outsideName.trim(), priceEstMin: 0, priceEstMax: 0, rating: null,
        phone: "", email: "", notes: "",
        state: "contracted",
        quotedPrice: finalAmount, quoteNotes: "",
        contractedPrice: finalAmount, contractedDate: new Date().toISOString().slice(0, 10), deliveryDate: null,
        adelanto: null, adelantoDate: null, adelantoPaid: false,
        finalPayment: null, finalPaymentDate: null, finalPaymentPaid: false,
        pendingPaymentDate: null,
      };
      providerPatch.providers = [...task.providers, newP];
    }
    onConfirm(providerPatch);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">{task.icon}</span>
            <div>
              <p className="text-sm font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>{task.name}</p>
              <p className="text-[10px] text-muted">Confirma los detalles finales (opcional)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-primary block mb-1.5">¿Por cuánto cerraste?</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">S/</span>
              <input type="number" placeholder="Monto final" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
                className="w-full pl-9 pr-3 py-3 border-2 border-border rounded-xl text-base font-semibold focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-primary block mb-2">¿Con qué proveedor cerraste?</label>
            {suggestedProviders.length > 0 && (
              <div className="flex flex-col gap-2 mb-2">
                {suggestedProviders.map((p) => (
                  <label key={p.id} className={["flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    mode === "plannia" && selectedId === p.id ? "border-primary bg-primary/6" : "border-border hover:border-primary/40",
                  ].join(" ")}>
                    <input type="radio" name="modal-prov" checked={mode === "plannia" && selectedId === p.id}
                      onChange={() => { setMode("plannia"); setSelectedId(p.id); }} className="accent-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary">{p.name}</p>
                      <p className="text-[10px] text-muted">{formatSoles(p.priceEstMin)} – {formatSoles(p.priceEstMax)}{p.rating != null ? ` · ⭐ ${p.rating}` : ""}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Plannia</span>
                  </label>
                ))}
              </div>
            )}
            <label className={["flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all mb-2",
              mode === "outside" ? "border-primary bg-primary/6" : "border-border hover:border-primary/40"].join(" ")}>
              <input type="radio" name="modal-prov" checked={mode === "outside"} onChange={() => setMode("outside")} className="accent-primary shrink-0" />
              <p className="text-sm font-semibold text-primary">Lo conseguí fuera de Plannia</p>
            </label>
            {mode === "outside" && (
              <input type="text" placeholder="Nombre del proveedor" value={outsideName} onChange={(e) => setOutsideName(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary mb-2 transition-colors" />
            )}
            <label className={["flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
              mode === "none" ? "border-primary bg-primary/6" : "border-border hover:border-primary/40"].join(" ")}>
              <input type="radio" name="modal-prov" checked={mode === "none"} onChange={() => setMode("none")} className="accent-primary shrink-0" />
              <p className="text-sm font-semibold text-primary">No usé proveedor</p>
            </label>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-border">
          <button onClick={confirm} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm">
            Confirmar como listo ✓
          </button>
          <button onClick={onClose} className="px-5 font-semibold text-muted border border-border rounded-xl hover:bg-border/40 transition-colors text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reminders section (task-level)
// ─────────────────────────────────────────────────────────────
function RemindersSection({ reminders, onChange }: {
  reminders: Reminder[];
  onChange: (reminders: Reminder[]) => void;
}) {
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  function add() {
    if (!text.trim()) return;
    onChange([...reminders, { id: `r-${Date.now()}`, description: text.trim(), date: date || null, done: false }]);
    setText(""); setDate("");
  }

  function toggle(id: string) {
    onChange(reminders.map((r) => r.id === id ? { ...r, done: !r.done } : r));
  }

  function remove(id: string) {
    onChange(reminders.filter((r) => r.id !== id));
  }

  return (
    <SectionCard icon={<Bell size={14} />} title="Recordatorios">
      <div className="flex flex-col gap-2">
        {reminders.length === 0 && (
          <p className="text-xs text-muted text-center py-2">Sin recordatorios. Agrega uno abajo.</p>
        )}
        {reminders.map((r) => (
          <div key={r.id} className={["flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors",
            r.done ? "border-border bg-border/20" : "border-border bg-white",
          ].join(" ")}>
            <button onClick={() => toggle(r.id)} className="shrink-0 mt-0.5">
              {r.done
                ? <CheckCircle2 size={15} className="text-accent" />
                : <Circle size={15} className="text-border hover:text-primary transition-colors" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium leading-snug ${r.done ? "line-through text-muted" : "text-primary"}`}>{r.description}</p>
              {r.date && (
                <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                  <CalendarDays size={9} /> {r.date}
                </p>
              )}
            </div>
            <button onClick={() => remove(r.id)} className="shrink-0 text-muted hover:text-red-500 transition-colors mt-0.5">
              <X size={13} />
            </button>
          </div>
        ))}

        {/* Add form */}
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="Nuevo recordatorio..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            className="flex-1 px-3 py-2 border-2 border-border rounded-xl text-xs focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-32 px-2 py-2 border-2 border-border rounded-xl text-xs focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={add}
            disabled={!text.trim()}
            className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 shrink-0"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Add task modal
// ─────────────────────────────────────────────────────────────
const TASK_EMOJI_OPTIONS = [
  "📌","🎉","📋","🎨","🎤","🚗","🍽️","📷",
  "🌸","🎵","💡","✉️","👗","🛡️","🤝","🎂",
  "🍾","🚌","🏛️","⭐","💼","🎈","🎁","🔔",
];

const ALL_SERVICE_TYPES: ServiceType[] = [
  "locales_espacios","catering","licor_bebidas","torta_postres",
  "fotografia_video","musica_entretenimiento","decoracion_flores",
  "sonido_iluminacion","invitaciones_papeleria","transporte",
  "vestuario_belleza","personal_eventos","seguridad",
  "planeacion_coordinacion","otros",
];

function AddTaskModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (task: EventTask) => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📌");
  const [service, setService] = useState<ServiceType>("otros");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  function handleConfirm() {
    if (!name.trim()) return;
    const newTask: EventTask = {
      id: `custom-${Date.now()}`,
      service,
      name: name.trim(),
      icon,
      status: "pendiente",
      markedDone: false,
      budgetSuggestedMin: budgetMin ? Number(budgetMin) : 0,
      budgetSuggestedMax: budgetMax ? Number(budgetMax) : 0,
      budgetAllocated: null,
      providers: [],
      taskNotes: "",
      reminders: [],
    };
    onAdd(newTask);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-base font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Nuevo pendiente
            </p>
            <p className="text-[10px] text-muted mt-0.5">Personaliza este elemento para tu evento</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-primary block mb-1.5">
              Nombre del pendiente <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Arreglo floral de entrada, Animación infantil..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleConfirm(); }}
              autoFocus
              className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Emoji picker */}
          <div>
            <label className="text-xs font-bold text-primary block mb-1.5">Ícono</label>
            <div className="grid grid-cols-8 gap-1.5">
              {TASK_EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={[
                    "w-9 h-9 text-lg rounded-xl flex items-center justify-center border-2 transition-all",
                    icon === e ? "border-primary bg-primary/10 scale-110" : "border-border hover:border-primary/40 hover:bg-primary/5",
                  ].join(" ")}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Category selector */}
          <div>
            <label className="text-xs font-bold text-primary block mb-1.5">Categoría de servicio</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as ServiceType)}
              className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors bg-white"
            >
              {ALL_SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {SERVICE_ICONS[s]} {SERVICE_LABELS[s]}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted mt-1">
              Permite vincular este pendiente con el marketplace de Plannia.
            </p>
          </div>

          {/* Budget range */}
          <div>
            <label className="text-xs font-bold text-primary block mb-1.5">
              Costo estimado <span className="text-muted font-normal">(opcional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">S/</span>
                <input
                  type="number"
                  placeholder="Mín"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">S/</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-border">
          <button
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar pendiente
          </button>
          <button
            onClick={onClose}
            className="px-5 font-semibold text-muted border border-border rounded-xl hover:bg-border/40 transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable components
// ─────────────────────────────────────────────────────────────
function SectionCard({ icon, title, action, children }: {
  icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border rounded-[var(--radius-card)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-muted">{icon}</span>
          <p className="text-xs font-bold text-primary uppercase tracking-wider">{title}</p>
        </div>
        {action}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex">
      <button onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)} onBlur={() => setVisible(false)} onClick={() => setVisible((v) => !v)}
        className="w-3.5 h-3.5 rounded-full bg-border text-muted flex items-center justify-center text-[8px] font-bold hover:bg-primary/20 transition-colors">
        ?
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 bg-primary text-white text-[10px] leading-snug rounded-lg px-2.5 py-2 shadow-lg z-20 pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
        </span>
      )}
    </span>
  );
}
