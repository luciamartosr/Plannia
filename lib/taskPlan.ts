import { ServiceType } from "@/stores/onboarding";
import { estimateBudget } from "@/lib/budget";

// ─── Status ───────────────────────────────────────────────────
export type TaskStatus = "pendiente" | "cotizando" | "contratado" | "completado";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente:  "Pendiente",
  cotizando:  "Cotizando",
  contratado: "Contratado",
  completado: "Completado",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pendiente:  "bg-border text-muted",
  cotizando:  "bg-warning text-warning-text",
  contratado: "bg-accent/20 text-secondary",
  completado: "bg-accent/30 text-secondary",
};

// ─── Provider ─────────────────────────────────────────────────
export type ProviderState = "suggested" | "quoted" | "contracted";

export interface Reminder {
  id: string;
  description: string;
  date: string | null;
  done: boolean;
}

export interface TaskProvider {
  id: string;
  source: "plannia" | "external";

  // Basic info
  name: string;
  priceEstMin: number;
  priceEstMax: number;
  rating: number | null;

  // Contact (external)
  phone: string;
  email: string;
  notes: string;           // general notes about this provider

  // State
  state: ProviderState;

  // Quote
  quotedPrice: number | null;
  quoteNotes: string;

  // Contract
  contractedPrice: number | null;   // may differ from quotedPrice (negotiated)
  contractedDate: string | null;
  deliveryDate: string | null;

  // Payments
  adelanto: number | null;
  adelantoDate: string | null;
  adelantoPaid: boolean;
  finalPayment: number | null;
  finalPaymentDate: string | null;
  finalPaymentPaid: boolean;
  pendingPaymentDate: string | null;

}

// ─── Task ─────────────────────────────────────────────────────
export interface EventTask {
  id: string;
  service: ServiceType;
  name: string;
  icon: string;
  status: TaskStatus;       // auto-derived
  markedDone: boolean;

  // Budget
  budgetSuggestedMin: number;
  budgetSuggestedMax: number;
  budgetAllocated: number | null;

  // Unified provider list (suggested + external, all states)
  providers: TaskProvider[];

  // Task-level
  taskNotes: string;
  reminders: Reminder[];
}

// ─── Derive status ────────────────────────────────────────────
export function deriveStatus(task: Pick<EventTask, "markedDone" | "providers">): TaskStatus {
  if (task.markedDone) return "completado";
  if (task.providers.some((p) => p.state === "contracted")) return "contratado";
  if (task.providers.some((p) => p.state === "quoted")) return "cotizando";
  return "pendiente";
}

// ─── Contracted provider ──────────────────────────────────────
export function getContractedProvider(task: EventTask): TaskProvider | null {
  return task.providers.find((p) => p.state === "contracted") ?? null;
}

// ─── Budget helpers ───────────────────────────────────────────
export function taskContractedAmount(task: EventTask): number | null {
  return getContractedProvider(task)?.contractedPrice ?? null;
}

// ─── Service metadata ─────────────────────────────────────────
const ALLOCATION_WEIGHTS: Partial<Record<ServiceType, number>> = {
  locales_espacios:       0.28,
  catering:               0.28,
  licor_bebidas:          0.06,
  torta_postres:          0.03,
  fotografia_video:       0.10,
  musica_entretenimiento: 0.07,
  decoracion_flores:      0.06,
  sonido_iluminacion:     0.05,
  invitaciones_papeleria: 0.02,
  transporte:             0.03,
  vestuario_belleza:      0.06,
  personal_eventos:       0.03,
  seguridad:              0.03,
  planeacion_coordinacion:0.07,
  otros:                  0.02,
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  locales_espacios:       "Locales y Espacios",
  catering:               "Catering",
  licor_bebidas:          "Licor y Bebidas",
  torta_postres:          "Torta y Postres",
  fotografia_video:       "Fotografía y Video",
  musica_entretenimiento: "Música y Entretenimiento",
  decoracion_flores:      "Decoración y Flores",
  sonido_iluminacion:     "Sonido, Iluminación y Pantallas",
  invitaciones_papeleria: "Invitaciones y Papelería",
  transporte:             "Transporte",
  vestuario_belleza:      "Vestuario y Belleza",
  personal_eventos:       "Personal para Eventos",
  seguridad:              "Seguridad",
  planeacion_coordinacion:"Planeación y Coordinación",
  otros:                  "Otros",
};

