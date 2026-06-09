"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useUserStore } from "@/stores/user";

export default function RegisterPage() {
  const router = useRouter();
  const register = useUserStore((s) => s.register);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const result = register(fullName.trim(), email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Error al crear la cuenta.");
      return;
    }
    router.push("/auth/welcome");
  }

  const inputClass =
    "w-full border border-border rounded-[var(--radius-input)] px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-surface transition-all";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm bg-surface rounded-[var(--radius-card)] p-8 flex flex-col gap-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
      >
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
            Crea tu cuenta
          </h1>
          <p className="text-sm text-muted mt-1">Empieza a planificar tu evento</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Nombre completo</label>
            <input
              type="text"
              required
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ana García López"
            />
          </div>

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
                minLength={6}
                className={inputClass + " pr-10"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
