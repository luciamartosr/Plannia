"use client";

import Link from "next/link";
import { X, Lock } from "lucide-react";

interface AuthGateModalProps {
  onClose: () => void;
  /** Optional context for the message */
  context?: "dashboard" | "checklist" | "proveedores" | "guardar" | "default";
}

const MESSAGES: Record<NonNullable<AuthGateModalProps["context"]>, { title: string; body: string }> = {
  dashboard:   { title: "Gestiona tu evento",     body: "Crea una cuenta para guardar tu evento y acceder al panel de gestión." },
  checklist:   { title: "Gestiona tus pendientes", body: "Crea una cuenta para marcar tareas, contratar proveedores y llevar el control de tu evento." },
  proveedores: { title: "Proveedores sugeridos",   body: "Crea una cuenta para ver los proveedores recomendados para tu evento y solicitar cotizaciones." },
  guardar:     { title: "Guarda tu evento",        body: "Crea una cuenta para guardar tu evento y continuar planificándolo cuando quieras." },
  default:     { title: "Crea tu cuenta",          body: "Crea una cuenta para guardar tu evento y continuar planificándolo." },
};

export default function AuthGateModal({ onClose, context = "default" }: AuthGateModalProps) {
  const { title, body } = MESSAGES[context];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-card)",
          padding: "32px 28px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", gap: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "var(--color-primary)", opacity: 0.1,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <div style={{ position: "absolute" }}>
                <Lock size={20} color="var(--color-primary)" />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2 }}>{title}</p>
              <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 3, lineHeight: 1.4, maxWidth: 300 }}>{body}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link
            href="/auth/register?from=resumen"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--color-primary)", color: "#fff",
              fontWeight: 700, fontSize: 14,
              padding: "14px 24px", borderRadius: "var(--radius-btn)",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(47,91,46,0.25)",
            }}
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/auth/login?from=resumen"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#fff", color: "var(--color-text)",
              fontWeight: 600, fontSize: 14,
              padding: "13px 24px", borderRadius: "var(--radius-btn)",
              border: "1.5px solid var(--color-border)",
              textDecoration: "none",
            }}
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Note */}
        <p style={{ fontSize: 11, color: "var(--color-muted)", textAlign: "center", lineHeight: 1.5 }}>
          Tu evento quedará guardado y podrás continuar desde donde lo dejaste.
        </p>
      </div>
    </div>
  );
}
