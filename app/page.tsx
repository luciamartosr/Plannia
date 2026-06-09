import Link from "next/link";
import { ArrowRight, Search, CalendarHeart, MapPin, Users } from "lucide-react";
import Header from "@/components/ui/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative flex-1 flex items-center justify-center px-6 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/15 text-secondary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <CalendarHeart size={14} />
              Planifica. Coordina. Celebra.
            </div>

            <h1
              className="text-4xl md:text-6xl font-extrabold text-primary leading-tight mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Tu evento, sin
              <br />
              <span className="text-accent">complicaciones</span>
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-xl mx-auto mb-10">
              Obtén una estimación de presupuesto, encuentra proveedores verificados y mantén cada detalle bajo control.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-md mx-auto sm:max-w-none">
              <Link
                href="/onboarding/tipo"
                className="flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-[var(--radius-btn)] hover:bg-primary-light transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
              >
                <CalendarHeart size={20} />
                Organizar mi evento
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold px-8 py-4 rounded-[var(--radius-btn)] hover:bg-primary/8 transition-all text-base"
              >
                <Search size={20} />
                Buscar un proveedor
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-accent" />
                <span>+200 proveedores verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                <span>Cobertura nacional — todo el Perú</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarHeart size={16} className="text-accent" />
                <span>Bodas, quinceañeros, corporativos y más</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white border-t border-border px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-2xl md:text-3xl font-bold text-primary mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Así de simple
            </h2>
            <p className="text-muted mb-12">En 3 pasos tienes tu plan completo</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step) => (
                <div key={step.n} className="flex flex-col items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.n}
                  </div>
                  <h3 className="font-semibold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted text-center">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted">
        © 2026 Plannia · Planifica. Coordina. Celebra.
      </footer>
    </div>
  );
}

const STEPS = [
  {
    n: 1,
    title: "Cuéntanos tu evento",
    desc: "Responde 5 preguntas sobre tu tipo de evento, invitados, fecha y ciudad.",
  },
  {
    n: 2,
    title: "Recibe tu plan",
    desc: "Checklist personalizado, presupuesto estimado y marketplace pre-filtrado.",
  },
  {
    n: 3,
    title: "Coordina todo",
    desc: "Compara proveedores, gestiona invitados y lleva el control de tu presupuesto.",
  },
];
