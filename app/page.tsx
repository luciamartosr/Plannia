import Link from "next/link";
import { ArrowRight, Search, CalendarHeart, MapPin, Users } from "lucide-react";
import Header from "@/components/ui/Header";

/* ── palette helpers not in design tokens ── */
const C = {
  greenXl: "#EEF4EE",
  bg2:     "#F2EDE3",
  text3:   "#9A9590",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-background)" }}>
      <Header />

      <main className="flex-1 flex flex-col">

        {/* ── HERO ── */}
        <section style={{ paddingTop: 60 }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 64, padding: "0 48px",
            alignItems: "center", minHeight: "calc(100vh - 60px)",
          }}>

            {/* Left */}
            <div style={{ padding: "48px 0" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#fff", border: "1px solid var(--color-border)",
                borderRadius: 999, padding: "6px 14px 6px 10px",
                fontSize: 12, fontWeight: 600, color: "var(--color-primary)",
                marginBottom: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <span style={{
                  width: 6, height: 6, background: "var(--color-accent)",
                  borderRadius: "50%", animation: "heroPulse 2s ease infinite", display: "inline-block",
                }} />
                Planifica. Coordina. Celebra.
              </div>

              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: 56, fontWeight: 500, lineHeight: 1.08,
                letterSpacing: "-0.5px", color: "var(--color-text)",
                marginBottom: 20,
              }}>
                Tu evento,<br />
                <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>sin complicaciones</em>
              </h1>

              <p style={{
                fontSize: 16, fontWeight: 400, color: "var(--color-muted)",
                lineHeight: 1.65, maxWidth: 420, marginBottom: 40,
              }}>
                Estima tu presupuesto, encuentra proveedores verificados y mantén cada detalle bajo control.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 52, flexWrap: "wrap" }}>
                <Link
                  href="/onboarding/nuevo"
                  style={{
                    fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
                    color: "#fff", background: "var(--color-primary)",
                    border: "none", cursor: "pointer", padding: "14px 28px",
                    borderRadius: "var(--radius-btn)",
                    display: "flex", alignItems: "center", gap: 8,
                    boxShadow: "0 4px 14px rgba(47,91,46,0.25)",
                    textDecoration: "none", transition: "background 0.2s",
                  }}
                >
                  <CalendarHeart size={16} /> Organizar mi evento <ArrowRight size={14} />
                </Link>
                <Link
                  href="/marketplace"
                  style={{
                    fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                    color: "var(--color-text)", background: "#fff",
                    border: "1.5px solid var(--color-border)", cursor: "pointer",
                    padding: "13px 24px", borderRadius: "var(--radius-btn)",
                    display: "flex", alignItems: "center", gap: 8,
                    textDecoration: "none", transition: "border-color 0.2s",
                  }}
                >
                  <Search size={14} /> Buscar proveedor
                </Link>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <TrustItem icon="✓">+200 proveedores verificados</TrustItem>
                <div style={{ width: 1, height: 14, background: "var(--color-border)" }} />
                <TrustItem icon={<MapPin size={13} />}>Todo el Perú</TrustItem>
                <div style={{ width: 1, height: 14, background: "var(--color-border)" }} />
                <TrustItem icon={<CalendarHeart size={13} />}>Bodas, cumpleaños, corporativos</TrustItem>
              </div>
            </div>

            {/* Right — preview card */}
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              padding: "48px 0", position: "relative",
            }}>
              <FloatChip bg="#EEF4EE" style={{ top: 80, left: -10 }}>📅 28 jun 2026</FloatChip>
              <FloatChip bg="#FDF3EA" style={{ top: 70, right: -10 }}>👥 120 invitados</FloatChip>
              <FloatChip bg="#F4F7E8" style={{ bottom: 90, left: -5 }}>✅ 6 servicios listos</FloatChip>
              <FloatChip bg="#F4F0FA" style={{ bottom: 70, right: -5 }}>💰 S/ 20,000</FloatChip>

              <div style={{
                background: "#fff", borderRadius: "var(--radius-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
                width: 320, overflow: "hidden", position: "relative", zIndex: 2,
              }}>
                <div style={{ background: "var(--color-primary)", padding: "20px 22px 18px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 6 }}>Mi evento</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "#fff", fontStyle: "italic" }}>Cala &amp; Mateo</div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10,
                    background: "rgba(255,255,255,0.12)", borderRadius: 999, padding: "4px 10px",
                    fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)",
                  }}>🎊 Matrimonio</div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <PCStat label="Faltan" value="21 días" valueColor="var(--color-primary)" />
                    <PCStat label="Invitados" value="175" />
                    <PCStat label="Presupuesto" value="S/ 87,625" valueSize={12} />
                    <PCStat label="Proveedores" value="6 listos" valueColor="var(--color-secondary)" />
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                      <span>Avance</span><span>17% listo</span>
                    </div>
                    <div style={{ height: 4, background: "var(--color-border)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "17%", background: "var(--color-accent)", borderRadius: 999 }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--color-border)", marginTop: 12 }}>
                    {["✓ Catering", "✓ Locación", "✓ Fotografía"].map(t => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "4px 9px", borderRadius: 999, background: C.greenXl, color: "var(--color-primary)", border: "none" }}>{t}</span>
                    ))}
                    {["Música", "Flores"].map(t => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "4px 9px", borderRadius: 999, background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-muted)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section style={{ background: "#fff", borderTop: "1px solid var(--color-border)", padding: "96px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <Eyebrow center>Así de simple</Eyebrow>
              <h2 className="font-display" style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 500, lineHeight: 1.15, color: "var(--color-text)", marginBottom: 16 }}>
                En 3 pasos tienes tu <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>plan completo</em>
              </h2>
              <p style={{ fontSize: 16, color: "var(--color-muted)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
                Sin hojas de cálculo, sin buscar en Google durante horas. Todo en un solo lugar.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, position: "relative" }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ padding: "0 32px", textAlign: "center" }}>
                  <div style={{
                    width: 64, height: 64, background: s.color, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-body)", fontSize: 20, fontWeight: 700, color: "#fff",
                    margin: "0 auto 24px", position: "relative", zIndex: 1,
                    boxShadow: "0 4px 16px rgba(47,91,46,0.2)",
                  }}>{i + 1}</div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, fontStyle: "italic", color: "var(--color-text)", marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--color-muted)", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ background: "var(--color-background)", padding: "96px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Eyebrow>Herramientas</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 500, lineHeight: 1.15, color: "var(--color-text)", marginBottom: 16 }}>
              Todo lo que necesitas<br />en un solo lugar
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 56 }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{
                  background: "#fff", borderRadius: "var(--radius-card)",
                  border: "1px solid var(--color-border)", padding: "28px 26px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: f.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 18 }}>{f.icon}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, fontStyle: "italic", color: "var(--color-text)", marginBottom: 8 }}>{f.title}</div>
                  <p style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIPOS DE EVENTO ── */}
        <section style={{ background: "#fff", padding: "96px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Eyebrow>Para todo tipo de celebración</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 500, lineHeight: 1.15, color: "var(--color-text)", marginBottom: 16 }}>
              Un plan <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>a tu medida</em>,<br />sea cual sea el evento
            </h2>
            <p style={{ fontSize: 16, color: "var(--color-muted)", lineHeight: 1.6, maxWidth: 520, marginBottom: 52 }}>
              Plannia se adapta automáticamente al tipo de evento. El checklist, el presupuesto y los proveedores sugeridos cambian según lo que necesitas.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {EVENTS.map((e, i) => (
                <Link key={i} href="/onboarding/nuevo" style={{ textDecoration: "none" }}>
                  <div style={{
                    border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-card)",
                    padding: "28px 24px 24px", cursor: "pointer",
                    transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                    position: "relative", overflow: "hidden", background: "#fff",
                  }}>
                    <span style={{ fontSize: 32, display: "block", marginBottom: 14 }}>{e.emoji}</span>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, fontStyle: "italic", color: "var(--color-text)", marginBottom: 6 }}>{e.name}</div>
                    <p style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.55, marginBottom: 14 }}>{e.desc}</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.greenXl, color: "var(--color-primary)", borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 700 }}>
                      ✓ {e.tag}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ background: C.bg2, padding: "96px 48px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <Eyebrow center>Empieza hoy</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 500, lineHeight: 1.15, color: "var(--color-text)", marginBottom: 16 }}>
              Tu evento empieza <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>aquí</em>
            </h2>
            <p style={{ fontSize: 16, color: "var(--color-muted)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 40px" }}>
              Sin tarjeta de crédito. Sin configuración. Tu plan completo en menos de 5 minutos.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/onboarding/nuevo"
                style={{
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
                  color: "#fff", background: "var(--color-primary)",
                  padding: "14px 28px", borderRadius: "var(--radius-btn)",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 14px rgba(47,91,46,0.25)", textDecoration: "none",
                }}
              >
                <CalendarHeart size={16} /> Organizar mi evento <ArrowRight size={14} />
              </Link>
              <Link
                href="/marketplace"
                style={{
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                  color: "var(--color-text)", background: "#fff",
                  border: "1.5px solid var(--color-border)", cursor: "pointer",
                  padding: "13px 24px", borderRadius: "var(--radius-btn)",
                  display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                }}
              >
                Ver proveedores
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted">
        © 2026 Plannia · Planifica. Coordina. Celebra.
      </footer>

      <style>{`
        @keyframes heroPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(1.6); }
        }
        @keyframes chipFloat {
          from { transform:translateY(0px); }
          to   { transform:translateY(-7px); }
        }
      `}</style>
    </div>
  );
}

