"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useOnboardingStore, BudgetType } from "@/stores/onboarding";
import { formatSoles } from "@/lib/budget";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { ArrowLeft, ChevronRight } from "lucide-react";

const OPTIONS: { id: BudgetType; label: string; desc: string; icon: string }[] = [
  {
    id: "defined",
    label: "Sí, tengo un presupuesto máximo",
    desc: "Sé exactamente cuánto quiero gastar.",
    icon: "🎯",
  },
  {
    id: "approximate",
    label: "Tengo una idea aproximada",
    desc: "Tengo un rango en mente, pero puede ajustarse.",
    icon: "💡",
  },
  {
    id: "unsure",
    label: "No estoy seguro",
    desc: "Plannia estimará el presupuesto según tus servicios.",
    icon: "🤔",
  },
  {
    id: "none",
    label: "No tengo restricciones",
    desc: "El presupuesto no es un limitante por ahora.",
    icon: "🚀",
  },
];

// Quick amount chips
const QUICK_AMOUNTS = [5000, 10000, 20000, 30000, 50000, 80000, 100000];

function formatInput(val: string): string {
  const num = parseInt(val.replace(/\D/g, ""), 10);
  return isNaN(num) ? "" : num.toLocaleString("es-PE");
}

export default function PresupuestoPage() {
  const router = useRouter();
  const { data, setBudget } = useOnboardingStore();

  const [selected, setSelected] = useState<BudgetType | null>(data.budgetType);
  const [inputRaw, setInputRaw] = useState<string>(
    data.budgetDefined ? String(data.budgetDefined) : ""
  );

  const parsedAmount = parseInt(inputRaw.replace(/\D/g, ""), 10);
  const validAmount = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : null;

  const canContinue =
    selected === "defined" ? validAmount !== null :
    selected !== null;

  function handleContinue() {
    if (!selected) return;
    setBudget(selected, selected === "defined" ? (validAmount ?? undefined) : undefined);
    // Signal the resumen page to play the intro animation
    if (typeof window !== "undefined") {
      sessionStorage.setItem("plannia-show-intro", "1");
    }
    router.push("/onboarding/resumen");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/onboarding/servicios" className="p-2 -ml-2 rounded-full hover:bg-border transition-colors text-muted hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <ProgressBar current={6} total={6} />
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
          ¿Tienes un presupuesto definido?
        </h1>
        <p className="text-sm text-muted">Esto nos ayuda a recomendarte proveedores dentro de tu rango.</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={[
              "flex items-center gap-4 p-4 rounded-[var(--radius-card)] border-2 text-left transition-all duration-150 cursor-pointer",
              selected === opt.id
                ? "border-primary bg-primary/8 shadow-sm"
                : "border-border bg-white hover:border-primary/40",
            ].join(" ")}
          >
            <span className="text-2xl shrink-0">{opt.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-primary text-sm" style={{ fontFamily: "var(--font-display)" }}>
                {opt.label}
              </p>
              <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
            </div>
            {selected === opt.id && (
              <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Budget input — only when "defined" */}
      {selected === "defined" && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
              ¿Cuál es tu presupuesto máximo?
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">S/</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatInput(inputRaw)}
                onChange={(e) => setInputRaw(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-10 pr-4 py-4 border-2 border-border rounded-[var(--radius-btn)] text-xl font-bold text-primary focus:outline-none focus:border-primary transition-colors bg-white"
                style={{ fontFamily: "var(--font-display)" }}
                autoFocus
              />
            </div>
            {validAmount && (
              <p className="text-xs text-muted mt-2">
                {formatSoles(validAmount)} en total para tu evento
              </p>
            )}
          </div>

          {/* Quick chips */}
          <div>
            <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wide">Montos frecuentes</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setInputRaw(String(amt))}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all",
                    parsedAmount === amt
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted hover:border-primary/50",
                  ].join(" ")}
                >
                  {formatSoles(amt)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info box for "unsure" */}
      {selected === "unsure" && (
        <div className="bg-primary/5 border border-primary/20 rounded-[var(--radius-card)] p-4">
          <p className="text-sm font-semibold text-primary mb-1">Plannia estimará tu presupuesto</p>
          <p className="text-xs text-muted leading-relaxed">
            Basándonos en los servicios que elegiste, tu ciudad y la cantidad de invitados,
            calcularemos un rango de referencia para que puedas planificar con tranquilidad.
            Podrás ajustarlo en cualquier momento desde el dashboard.
          </p>
        </div>
      )}

      <Button fullWidth disabled={!canContinue} onClick={handleContinue} size="lg">
        Ver mi resumen →
      </Button>
    </div>
  );
}
