"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/stores/onboarding";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { Minus, Plus, ArrowLeft } from "lucide-react";

const QUICK_RANGES = [
  { label: "Hasta 30", value: 25 },
  { label: "30–80", value: 55 },
  { label: "80–150", value: 115 },
  { label: "Más de 150", value: 175 },
];

export default function InvitadosPage() {
  const router = useRouter();
  const { data, setGuestCount } = useOnboardingStore();
  const [count, setCount] = useState(data.guestCount || 50);
  const [inputValue, setInputValue] = useState(String(data.guestCount || 50));

  function adjust(delta: number) {
    const next = Math.max(1, count + delta);
    setCount(next);
    setInputValue(String(next));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    const parsed = parseInt(e.target.value);
    if (!isNaN(parsed) && parsed >= 1) {
      setCount(parsed);
    }
  }

  function handleInputBlur() {
    const parsed = parseInt(inputValue);
    const valid = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    setCount(valid);
    setInputValue(String(valid));
  }

  function handleContinue() {
    setGuestCount(count);
    router.push("/onboarding/servicios");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/onboarding/fecha" className="p-2 -ml-2 rounded-full hover:bg-border transition-colors text-muted hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <ProgressBar current={4} total={6} />
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-display)" }}>
          ¿Cuántos invitados esperas?
        </h1>
        <p className="text-sm text-muted">No te preocupes si no sabes el número exacto. Puedes ajustarlo después.</p>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-center gap-6 bg-white border border-border rounded-[var(--radius-card)] p-6">
        <button
          onClick={() => adjust(-10)}
          className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
        >
          <Minus size={18} />
        </button>
        <div className="text-center">
          <input
            type="number"
            min={1}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-28 text-center text-5xl font-bold text-primary bg-transparent focus:outline-none focus:border-b-2 focus:border-primary"
            style={{ fontFamily: "var(--font-display)" }}
          />
          <p className="text-sm text-muted mt-1">invitados</p>
        </div>
        <button
          onClick={() => adjust(10)}
          className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Quick ranges */}
      <div>
        <p className="text-xs text-muted mb-3 font-medium uppercase tracking-wide">Acceso rápido</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => { setCount(r.value); setInputValue(String(r.value)); }}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                count === r.value
                  ? "border-primary bg-primary text-white"
                  : "border-border text-muted hover:border-primary/50",
              ].join(" ")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Button fullWidth onClick={handleContinue} size="lg">
        Continuar →
      </Button>
    </div>
  );
}
