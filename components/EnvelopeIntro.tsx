"use client";

import { useState, useEffect } from "react";
import { formatSoles } from "@/lib/budget";

type Phase =
  | "processing"
  | "converging"
  | "flash"
  | "envelope"
  | "opening"
  | "card"
  | "expanding"
  | "done";

interface EnvelopeIntroProps {
  eventIcon: string;
  eventTypeLabel: string;
  displayName: string;
  formattedDate: string | null;
  city: string;
  guestCount: number;
  displayBudget: number | null;
  servicesCount: number;
  services: string[];
  onComplete: () => void;
}

const SVC: Record<string, { icon: string; label: string }> = {
  locales_espacios:        { icon: "🏛️", label: "Locales" },
  catering:                { icon: "🍽️", label: "Catering" },
  licor_bebidas:           { icon: "🍾", label: "Bebidas" },
  torta_postres:           { icon: "🎂", label: "Postres" },
  fotografia_video:        { icon: "📷", label: "Foto & Video" },
  musica_entretenimiento:  { icon: "🎵", label: "Música" },
  decoracion_flores:       { icon: "🌸", label: "Decoración" },
  sonido_iluminacion:      { icon: "💡", label: "Sonido" },
  invitaciones_papeleria:  { icon: "✉️", label: "Papelería" },
  transporte:              { icon: "🚌", label: "Transporte" },
  vestuario_belleza:       { icon: "👗", label: "Belleza" },
  personal_eventos:        { icon: "🤝", label: "Personal" },
  seguridad:               { icon: "🛡️", label: "Seguridad" },
  planeacion_coordinacion: { icon: "📋", label: "Planeación" },
  otros:                   { icon: "➕", label: "Otros" },
};

const SLOTS = [
  { dx: -235, dy: -155, size: 108, rotate: -7  },
  { dx:  210, dy: -170, size:  92, rotate:  6  },
  { dx: -265, dy:  -10, size: 118, rotate: -3  },
  { dx:  248, dy:   15, size:  96, rotate:  8  },
  { dx: -218, dy:  160, size: 112, rotate: -5  },
  { dx:  222, dy:  158, size:  98, rotate:  4  },
  { dx:  -42, dy: -205, size:  88, rotate: -9  },
  { dx:   58, dy:  200, size: 102, rotate:  5  },
];

const EW = 320;
const EH = 230;

