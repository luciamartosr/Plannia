"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const session = useUserStore((s) => s.session);
  const setNickname = useUserStore((s) => s.setNickname);

  const [nickname, setNicknameValue] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/auth/register");
      return;
    }
    setNicknameValue(session.nickname);
  }, [session, router]);

  if (!session) return null;

  function handleContinue(name: string) {
    setNickname(name);
    router.push(from === "resumen" ? "/onboarding/resumen" : "/onboarding/nuevo");
  }

  const inputClass =
    "w-full border-2 border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        {/* Emoji */}
        <span className="text-5xl">🎉</span>

        {/* Heading */}
        <h1
          className="text-2xl font-bold text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ¡Hola, {session.fullName.split(" ")[0]}!
        </h1>

        <p className="text-base text-primary font-medium">
          ¿Cómo te gustaría que te llamemos?
        </p>

        <p className="text-sm text-muted">
          Plannia usará este nombre para personalizar toda tu experiencia de planificación.
        </p>

        {/* Input */}
        <div className="w-full flex flex-col gap-1 text-left">
          <label className="text-sm font-medium text-primary">Tu nombre o apodo</label>
          <input
            type="text"
            className={inputClass}
            value={nickname}
            onChange={(e) => setNicknameValue(e.target.value)}
          />
        </div>

        {/* Primary button */}
        <button
          onClick={() => handleContinue(nickname.trim() || session.fullName.split(" ")[0])}
          className="w-full bg-primary text-white font-bold py-3 rounded-[var(--radius-btn)] hover:bg-primary/90 transition-colors"
        >
          ¡Vamos a planificar! →
        </button>

        {/* Skip link */}
        <button
          onClick={() => handleContinue(session.fullName.split(" ")[0])}
          className="text-sm text-muted hover:text-primary transition-colors underline"
        >
          Continuar con mi nombre completo
        </button>
      </div>
    </div>
  );
}