export const SERVICE_ICONS: Record<ServiceType, string> = {
  locales_espacios:       "🏛️",
  catering:               "🍽️",
  licor_bebidas:          "🍾",
  torta_postres:          "🎂",
  fotografia_video:       "📷",
  musica_entretenimiento: "🎵",
  decoracion_flores:      "🌸",
  sonido_iluminacion:     "💡",
  invitaciones_papeleria: "✉️",
  transporte:             "🚌",
  vestuario_belleza:      "👗",
  personal_eventos:       "🤝",
  seguridad:              "🛡️",
  planeacion_coordinacion:"📋",
  otros:                  "➕",
};

// ─── Seed providers per service ───────────────────────────────
const SEED_PROVIDERS: Partial<Record<ServiceType, Omit<TaskProvider, "state" | "quotedPrice" | "quoteNotes" | "contractedPrice" | "contractedDate" | "deliveryDate" | "adelanto" | "adelantoDate" | "adelantoPaid" | "finalPayment" | "finalPaymentDate" | "finalPaymentPaid" | "pendingPaymentDate" | "phone" | "email" | "notes">[]>> = {
  locales_espacios: [
    { id: "1",  source: "plannia", name: "Hacienda San Antonio",    priceEstMin: 5000, priceEstMax: 12000, rating: 4.8 },
    { id: "9",  source: "plannia", name: "Salón Royal Gardens",      priceEstMin: 3500, priceEstMax: 9000,  rating: 4.5 },
    { id: "10", source: "plannia", name: "Casa de Eventos El Olivo", priceEstMin: 2800, priceEstMax: 7500,  rating: 4.3 },
  ],
  catering: [
    { id: "2",  source: "plannia", name: "Chef Ricardo Catering",   priceEstMin: 180, priceEstMax: 450, rating: 4.9 },
    { id: "5",  source: "plannia", name: "Banquetes del Sur",        priceEstMin: 150, priceEstMax: 380, rating: 4.6 },
    { id: "11", source: "plannia", name: "Gourmet Events Lima",      priceEstMin: 200, priceEstMax: 520, rating: 4.7 },
    { id: "12", source: "plannia", name: "Cocina & Arte Catering",   priceEstMin: 130, priceEstMax: 320, rating: 4.4 },
  ],
  licor_bebidas: [
    { id: "36", source: "plannia", name: "Bar Móvil Premium",        priceEstMin: 1200, priceEstMax: 3500, rating: 4.7 },
    { id: "37", source: "plannia", name: "Open Bar Lima",            priceEstMin: 900,  priceEstMax: 2800, rating: 4.5 },
  ],
  torta_postres: [
    { id: "38", source: "plannia", name: "Dulce Celebración",        priceEstMin: 350,  priceEstMax: 1200, rating: 4.8 },
    { id: "39", source: "plannia", name: "Pastelería Artesanal Lima", priceEstMin: 280,  priceEstMax: 950,  rating: 4.6 },
  ],
  musica_entretenimiento: [
    { id: "3",  source: "plannia", name: "DJ Marcos Lima",           priceEstMin: 1200, priceEstMax: 3000, rating: 4.7 },
    { id: "13", source: "plannia", name: "Banda Ritmo Latino",       priceEstMin: 2500, priceEstMax: 5500, rating: 4.8 },
    { id: "14", source: "plannia", name: "DJ Valentina Mix",         priceEstMin: 900,  priceEstMax: 2200, rating: 4.5 },
  ],
  fotografia_video: [
    { id: "4",  source: "plannia", name: "Foto & Arte Studio",       priceEstMin: 2000, priceEstMax: 5000, rating: 4.9 },
    { id: "8",  source: "plannia", name: "Video Memories",           priceEstMin: 1800, priceEstMax: 4000, rating: 4.7 },
    { id: "15", source: "plannia", name: "Lente Creativo",           priceEstMin: 1500, priceEstMax: 3500, rating: 4.6 },
  ],
  decoracion_flores: [
    { id: "6",  source: "plannia", name: "Decoraciones Valentina",   priceEstMin: 1500, priceEstMax: 5000, rating: 4.8 },
    { id: "16", source: "plannia", name: "Floral Dreams",            priceEstMin: 800,  priceEstMax: 3000, rating: 4.5 },
    { id: "17", source: "plannia", name: "Estudio Deco & Más",       priceEstMin: 1200, priceEstMax: 4000, rating: 4.4 },
  ],
  sonido_iluminacion: [
    { id: "19", source: "plannia", name: "SoundPro Lima",            priceEstMin: 1200, priceEstMax: 4000, rating: 4.7 },
    { id: "20", source: "plannia", name: "LuzYSonido Eventos",       priceEstMin: 900,  priceEstMax: 3000, rating: 4.5 },
    { id: "21", source: "plannia", name: "AudioVisual Masters",      priceEstMin: 1500, priceEstMax: 4500, rating: 4.6 },
  ],
  invitaciones_papeleria: [
    { id: "30", source: "plannia", name: "Imprenta Creativa",        priceEstMin: 300,  priceEstMax: 1500, rating: 4.5 },
    { id: "31", source: "plannia", name: "Diseños & Papelería Fina", priceEstMin: 500,  priceEstMax: 2000, rating: 4.7 },
  ],
  transporte: [
    { id: "24", source: "plannia", name: "Transportes VIP Lima",     priceEstMin: 800,  priceEstMax: 2500, rating: 4.6 },
    { id: "25", source: "plannia", name: "Bus Eventos Perú",         priceEstMin: 600,  priceEstMax: 2000, rating: 4.4 },
  ],
  vestuario_belleza: [
    { id: "26", source: "plannia", name: "Boutique Novias Lima",     priceEstMin: 1500, priceEstMax: 5000, rating: 4.9 },
    { id: "27", source: "plannia", name: "Trajes & Elegancia",       priceEstMin: 800,  priceEstMax: 3000, rating: 4.6 },
  ],
  personal_eventos: [
    { id: "34", source: "plannia", name: "Staff Pro Eventos",        priceEstMin: 500,  priceEstMax: 2000, rating: 4.6 },
    { id: "35", source: "plannia", name: "Personal de Eventos Lima", priceEstMin: 400,  priceEstMax: 1800, rating: 4.4 },
  ],
  seguridad: [
    { id: "32", source: "plannia", name: "Grupo Seguridad Elite",    priceEstMin: 800,  priceEstMax: 2500, rating: 4.6 },
    { id: "33", source: "plannia", name: "ProGuard Eventos",         priceEstMin: 600,  priceEstMax: 2000, rating: 4.4 },
  ],
  planeacion_coordinacion: [
    { id: "28", source: "plannia", name: "Planners Pro Lima",        priceEstMin: 2000, priceEstMax: 6000, rating: 4.8 },
    { id: "29", source: "plannia", name: "Tu Evento Perfecto",       priceEstMin: 1500, priceEstMax: 4500, rating: 4.7 },
  ],
};

