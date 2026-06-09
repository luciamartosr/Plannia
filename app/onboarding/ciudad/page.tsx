"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/stores/onboarding";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { ArrowLeft } from "lucide-react";

const SUGGESTED_CITIES = ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura", "Chiclayo", "Iquitos"];

export default function CiudadPage() {
  const router = useRouter();
  const { data, setCity } = useOnboardingStore();
  const [city, setCityInput] = useState(data.city);
  const [isDestination, setIsDestination] = useState(data.isDestinationEvent);

  function handleContinue() {
    setCity(city, isDestination);
    router.push("/onboarding/fecha");
  }

  const filtered = city.length > 0
    ? SUGGESTED_CITIES.filter((c) => c.toLowerCase().startsWith(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase())
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/onboarding/tipo" className="p-2 -ml-2 rounded-full hover:bg-border transition-colors text-muted hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <ProgressBar current={2} total={6} />
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
          ¿En qué ciudad será tu evento?
        </h1>
        <p className="text-sm text-muted">Priorizamos proveedores locales para tu zona</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Busca tu ciudad..."
            value={city}
            onChange={(e) => setCityInput(e.target.value)}
            className="w-full px-4 py-3 border-2 border-border rounded-[var(--radius-btn)] text-sm focus:outline-none focus:border-primary transition-colors"
          />
          {filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-[var(--radius-btn)] shadow-lg z-10">
              {filtered.map((c) => (
                <button
                  key={c}
                  onClick={() => setCityInput(c)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/8 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCityInput(c)}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all",
                city === c ? "border-primary bg-primary text-white" : "border-border text-muted hover:border-primary/50",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="bg-white border border-border rounded-[var(--radius-card)] p-4">
          <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
            <div>
              <p className="text-sm font-medium text-primary">¿Vas a traer proveedores de otra ciudad?</p>
              <p className="text-xs text-muted mt-0.5">Evento Destino</p>
            </div>
            <div
              onClick={() => setIsDestination((v) => !v)}
              className={["w-10 h-6 rounded-full transition-colors relative shrink-0", isDestination ? "bg-primary" : "bg-border"].join(" ")}
            >
              <span className={["absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", isDestination ? "translate-x-5" : "translate-x-1"].join(" ")} />
            </div>
          </label>
        </div>

        {isDestination && (
          <Alert variant="warning">
            Trasladar proveedores puede incrementar tu presupuesto en costos de viáticos y transporte. En destinos como Cusco, el sobrecosto puede llegar al <strong>35%</strong>.
          </Alert>
        )}
      </div>

      <Button fullWidth disabled={!city.trim()} onClick={handleContinue} size="lg">
        Continuar →
      </Button>
    </div>
  );
}
