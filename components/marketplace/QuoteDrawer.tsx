"use client";

import { useState } from "react";
import { X, FileText, CheckCircle2, Tag } from "lucide-react";
import { useQuoteRequestStore } from "@/stores/quoteRequest";
import { useOnboardingStore } from "@/stores/onboarding";
import { useTaskPlanStore } from "@/stores/taskPlan";
import { TaskProvider } from "@/lib/taskPlan";
import { formatSoles } from "@/lib/budget";

interface Props {
  providerId: string;
  providerName: string;
  taskId?: string | null;
  onClose: () => void;
}

export default function QuoteDrawer({ providerId, providerName, taskId, onClose }: Props) {
  const { items, clearQuote, totalMin, totalMax, providerId: quotingId, context } = useQuoteRequestStore();
  const quoteItems = quotingId === providerId ? items : [];
  const { addProvider, tasks } = useTaskPlanStore();
  const { data: onboardingData } = useOnboardingStore();

  const task = taskId ? tasks.find((t) => t.id === taskId) : null;

  // Pre-fill from quote context first, then onboarding as fallback
  const [notes, setNotes] = useState(context?.notes ?? "");
  const [eventDate, setEventDate] = useState(context?.date ?? onboardingData.eventDate ?? "");
  const [city, setCity] = useState(context?.city ?? onboardingData.city ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId] = useState(`COT-${Date.now().toString(36).toUpperCase()}`);

  const min = totalMin();
  const max = totalMax();
  const hasPrice = min > 0;

  async function handleSubmit() {
    if (!name.trim() || quoteItems.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    // If coming from a task → add provider as "quoted"
    if (taskId) {
      const itemSummary = quoteItems
        .map((i) => `• ${i.name} ×${i.quantity}`)
        .join("\n");
      const tp: TaskProvider = {
        id: `mkt-${providerId}-${Date.now()}`,
        source: "plannia",
        name: providerName,
        priceEstMin: min,
        priceEstMax: max || min,
        rating: null,
        phone: phone.trim(),
        email: email.trim(),
        notes: `Cotización solicitada:\n${itemSummary}${notes ? `\n\nNotas: ${notes}` : ""}`,
        state: "quoted",
        quotedPrice: min || null,
        quoteNotes: itemSummary + (notes ? `\n\nNotas adicionales: ${notes}` : ""),
        contractedPrice: null,
        contractedDate: null,
        deliveryDate: eventDate || null,
        adelanto: null,
        adelantoDate: null,
        adelantoPaid: false,
        finalPayment: null,
        finalPaymentDate: null,
        finalPaymentPaid: false,
        pendingPaymentDate: null,
      };
      addProvider(taskId, tp);
    }

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/45 z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <div>
              <h2 className="font-bold text-primary text-sm" style={{ fontFamily: "var(--font-display)" }}>
                Solicitar cotización
              </h2>
              <p className="text-xs text-muted">{providerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {submitted ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center gap-5 px-6 py-12">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-secondary" />
              </div>
              <div>
                <p className="font-bold text-primary text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  ¡Solicitud enviada!
                </p>
                <p className="text-sm text-muted leading-relaxed">
                  <strong className="text-primary">{providerName}</strong> recibirá tu solicitud y te contactará para
                  confirmar disponibilidad y precio final.
                </p>
              </div>

              {/* Summary */}
              <div className="bg-primary/5 rounded-xl px-5 py-4 text-left w-full text-sm">
                <p className="font-semibold text-primary mb-2 text-xs uppercase tracking-wide">
                  Elementos solicitados
                </p>
                <div className="flex flex-col gap-1">
                  {quoteItems.map((i) => (
                    <div key={i.catalogItemId} className="flex justify-between text-xs">
                      <span className="text-muted">{i.name} ×{i.quantity}</span>
                      {i.priceMin !== null && (
                        <span className="font-semibold text-primary">{formatSoles(i.priceMin * i.quantity)}+</span>
                      )}
                    </div>
                  ))}
                </div>
                {hasPrice && (
                  <div className="border-t border-primary/15 mt-2 pt-2 flex justify-between text-xs font-bold text-primary">
                    <span>Total estimado</span>
                    <span className="text-secondary">{formatSoles(min)}{max > min ? `–${formatSoles(max)}` : ""}+</span>
                  </div>
                )}
              </div>

              {task && (
                <div className="bg-accent/10 rounded-xl px-4 py-3 text-xs text-secondary font-medium w-full text-left">
                  ✓ Cotización asociada al pendiente: {task.icon} {task.name}
                </div>
              )}

              <p className="text-xs text-muted">
                Referencia: <span className="font-mono text-primary font-semibold">{refId}</span>
              </p>

              <button
                onClick={() => { clearQuote(); onClose(); }}
                className="w-full bg-primary text-white font-semibold py-3 rounded-[var(--radius-btn)] hover:bg-primary/90 transition-colors text-sm"
              >
                Listo
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="flex flex-col gap-5 px-5 py-5">

              {/* Items summary */}
              <div className="bg-primary/5 rounded-xl p-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-3">
                  Elementos seleccionados ({quoteItems.reduce((a, i) => a + i.quantity, 0)})
                </p>
                <div className="flex flex-col gap-2">
                  {quoteItems.map((item) => (
                    <div key={item.catalogItemId} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                          {item.quantity}
                        </span>
                        <div className="min-w-0">
                          <p className="text-primary font-medium truncate">{item.name}</p>
                          <p className="text-muted flex items-center gap-0.5">
                            <Tag size={8} />{item.catalogCategory}
                          </p>
                        </div>
                      </div>
                      {item.priceMin !== null ? (
                        <p className="font-bold text-secondary shrink-0">
                          {formatSoles(item.priceMin * item.quantity)}+
                        </p>
                      ) : (
                        <p className="text-muted italic shrink-0">a consultar</p>
                      )}
                    </div>
                  ))}
                </div>
                {hasPrice && (
                  <div className="border-t border-primary/20 mt-3 pt-2 flex justify-between text-xs font-bold text-primary">
                    <span>Estimado total</span>
                    <span className="text-secondary">
                      {formatSoles(min)}{max > min ? ` – ${formatSoles(max)}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Event context summary */}
              {context && (context.guests || context.date || context.city || context.eventType || context.serviceDetails || context.time || context.hours || context.venueCapacity || context.sendDate || context.quantity) && (
                <div className="bg-primary/5 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-2">Contexto del evento</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
                    {context.guests     && <p><span className="font-medium text-primary">Invitados:</span> {context.guests}</p>}
                    {context.date       && <p><span className="font-medium text-primary">Fecha:</span> {context.date}</p>}
                    {context.city       && <p><span className="font-medium text-primary">Lugar:</span> {context.city}</p>}
                    {context.time       && <p><span className="font-medium text-primary">Horario:</span> {context.time}</p>}
                    {context.hours      && <p><span className="font-medium text-primary">Duración:</span> {context.hours}h</p>}
                    {context.venueCapacity && <p><span className="font-medium text-primary">Capacidad:</span> {context.venueCapacity} pax</p>}
                    {context.sendDate   && <p><span className="font-medium text-primary">Entrega:</span> {context.sendDate}</p>}
                    {context.quantity   && <p><span className="font-medium text-primary">Cantidad:</span> {context.quantity}</p>}
                    {context.eventType  && <p><span className="font-medium text-primary">Tipo:</span> {context.eventType}</p>}
                    {context.serviceDetails && <p className="col-span-2"><span className="font-medium text-primary">Detalle:</span> {context.serviceDetails}</p>}
                    {(context.refs?.length ?? 0) > 0 && (
                      <p className="col-span-2 text-accent font-medium">📎 {context.refs!.length} referencia(s) visual(es) adjunta(s)</p>
                    )}
                  </div>
                  {context.notes && (
                    <p className="mt-2 text-xs text-muted italic border-t border-primary/10 pt-2">"{context.notes}"</p>
                  )}
                </div>
              )}

              {/* Task context */}
              {task && (
                <div className="flex items-center gap-2 bg-accent/10 rounded-xl px-4 py-2.5 text-xs text-secondary font-semibold">
                  <span>{task.icon}</span>
                  <span>Se asociará al pendiente: {task.name}</span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-primary block mb-1.5">
                  Notas para el proveedor
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={"Ej: Necesito 15 mesas rústicas.\nEvento para 120 personas.\nMontaje el día anterior.\n¿Incluye transporte?"}
                  className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2.5 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50 resize-none"
                />
              </div>

              {/* Date + City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1.5">
                    Fecha del evento
                    {onboardingData.eventDate && (
                      <span className="ml-1 text-accent font-normal">(precargada)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1.5">
                    Lugar del evento
                    {onboardingData.city && (
                      <span className="ml-1 text-accent font-normal">(precargada)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lugar del evento o dirección"
                    className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold text-primary mb-1.5">Tus datos de contacto</p>
                <div className="flex flex-col gap-2">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo *"
                    className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+51 9XX XXX XXX"
                      className="text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-muted text-center -mt-2">
                El proveedor te contactará directamente. Sin intermediarios ni comisiones ocultas.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {!submitted && (
          <div className="shrink-0 px-5 py-4 border-t border-border bg-white">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-[var(--radius-btn)] hover:bg-primary/90 disabled:opacity-40 transition-all text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><FileText size={15} /> Enviar solicitud de cotización</>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
