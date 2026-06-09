"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/stores/onboarding";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { differenceInDays, parseISO } from "date-fns";
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { getRecommendations, Recommendation } from "@/lib/recommendations";

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const styles = {
    positive: {
      wrapper: "bg-accent/10 border-accent/30",
      icon: <CheckCircle size={16} className="text-secondary shrink-0 mt-0.5" />,
      title: "text-secondary",
      body: "text-secondary/80",
    },
    warning: {
      wrapper: "bg-warning border-warning-text/20",
      icon: <AlertTriangle size={16} className="text-warning-text shrink-0 mt-0.5" />,
      title: "text-warning-text",
      body: "text-warning-text/80",
    },
    tip: {
      wrapper: "bg-primary/8 border-primary/20",
      icon: <Lightbulb size={16} className="text-primary shrink-0 mt-0.5" />,
      title: "text-primary",
      body: "text-primary/70",
    },
  }[rec.type];

  return (
    <div className={`flex gap-3 border rounded-[var(--radius-card)] p-4 ${styles.wrapper}`}>
      {styles.icon}
      <div>
        <p className={`text-sm font-semibold mb-0.5 ${styles.title}`}>{rec.title}</p>
        <p className={`text-xs leading-relaxed ${styles.body}`}>{rec.body}</p>
      </div>
    </div>
  );
}

export default function FechaPage() {
  const router = useRouter();
  const { data, setEventDate } = useOnboardingStore();
  const [date, setDate] = useState(data.eventDate ?? "");
  const [unknown, setUnknown] = useState(data.unknownDate);

  const today = new Date().toISOString().split("T")[0];
  const daysUntil = date ? differenceInDays(parseISO(date), new Date()) : null;
  const isSoon = daysUntil !== null && daysUntil >= 0 && daysUntil < 30;

  const recommendations = getRecommendations(data.city, date || null, data.eventType);

  function handleContinue() {
    setEventDate(unknown ? null : date, unknown);
    router.push("/onboarding/invitados");
  }

  const canContinue = unknown || !!date;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/onboarding/ciudad" className="p-2 -ml-2 rounded-full hover:bg-border transition-colors text-muted hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <ProgressBar current={3} total={6} />
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
          ¿Cuándo será tu evento?
        </h1>
        <p className="text-sm text-muted">Puedes dejarlo en blanco si aún no tienes fecha definida</p>
      </div>

      <div className="flex flex-col gap-4">
        {!unknown && (
          <div className="bg-white border border-border rounded-[var(--radius-card)] p-4">
            <label className="block text-sm font-medium text-primary mb-2">Fecha del evento</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-[var(--radius-btn)] text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        )}

        {isSoon && !unknown && (
          <div className="flex gap-3 border border-warning-text/20 rounded-[var(--radius-card)] p-4 bg-warning">
            <AlertTriangle size={16} className="text-warning-text shrink-0 mt-0.5" />
            <p className="text-xs text-warning-text">
              <strong>Tu evento está cerca</strong> — algunos proveedores pueden tener disponibilidad limitada. Contáctalos cuanto antes.
            </p>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => { setUnknown((v) => !v); setDate(""); }}
            className={["w-10 h-6 rounded-full transition-colors relative", unknown ? "bg-primary" : "bg-border"].join(" ")}
          >
            <span className={["absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", unknown ? "translate-x-5" : "translate-x-1"].join(" ")} />
          </div>
          <span className="text-sm text-muted">Todavía no lo sé</span>
        </label>
      </div>

      {/* Plannia recommendations */}
      {recommendations.length > 0 && date && !unknown && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-accent" />
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">Plannia recomienda</p>
          </div>
          {recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} />
          ))}
        </div>
      )}

      <Button fullWidth disabled={!canContinue} onClick={handleContinue} size="lg">
        Continuar →
      </Button>
    </div>
  );
}
