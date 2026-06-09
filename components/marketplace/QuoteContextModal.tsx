"use client";

import { useRef, useState } from "react";
import { X, ImagePlus, XCircle, ChevronDown } from "lucide-react";
import {
  CONTEXT_CONFIG, CATEGORY_TO_SERVICE_KEY, ContextFieldDef,
} from "@/lib/quoteContextConfig";
import { QuoteContext } from "@/stores/quoteRequest";
import { useOnboardingStore } from "@/stores/onboarding";

interface Props {
  providerCategory: string;
  providerName: string;
  itemName: string;
  onConfirm: (ctx: QuoteContext) => void;
  onCancel: () => void;
}

export default function QuoteContextModal({
  providerCategory, providerName, itemName, onConfirm, onCancel,
}: Props) {
  const { data: ob } = useOnboardingStore();

  const serviceKey = CATEGORY_TO_SERVICE_KEY[providerCategory] ?? "otros";
  const config = CONTEXT_CONFIG[serviceKey];

  // ── Pre-fill from onboarding where available ──────────────────────────────
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of config.fields) {
      if (f.key === "guests" && ob.guestCount) init.guests = String(ob.guestCount);
      if (f.key === "date" && ob.eventDate) init.date = ob.eventDate;
      if (f.key === "city" && ob.city) init.city = ob.city;
    }
    return init;
  });

  const [notes, setNotes] = useState("");
  const [refs, setRefs] = useState<{ url: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 4 - refs.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setRefs((r) => [...r, { url: ev.target!.result as string, name: file.name }]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removeRef(i: number) {
    setRefs((r) => r.filter((_, idx) => idx !== i));
  }

  const requiredFields = config.fields.filter((f) => f.required);
  const allRequiredFilled = requiredFields.every((f) => (values[f.key] ?? "").trim() !== "");

  function handleConfirm() {
    if (!allRequiredFilled) return;
    const ctx: QuoteContext = {
      guests:         values.guests ? Number(values.guests) : undefined,
      date:           values.date || undefined,
      city:           values.city || undefined,
      time:           values.time || undefined,
      hours:          values.hours ? Number(values.hours) : undefined,
      venueCapacity:  values.venueCapacity ? Number(values.venueCapacity) : undefined,
      sendDate:       values.sendDate || undefined,
      quantity:       values.quantity ? Number(values.quantity) : undefined,
      serviceDetails: values.serviceDetails || undefined,
      eventType:      values.eventType || undefined,
      refs:           refs.map((r) => r.url),
      notes:          notes.trim() || undefined,
    };
    onConfirm(ctx);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
        {/* Card */}
        <div
          className="bg-background w-full max-w-lg rounded-[var(--radius-card)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary px-5 py-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-lg">{config.icon}</span>
                <p className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-display)" }}>
                  Información para tu solicitud
                </p>
              </div>
              <p className="text-white/70 text-xs">
                {config.label} · {providerName}
              </p>
              <p className="text-white/50 text-[10px] mt-0.5 italic">"{itemName}"</p>
            </div>
            <button onClick={onCancel} className="text-white/60 hover:text-white transition-colors shrink-0 mt-0.5">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

            <p className="text-xs text-muted leading-snug -mt-1">
              Esta información se enviará al proveedor junto con tu solicitud de cotización para que
              pueda preparar una propuesta adecuada.
            </p>

            {/* Dynamic fields */}
            <div className="grid grid-cols-2 gap-3">
              {config.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(v) => set(field.key, v)}
                />
              ))}
            </div>

            {/* Visual references */}
            {config.allowRefs && (
              <div>
                <p className="text-xs font-semibold text-primary mb-1.5">
                  Referencias visuales
                  <span className="font-normal text-muted ml-1">(opcional, máx. 4)</span>
                </p>
                {config.refHint && (
                  <p className="text-[11px] text-muted mb-2 leading-snug">{config.refHint}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {refs.map((ref, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ref.url} alt={ref.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeRef(i)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <XCircle size={10} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {refs.length < 4 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted hover:border-primary hover:text-primary transition-colors"
                    >
                      <ImagePlus size={18} />
                      <span className="text-[9px] font-semibold">Subir</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-primary block mb-1.5">
                Comentarios adicionales
                <span className="font-normal text-muted ml-1">(opcional)</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={config.notesPlaceholder}
                className="w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2.5 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/45 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border bg-white flex flex-col gap-2 shrink-0">
            <button
              onClick={handleConfirm}
              disabled={!allRequiredFilled}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 rounded-[var(--radius-btn)] hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Agregar a mi solicitud
            </button>
            <button
              onClick={onCancel}
              className="w-full text-center text-xs text-muted hover:text-primary transition-colors py-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Individual field renderer ─────────────────────────────────────────────────

function FieldInput({
  field, value, onChange,
}: {
  field: ContextFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const baseClass =
    "w-full text-sm border border-border rounded-[var(--radius-btn)] px-3 py-2 focus:outline-none focus:border-primary bg-white text-primary placeholder:text-muted/50";

  // Full-width fields
  const fullWidth =
    field.key === "serviceDetails" || field.key === "eventType";

  const input = (() => {
    if (field.type === "select" && field.options) {
      return (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseClass + " appearance-none pr-8"}
          >
            <option value="">Seleccionar…</option>
            {field.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      );
    }
    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={baseClass}
        min={field.type === "number" ? 1 : undefined}
      />
    );
  })();

  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <label className="text-xs font-semibold text-primary block mb-1">
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {input}
    </div>
  );
}
