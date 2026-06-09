"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user";
import Header from "@/components/ui/Header";

export default function PerfilPage() {
  const router = useRouter();
  const session = useUserStore((s) => s.session);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const logout = useUserStore((s) => s.logout);

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(false);
  const [notifApp, setNotifApp] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setFullName(session.fullName);
    setNickname(session.nickname);
    setPhone(session.phone);
    setCity(session.city);
    setNotifEmail(session.notifEmail);
    setNotifWhatsapp(session.notifWhatsapp);
    setNotifApp(session.notifApp);
  }, [session, router]);

  if (!session) return null;

  function handleSave() {
    updateProfile({ fullName, nickname, phone, city });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  const inputClass =
    "w-full border border-border rounded-[var(--radius-input)] px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-surface transition-all";

  const disabledInputClass =
    "w-full border border-border rounded-[var(--radius-input)] px-4 py-3 text-sm bg-background text-muted cursor-not-allowed";

  const cardClass =
    "bg-surface border border-border rounded-[var(--radius-card)] p-6 flex flex-col gap-5";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-7">
        {/* Back link */}
        <Link href="/dashboard" className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-1">
          ← Volver al panel
        </Link>

        {/* Page title */}
        <h1
          className="text-2xl font-bold text-text"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Mi perfil
        </h1>

        {/* Card 1 — Personal info */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">Información personal</h2>
            <button
              onClick={handleSave}
              className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[var(--radius-btn)] hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{ boxShadow: "0 2px 8px rgba(47,91,46,0.25)" }}
            >
              {saved ? "✓ Guardado" : "Guardar cambios"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Nombre completo</label>
              <input
                type="text"
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Cómo te llamamos</label>
              <input
                type="text"
                className={inputClass}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <p className="text-xs text-muted">El nombre que Plannia usará contigo</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Correo electrónico</label>
              <input
                type="email"
                className={disabledInputClass}
                value={session.email}
                disabled
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Celular</label>
              <input
                type="tel"
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 999 999 999"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-text">Ciudad</label>
              <input
                type="text"
                className={inputClass}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lima, Arequipa..."
              />
            </div>
          </div>
        </div>

        {/* Card 2 — Notifications */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-text">Notificaciones</h2>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-primary"
                checked={notifEmail}
                onChange={(e) => {
                  setNotifEmail(e.target.checked);
                  updateProfile({ notifEmail: e.target.checked });
                }}
              />
              <div>
                <p className="text-sm font-medium text-text">Correo electrónico</p>
                <p className="text-xs text-muted">Recordatorios y novedades de tu evento</p>
              </div>
            </label>

            {/* WhatsApp — disabled */}
            <label className="flex items-start gap-3 opacity-60 cursor-not-allowed">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-primary"
                checked={notifWhatsapp}
                disabled
                onChange={(e) => {
                  setNotifWhatsapp(e.target.checked);
                  updateProfile({ notifWhatsapp: e.target.checked });
                }}
              />
              <div>
                <p className="text-sm font-medium text-text">WhatsApp</p>
                <p className="text-xs text-muted">Próximamente disponible</p>
              </div>
            </label>

            {/* In-app */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-primary"
                checked={notifApp}
                onChange={(e) => {
                  setNotifApp(e.target.checked);
                  updateProfile({ notifApp: e.target.checked });
                }}
              />
              <div>
                <p className="text-sm font-medium text-text">Notificaciones en Plannia</p>
                <p className="text-xs text-muted">Alertas dentro de la plataforma</p>
              </div>
            </label>
          </div>
        </div>

        {/* Card 3 — Session */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-text">Sesión</h2>
          <button
            onClick={handleLogout}
            className="self-start border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-[var(--radius-btn)] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