type SeedProvider = { id: string; source: "plannia"; name: string; priceEstMin: number; priceEstMax: number; rating: number | null };
function makeProvider(seed: SeedProvider): TaskProvider {
  return {
    ...seed,
    phone: "", email: "", notes: "",
    state: "suggested",
    quotedPrice: null, quoteNotes: "",
    contractedPrice: null, contractedDate: null, deliveryDate: null,
    adelanto: null, adelantoDate: null, adelantoPaid: false,
    finalPayment: null, finalPaymentDate: null, finalPaymentPaid: false,
    pendingPaymentDate: null,
  };
}

// ─── Budget distribution ──────────────────────────────────────
function distributeBudget(services: ServiceType[], total: number): Map<ServiceType, number> {
  const map = new Map<ServiceType, number>();
  const totalWeight = services.reduce((s, sv) => s + (ALLOCATION_WEIGHTS[sv] ?? 0.03), 0);
  for (const sv of services) {
    map.set(sv, Math.round(((ALLOCATION_WEIGHTS[sv] ?? 0.03) / totalWeight) * total));
  }
  return map;
}

// ─── Generate initial task plan ───────────────────────────────
export function generateTaskPlan(
  services: ServiceType[],
  city: string,
  guestCount: number,
  isDestination: boolean,
  budgetDefined: number | null
): EventTask[] {
  const budgetEstimate = estimateBudget(city, guestCount, services, isDestination);
  const allocation = budgetDefined ? distributeBudget(services, budgetDefined) : null;

  return services.map((service) => {
    const breakdown = budgetEstimate.breakdown.find((b) => b.service === service);
    const seeds = SEED_PROVIDERS[service] ?? [];
    return {
      id: `task-${service}`,
      service,
      name: SERVICE_LABELS[service] ?? service,
      icon: SERVICE_ICONS[service] ?? "📌",
      status: "pendiente",
      markedDone: false,
      budgetSuggestedMin: breakdown?.min ?? 0,
      budgetSuggestedMax: breakdown?.max ?? 0,
      budgetAllocated: allocation?.get(service) ?? null,
      providers: (seeds as SeedProvider[]).map(makeProvider),
      taskNotes: "",
      reminders: [],
    };
  });
}
