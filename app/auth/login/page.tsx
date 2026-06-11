"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useUserStore } from "@/stores/user";
import { useEventsStore } from "@/stores/events";
import { useOnboardingStore } from "@/stores/onboarding";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const login = useUserStore((s) => s.login);
  const createEvent = useEventsStore((s) => s.createEvent);
  const activeEventId = useEventsStore((s) => s.activeEventId);
  const onboardingData = useOnboardingStore((s) => s.data);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    const result = login(email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Error al iniciar sesión.");
      return;
    }
    if (from === "resumen" && onboardingData.eventType) {
      if (!activeEventId) createEvent(onboardingData);
      router.push("/onboarding/resumen");
    } else if (from === "dashboard") {
      router.push("/dashboard");
    } else {
      router.push("/mis-eventos");
    }
  }

  const inputClass =
    "w-full border border-border rounded-[var(--radius-input)] px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-surface transition-all";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface rounded-[var(--radius-card)] p-8 flex flex-col gap-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center">
          <span className="text-2xl">🗓️</span>
          <span
            className="text-xl font-semibold text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Plannia
          </span>
        </Link>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-text">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-muted mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Correo electrónico</label>
            <input
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ana@ejemplo.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className={inputClass + " pr-10"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-[var(--radius-btn)] hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ boxShadow: "0 2px 8px rgba(47,91,46,0.3)" }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">
            Créala gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