export default function EnvelopeIntro({
  eventIcon, eventTypeLabel, displayName, formattedDate,
  city, guestCount, displayBudget, servicesCount, services, onComplete,
}: EnvelopeIntroProps) {
  const [phase, setPhase] = useState<Phase>("processing");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("converging"), 2400);
    const t2 = setTimeout(() => setPhase("flash"),      3100);
    const t3 = setTimeout(() => setPhase("envelope"),   3700);
    const t4 = setTimeout(() => setPhase("opening"),    4900);
    const t5 = setTimeout(() => setPhase("card"),       6000);
    const t6 = setTimeout(() => setPhase("expanding"),  7600);
    const t7 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 8600);
    return () => { [t1,t2,t3,t4,t5,t6,t7].forEach(clearTimeout); };
  }, [onComplete]);

  if (phase === "done") return null;

  const cardServices = services.slice(0, 8);
  const cardSlots    = SLOTS.slice(0, cardServices.length);

  const showEnvelope = ["envelope","opening","card","expanding"].includes(phase);
  const isOpening    = ["opening","card","expanding"].includes(phase);
  const showCard     = ["card","expanding"].includes(phase);
  const isExpanding  = phase === "expanding";

  return (
    <>
      <style>{`
        @keyframes ei-svc-in {
          0%   { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0.4) rotate(var(--rot)); }
          65%  { opacity:1; transform:translate(var(--tx),var(--ty)) scale(1.06) rotate(var(--rot)); }
          100% { opacity:1; transform:translate(var(--tx),var(--ty)) scale(1) rotate(var(--rot)); }
        }
        @keyframes ei-svc-out {
          from { opacity:1; transform:translate(var(--tx),var(--ty)) scale(1) rotate(var(--rot)); }
          to   { opacity:0; transform:translate(0,0) scale(0.1) rotate(0deg); }
        }
        @keyframes ei-flash-ring {
          0%   { transform:scale(0.2); opacity:0; }
          30%  { transform:scale(1);   opacity:1; }
          100% { transform:scale(2.8); opacity:0; }
        }
        @keyframes ei-flash-burst {
          0%   { transform:scale(0);   opacity:1; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes ei-envelope-in {
          0%   { opacity:0; transform:scale(0.78); }
          70%  { opacity:1; transform:scale(1.02); }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes ei-flap-open {
          0%   { transform:perspective(900px) rotateX(0deg); }
          100% { transform:perspective(900px) rotateX(-175deg); }
        }
        @keyframes ei-card-rise {
          0%   { transform:translateY(0);    opacity:0; }
          100% { transform:translateY(-85px); opacity:1; }
        }
        @keyframes ei-expand-out {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(1.2); }
        }
        @keyframes ei-overlay-out {
          from { opacity:1; }
          to   { opacity:0; }
        }
        @keyframes ei-pulse-seal {
          0%,100% { transform:translateX(-50%) scale(1); }
          50%     { transform:translateX(-50%) scale(1.07); }
        }
        @keyframes ei-dot-spin {
          0%,80%,100% { transform:scale(0.3); opacity:0.25; }
          40%          { transform:scale(1);   opacity:1; }
        }
      `}</style>

      {/* Overlay pantalla completa */}
      <div style={{
        position:"fixed", inset:0, zIndex:9999,
        backgroundColor:"#F8F5EE",
        display:"flex", alignItems:"center", justifyContent:"center",
        overflow:"hidden",
        animation: isExpanding ? "ei-overlay-out 0.8s ease-out 0.3s forwards" : undefined,
      }}>

        {/* ── Mini cards de servicios ── */}
        {(phase === "processing" || phase === "converging") && (
          <div style={{ position:"relative", width:1, height:1 }}>
            {phase === "processing" && (
              <div style={{
                position:"absolute", top:"50%", left:"50%",
                transform:"translate(-50%,-50%)",
                display:"flex", gap:7,
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:9, height:9, borderRadius:"50%",
                    backgroundColor:"var(--color-primary)",
                    animation:`ei-dot-spin 1.3s ease-in-out ${i*0.22}s infinite`,
                  }} />
                ))}
              </div>
            )}
            {cardServices.map((svcId, i) => {
              const svc  = SVC[svcId] ?? { icon:"✨", label:svcId };
              const slot = cardSlots[i];
              const W = slot.size, H = Math.round(slot.size * 0.65);
              const converging = phase === "converging";
              return (
                <div key={svcId} style={{
                  position:"absolute", top:"50%", left:"50%",
                  width:W, height:H,
                  marginTop:-(H/2), marginLeft:-(W/2),
                  backgroundColor:"#fff", borderRadius:14,
                  boxShadow:"0 3px 16px rgba(0,0,0,0.10)",
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", gap:3,
                  ["--tx" as string]:`${slot.dx}px`,
                  ["--ty" as string]:`${slot.dy}px`,
                  ["--rot" as string]:`${slot.rotate}deg`,
                  animation: converging
                    ? `ei-svc-out 0.55s ease-in ${i*35}ms forwards`
                    : `ei-svc-in 0.65s cubic-bezier(0.22,1,0.36,1) ${i*110}ms both`,
                  transform: !converging
                    ? `translate(${slot.dx}px,${slot.dy}px) rotate(${slot.rotate}deg)`
                    : undefined,
                }}>
                  <span style={{ fontSize:Math.round(W*0.24) }}>{svc.icon}</span>
                  <span style={{
                    fontSize:Math.round(W*0.105), fontWeight:700,
                    color:"var(--color-muted)", letterSpacing:"0.03em",
                    textAlign:"center", padding:"0 6px", lineHeight:1.2,
                  }}>{svc.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Flash dorado ── */}
        {phase === "flash" && (
          <div style={{ position:"relative", width:1, height:1 }}>
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              width:130, height:130, marginTop:-65, marginLeft:-65,
              borderRadius:"50%", border:"2px solid #C9A84C",
              animation:"ei-flash-ring 0.5s ease-out forwards",
            }} />
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              width:72, height:72, marginTop:-36, marginLeft:-36,
              borderRadius:"50%",
              background:"radial-gradient(circle, #F0C84A 0%, #C9A028 55%, transparent 75%)",
              animation:"ei-flash-burst 0.5s ease-out forwards",
            }} />
          </div>
        )}

        {/* ── Sobre CSS + tarjeta ── */}
        {showEnvelope && (
          <div style={{
            position:"relative",
            width:EW,
            height:EH + 200,
            display:"flex",
            flexDirection:"column",
            justifyContent:"flex-end",
            animation: isExpanding
              ? "ei-expand-out 0.7s ease-in forwards"
              : "ei-envelope-in 0.55s cubic-bezier(0.22,1,0.36,1) forwards",
          }}>

            {/* Tarjeta que emerge */}
            {showCard && (
              <div style={{
                position:"absolute",
                bottom: EH * 0.3,
                left: EW/2 - (EW-44)/2,
                width: EW - 44,
                backgroundColor:"#fff",
                borderRadius:16,
                padding:"20px 20px 18px",
                boxShadow:"0 6px 28px rgba(0,0,0,0.13)",
                zIndex:6,
                textAlign:"center",
                animation:"ei-card-rise 0.8s cubic-bezier(0.22,1,0.36,1) forwards",
              }}>
                <div style={{ fontSize:28, marginBottom:5 }}>{eventIcon}</div>
                <p style={{
                  fontFamily:"var(--font-display)",
                  fontSize:15, fontWeight:700,
                  color:"var(--color-primary)", marginBottom:3,
                }}>
                  {displayName || eventTypeLabel}
                </p>
                {formattedDate && (
                  <p style={{ fontSize:11, color:"var(--color-muted)", marginBottom:10 }}>
                    {formattedDate} · {city}
                  </p>
                )}
                <div style={{
                  display:"flex", justifyContent:"center", gap:14,
                  paddingTop:10, borderTop:"1px solid var(--color-border)",
                }}>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"var(--color-primary)", margin:0 }}>{guestCount}</p>
                    <p style={{ fontSize:8, color:"var(--color-muted)", textTransform:"uppercase", letterSpacing:"0.05em", margin:0 }}>invitados</p>
                  </div>
                  <div style={{ width:1, backgroundColor:"var(--color-border)" }} />
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"var(--color-primary)", margin:0 }}>{servicesCount}</p>
                    <p style={{ fontSize:8, color:"var(--color-muted)", textTransform:"uppercase", letterSpacing:"0.05em", margin:0 }}>servicios</p>
                  </div>
                  {displayBudget != null && (
                    <>
                      <div style={{ width:1, backgroundColor:"var(--color-border)" }} />
                      <div style={{ textAlign:"center" }}>
                        <p style={{ fontSize:15, fontWeight:800, color:"var(--color-primary)", margin:0 }}>{formatSoles(displayBudget)}</p>
                        <p style={{ fontSize:8, color:"var(--color-muted)", textTransform:"uppercase", letterSpacing:"0.05em", margin:0 }}>presupuesto</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Sobre */}
            <div style={{
              position:"relative",
              width:EW, height:EH,
              flexShrink:0,
            }}>
              {/* 1. Base: rectángulo sólido */}
              <div style={{
                position:"absolute", inset:0,
                backgroundColor:"#EDE6D6",
                borderRadius:"0 0 18px 18px",
                boxShadow:"0 10px 48px rgba(0,0,0,0.13)",
                zIndex:1,
              }} />

              {/* 2. Pliegue inferior: triángulo pequeño apuntando hacia arriba (V en la base) */}
              <div style={{
                position:"absolute", bottom:0, left:0,
                width:EW, height:EH * 0.32,
                clipPath:"polygon(0 100%, 50% 0%, 100% 100%)",
                backgroundColor:"#D8CEBC",
                zIndex:2,
              }} />

              {/* 3. Triángulo trasero superior (visible cuando la solapa está abierta) */}
              <div style={{
                position:"absolute", top:0, left:0,
                width:EW, height:EH * 0.5,
                clipPath:"polygon(0 0, 50% 100%, 100% 0)",
                backgroundColor:"#DDD5C5",
                zIndex:3,
              }} />

              {/* 4. Solapa delantera — rota desde el borde superior al abrir */}
              <div style={{
                position:"absolute", top:0, left:0,
                width:EW, height:EH * 0.52,
                transformOrigin:"top center",
                zIndex:4,
                animation: isOpening
                  ? "ei-flap-open 1.1s cubic-bezier(0.4,0,0.2,1) forwards"
                  : undefined,
              }}>
                <div style={{
                  width:"100%", height:"100%",
                  clipPath:"polygon(0 0, 100% 0, 50% 80%)",
                  backgroundColor:"#EAE1D2",
                  filter:"drop-shadow(0 4px 6px rgba(0,0,0,0.08))",
                }} />
              </div>

              {/* 5. Sello dorado "P" */}
              {!isOpening && (
                <div style={{
                  position:"absolute",
                  top:EH * 0.36, left:"50%",
                  transform:"translateX(-50%)",
                  width:54, height:54, borderRadius:"50%",
                  background:"radial-gradient(circle at 35% 35%, #D4A843, #9A7020)",
                  boxShadow:"0 3px 10px rgba(0,0,0,0.22)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  zIndex:5,
                  animation:"ei-pulse-seal 2s ease-in-out infinite",
                }}>
                  <span style={{
                    fontFamily:"Georgia, serif",
                    fontSize:23, fontWeight:700,
                    color:"#fff",
                    textShadow:"0 1px 3px rgba(0,0,0,0.3)",
                    letterSpacing:"-0.02em",
                  }}>P</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
