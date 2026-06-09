"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useOnboardingStore, EventCategory, EventType } from "@/stores/onboarding";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

const CATEGORIES: { id: EventCategory; label: string; icon: string; desc: string }[] = [
  { id: "social",      label: "Social",      icon: "🎉", desc: "Bodas, cumpleaños, aniversarios..." },
  { id: "corporativo", label: "Corporativo", icon: "🏢", desc: "Empresas, conferencias, lanzamientos..." },
  { id: "masivo",      label: "Masivo",      icon: "🎭", desc: "Ferias, conciertos, festivales..." },
  { id: "otro",        label: "Otro",        icon: "✨", desc: "Cuéntame más..." },
];

const SUBTYPES: Record<EventCategory, { id: EventType; label: string; icon: string }[]> = {
  social: [
    { id: "boda",               label: "Boda",               icon: "💍" },
    { id: "cumpleanos_adulto",  label: "Cumpleaños adulto",  icon: "🎂" },
    { id: "cumpleanos_infantil",label: "Cumpleaños infantil",icon: "🎈" },
    { id: "aniversario",        label: "Aniversario",        icon: "💑" },
    { id: "baby_shower",        label: "Baby Shower",        icon: "🍼" },
    { id: "graduacion",         label: "Graduación",         icon: "🎓" },
  ],
  corporativo: [
    { id: "evento_corporativo", label: "Evento corporativo",    icon: "🤝" },
    { id: "conferencia",        label: "Conferencia",           icon: "🎤" },
    { id: "seminario",          label: "Seminario / Taller",    icon: "📋" },
    { id: "lanzamiento",        label: "Lanzamiento de producto",icon: "🚀" },
  ],
  masivo: [
    { id: "feria",    label: "Feria / Exposición",  icon: "🏛️" },
    { id: "concierto",label: "Concierto / Festival", icon: "🎸" },
  ],
  otro: [],
};

export default function TipoPage() {
  const router = useRouter();
  const { data, setEventCategory, setEventType, setEventName } = useOnboardingStore();

  const [category, setCategory] = useState<EventCategory | null>(data.eventCategory);
  const [subtype, setSubtype] = useState<EventType | null>(data.eventType);
  const [custom, setCustom] = useState(data.eventTypeCustom);
  const [eventName, setEventNameLocal] = useState(data.eventName);

  function selectCategory(cat: EventCategory) {
    setCategory(cat);
    setSubtype(null);
    setCustom("");
  }

  function handleContinue() {
    if (!category) return;
    setEventCategory(category);
    if (category === "otro") {
      setEventType("otro", custom);
    } else if (subtype) {
      setEventType(subtype);
    }
    setEventName(eventName.trim());
    router.push("/onboarding/ciudad");
  }

  const canContinue =
    category === "otro" ? custom.trim().length > 0 : !!subtype;

  const subtypes = category && category !== "otro" ? SUBTYPES[category] : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-border transition-colors text-muted hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <ProgressBar current={1} total={6} />
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
          ¿Qué tipo de evento vas a organizar?
        </h1>
        <p className="text-sm text-muted">Puedes cambiar esto después</p>
      </div>

      {/* Step 1 — Category */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategory(cat.id)}
            className={[
              "flex flex-col items-start gap-1 p-4 rounded-[var(--radius-card)] border-2 text-left transition-all duration-150 cursor-pointer",
              category === cat.id
                ? "border-primary bg-primary/8 shadow-md"
                : "border-border bg-white hover:border-primary/40 hover:shadow-sm",
            ].join(" ")}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="font-semibold text-primary text-sm" style={{ fontFamily: "var(--font-display)" }}>
              {cat.label}
            </span>
            <span className="text-xs text-muted">{cat.desc}</span>
          </button>
        ))}
      </div>

      {/* Step 2 — Subtypes (animated in) */}
      {category && category !== "otro" && subtypes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            ¿Cuál específicamente?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {subtypes.map((st) => (
              <button
                key={st.id}
                onClick={() => setSubtype(st.id)}
                className={[
                  "flex items-center gap-3 p-3 rounded-[var(--radius-card)] border-2 text-left transition-all duration-150 cursor-pointer",
                  subtype === st.id
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border bg-white hover:border-primary/40",
                ].join(" ")}
              >
                <span className="text-lg shrink-0">{st.icon}</span>
                <span className="font-medium text-primary text-sm leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {st.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Otro — free text */}
      {category === "otro" && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            ¿Qué tipo de evento es?
          </p>
          <input
            type="text"
            placeholder="Describe tu evento..."
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full px-4 py-3 border-2 border-border rounded-[var(--radius-btn)] text-sm focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
        </div>
      )}

      {/* Event name — appears once a type is selected */}
      {canContinue && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            ¿Cómo quieres llamar a tu evento? <span className="normal-case font-normal">(opcional)</span>
          </p>
          <input
            type="text"
            placeholder="Ej: Cumpleaños Alfredo, Boda García-López..."
            value={eventName}
            onChange={(e) => setEventNameLocal(e.target.value)}
            className="w-full px-4 py-3 border-2 border-border rounded-[var(--radius-btn)] text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      <Button fullWidth disabled={!canContinue} onClick={handleContinue} size="lg">
        Continuar →
      </Button>
    </div>
  );
}
