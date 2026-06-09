"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { useUserStore } from "@/stores/user";

export default function Header() {
  const session = useUserStore((s) => s.session);

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-surface border-b border-border">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <Image src="/logo.svg" alt="Plannia" width={34} height={34} className="rounded-xl" />
        <span
          className="text-lg font-semibold text-primary tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Plannia
        </span>
      </Link>

      {/* Middle nav */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link
          href="/marketplace"
          className="text-muted hover:text-primary transition-colors duration-200"
        >
          Proveedores
        </Link>
        <Link
          href="/mis-eventos"
          className="text-muted hover:text-primary transition-colors duration-200"
        >
          Mis eventos
        </Link>
      </nav>

      {/* Right — auth section */}
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm text-muted hidden md:inline">
              Hola,{" "}
              <span className="font-semibold text-text">{session.nickname}</span>
            </span>
            <Link
              href="/dashboard/perfil"
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={15} className="text-primary" />
              </div>
              <span className="hidden md:inline">Mi perfil</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-sm text-muted hover:text-primary transition-colors duration-200"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[var(--radius-btn)] hover:bg-primary-light transition-colors duration-200 shadow-sm"
            >
              Crear cuenta
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
