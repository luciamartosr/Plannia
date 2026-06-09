"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOnboardingStore, ServiceType } from "@/stores/onboarding";
import { getSuggestedServices, getServiceReason } from "@/lib/serviceSuggestions";
import { estimateBudget } from "@/lib/budget";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { ArrowLeft, Sparkles } from "lucide-react";

const ALL_SERVICES: { id: ServiceType; label: string; icon: string }[] = [
  { id: "locales_espacios",       label: "Locales y Espacios",           icon: "🏛️" },
  { id: "catering",               label: "Catering",                     icon: "🍽️" },
  { id: "licor_bebidas",          label: "Licor y Bebidas",              icon: "🍾" },
  { id: "torta_postres",          label: "Torta y Postres",              icon: "🎂" },
  { id: "fotografia_video",       label: "Fotografía y Video",           icon: "📷" },
  { id: "musica_entretenimiento", label: "Música y Entretenimiento",     icon: "🎵" },
  { id: "decoracion_flores",      label: "Decoración y Flores",          icon: "🌸" },
  { id: "sonido_iluminacion",     label: "Sonido, Iluminación y Pantallas", icon: "💡" },
  { id: "invitaciones_papeleria", label: "Invitaciones y Papelería",     icon: "✉️" },
  { id: "transporte",             label: "Transporte",                   icon: "🚌" },
  { id: "vestuario_belleza",      label: "Vestuario y Belleza",          icon: "👗" },
  { id: "personal_eventos",       label: "Personal para Eventos",        icon: "🤝" },
  { id: "seguridad",              label: "Seguridad",                    icon: "🛡️" },
  { id: "planeacion_coordinacion",label: "Planeación y Coordinación",    icon: "📋" },
  { id: "otros",                  label: "Otros",                        icon: "➕" },
];

export default function ServiciosPage() {
  const router = useRouter();
  const { data, toggleService } = useOnboardingStore();
  const { services, guestCount, city, isDestinationEvent, eventType } = data;

  const suggested = getSuggestedServices(eventType);
  const hasExterior = services.includes("locales_espacios");
  const allSuggestedSelected = suggested.length > 0 && suggested.every((s) => services.includes(s));

  function toggleAllSuggested() {
    if (allSuggestedSelected) {
      suggested.forEach((s) => { if (services.includes(s)) toggleService(s); });
    } else {
      suggested.forEach((s) => { if (!services.includes(s)) toggleService(s); });
    }
  }

  function handleCreate() {
    const budget = estimateBudget(city, guestCount, services, isDestinationEvent);
    useOnboardingStore.getState().setEstimatedBudget(budget.min, budget.max);
    router.push("/onboarding/presupuesto");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/onboarding/invitados" className="p-2 -ml-2 rounded-full hover:bg-border transition-colors text-muted hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <ProgressBar current={5} total={6} />
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
          ¿Qué servicios necesitas?
        </h1>
        <p className="text-sm text-muted">Selecciona todo lo que necesites. Puedes agregar más después.</p>
      </div>

      {/* Plannia suggestions */}
      {suggested.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-[var(--radius-card)] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <p className="text-sm font-semibold text-primary">Plannia sugiere para tu evento</p>
            </div>
            <button
              onClick={toggleAllSuggested}
              className="text-xs font-semibold text-primary border border-primary rounded-full px-3 py-1 hover:bg-primary/8 transition-colors shrink-0"
            >
              {allSuggestedSelected ? "Quitar todos" : "Agregar todos"}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {suggested.map((svcId) => {
              const svc = ALL_SERVICES.find((s) => s.id === svcId);
              if (!svc) return null;
              const reason = getServiceReason(svcId, eventType);
              const selected = services.includes(svcId);
              return (
                <button
                  key={svcId}
                  onClick={() => toggleService(svcId)}
                  className={[
                    "flex items-start gap-3 p-3 rounded-[var(--radius-btn)] border-2 text-left transition-all duration-150 cursor-pointer",
                    selected
                      ? "border-primary bg-primary/8"
                      : "border-primary/30 bg-white hover:border-primary/60",
                  ].join(" ")}
                >
                  <span className="text-lg shrink-0 mt-0.5">{svc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary text-sm" style={{ fontFamily: "var(--font-display)" }}>
                        {svc.label}
                      </span>
                      {selected && (
                        <span className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shrink-0">
                          <svg width="8" height="7" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    {reason && <p className="text-xs text-muted mt-0.5 leading-snug">{reason}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* All services grid */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Todos los servicios</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_SERVICES.map((svc) => {
            const selected = services.includes(svc.id);
            return (
              <button
                key={svc.id}
                onClick={() => toggleService(svc.id)}
                className={[
                  "flex flex-col items-center gap-2 p-4 rounded-[var(--radius-card)] border-2 transition-all duration-150 cursor-pointer relative",
                  selected
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border bg-white hover:border-primary/40",
                ].join(" ")}
              >
                {selected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                <span className="text-2xl">{svc.icon}</span>
                <span className="text-xs font-semibold text-primary text-center" style={{ fontFamily: "var(--font-display)" }}>
                  {svc.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert for exterior events */}
      {hasExterior && (
        <div className="bg-warning border border-warning-text/20 rounded-[var(--radius-card)] p-4">
          <p className="text-sm font-semibold text-warning-text mb-2">⚡ Para eventos en exteriores, considera también:</p>
          <ul className="text-sm text-warning-text space-y-1">
            <li>• <strong>Grupos electrógenos</strong> — S/ 1,200 – S/ 2,500 por 12 horas</li>
            <li>• <strong>Toldería</strong> — protección de lluvia y sol</li>
            <li>• <strong>Sonido e iluminación exterior</strong> — equipos resistentes a la intemperie</li>
          </ul>
        </div>
      )}

      <Button
        fullWidth
        disabled={services.length === 0}
        onClick={handleCreate}
        size="lg"
        className="mt-2"
      >
        Crear mi plan de evento →
      </Button>
    </div>
  );
}