/* ── Small helpers ── */

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: "var(--color-primary)",
      textTransform: "uppercase", letterSpacing: "3px", marginBottom: 14,
      display: "flex", alignItems: "center", gap: 8,
      justifyContent: center ? "center" : undefined,
    }}>
      <span style={{ width: 20, height: 1.5, background: "var(--color-accent)", display: "inline-block", flexShrink: 0 }} />
      {children}
    </div>
  );
}

function TrustItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "#9A9590" }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      {children}
    </div>
  );
}

function FloatChip({ bg, style, children }: { bg: string; style: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div style={{
      position: "absolute", background: "#fff", border: "1px solid var(--color-border)",
      borderRadius: 999, padding: "7px 13px 7px 10px",
      fontSize: 11, fontWeight: 500, color: "var(--color-text)",
      display: "flex", alignItems: "center", gap: 7,
      boxShadow: "0 4px 14px rgba(0,0,0,0.08)", whiteSpace: "nowrap",
      animation: "chipFloat 3s ease-in-out infinite alternate",
      zIndex: 3,
      ...style,
    }}>
      <span style={{ width: 20, height: 20, borderRadius: 5, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>
        {(children as string).split(" ")[0]}
      </span>
      {(children as string).split(" ").slice(1).join(" ")}
    </div>
  );
}

function PCStat({ label, value, valueColor, valueSize }: { label: string; value: string; valueColor?: string; valueSize?: number }) {
  return (
    <div style={{ background: "var(--color-background)", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 8, fontWeight: 600, color: "#9A9590", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: valueSize ?? 15, fontWeight: 700, color: valueColor ?? "var(--color-text)" }}>{value}</div>
    </div>
  );
}

/* ── Data ── */

const STEPS = [
  { color: "var(--color-primary)", title: "Cuéntanos tu evento", desc: "Responde 5 preguntas sobre tu tipo de evento, invitados, fecha y ciudad. En menos de 3 minutos." },
  { color: "var(--color-secondary)", title: "Recibe tu plan", desc: "Checklist personalizado, presupuesto estimado y un marketplace pre-filtrado para tu evento." },
  { color: "var(--color-accent)", title: "Coordina todo", desc: "Compara proveedores, gestiona invitados y lleva el control de tu presupuesto en tiempo real." },
];

const FEATURES = [
  { icon: "💰", iconBg: "#EEF4EE", title: "Presupuesto estimado al instante", desc: "Basado en tu tipo de evento, ciudad e invitados. Con rangos reales del mercado peruano." },
  { icon: "🤝", iconBg: "#FDF3EA", title: "Proveedores verificados", desc: "Más de 200 proveedores con reseñas reales, precios transparentes y cobertura en todo el Perú." },
  { icon: "✅", iconBg: "#F4F7E8", title: "Checklist inteligente", desc: "Tu lista de tareas se genera según el tipo de evento y la fecha. Sin olvidar nada importante." },
  { icon: "📊", iconBg: "#F4F0FA", title: "Control financiero", desc: "Registra pagos, adelantos y saldos. Sabe exactamente cuánto has gastado y cuánto falta." },
  { icon: "👥", iconBg: "#EAF0F0", title: "Gestión de invitados", desc: "Lleva el conteo de confirmaciones, restricciones y mesas desde un panel simple." },
  { icon: "🔔", iconBg: "#FDF8EA", title: "Recordatorios y alertas", desc: "Nunca pierdas un pago o una reunión con proveedores. Plannia te avisa con tiempo." },
];

const EVENTS = [
  { emoji: "💍", name: "Bodas y matrimonios", desc: "Desde el local hasta el pastel. Gestiona cada detalle de tu gran día con proveedores verificados.", tag: "Checklist completo incluido" },
  { emoji: "🎂", name: "Cumpleaños y fiestas", desc: "Para los 15, los 18 o los 50. Organiza cada etapa del evento con presupuesto claro desde el primer día.", tag: "Ideal para eventos íntimos y grandes" },
  { emoji: "🏢", name: "Eventos corporativos", desc: "Lanzamientos, conferencias y cenas de empresa. Gestiona proveedores, asistentes y presupuesto en un panel.", tag: "Reportes para tu equipo incluidos" },
  { emoji: "🎓", name: "Graduaciones", desc: "Coordinación de locales, catering, fotografía y entretenimiento para celebrar este hito con todo.", tag: "Proveedores verificados en tu ciudad" },
  { emoji: "👶", name: "Baby showers y bautizos", desc: "Eventos íntimos con mucho detalle. Plannia te ayuda a no olvidar nada, aunque sea la primera vez.", tag: "Checklist personalizado" },
  { emoji: "🎊", name: "Reuniones familiares", desc: "Aniversarios, reencuentros, celebraciones privadas. Coordina todo sin estrés desde cualquier dispositivo.", tag: "Sin mínimo de invitados" },
];
