import { EventType, ServiceType } from "@/stores/onboarding";

export interface ServiceSuggestion {
  service: ServiceType;
  reason: string;
}

const SUGGESTIONS_BY_EVENT: Record<string, ServiceType[]> = {
  boda:                ["locales_espacios", "catering", "licor_bebidas", "torta_postres", "fotografia_video", "musica_entretenimiento", "decoracion_flores", "vestuario_belleza", "invitaciones_papeleria", "transporte"],
  cumpleanos_adulto:   ["locales_espacios", "catering", "musica_entretenimiento", "fotografia_video", "decoracion_flores", "torta_postres"],
  cumpleanos_infantil: ["locales_espacios", "catering", "musica_entretenimiento", "decoracion_flores", "fotografia_video", "torta_postres", "personal_eventos"],
  aniversario:         ["locales_espacios", "catering", "decoracion_flores", "fotografia_video", "musica_entretenimiento"],
  baby_shower:         ["locales_espacios", "catering", "decoracion_flores", "fotografia_video", "invitaciones_papeleria", "torta_postres"],
  graduacion:          ["locales_espacios", "catering", "fotografia_video", "decoracion_flores", "musica_entretenimiento"],
  evento_corporativo:  ["locales_espacios", "catering", "sonido_iluminacion", "fotografia_video", "personal_eventos", "seguridad"],
  conferencia:         ["locales_espacios", "sonido_iluminacion", "personal_eventos", "catering", "fotografia_video"],
  seminario:           ["locales_espacios", "sonido_iluminacion", "personal_eventos", "catering"],
  lanzamiento:         ["locales_espacios", "catering", "sonido_iluminacion", "decoracion_flores", "fotografia_video", "personal_eventos"],
  feria:               ["locales_espacios", "sonido_iluminacion", "catering", "seguridad", "personal_eventos", "transporte"],
  concierto:           ["locales_espacios", "sonido_iluminacion", "seguridad", "personal_eventos", "catering", "transporte"],
  otro:                ["locales_espacios", "catering", "musica_entretenimiento", "fotografia_video", "decoracion_flores"],
};

const REASONS: Partial<Record<ServiceType, Partial<Record<string, string>> & { default: string }>> = {
  locales_espacios: {
    default: "Todo evento necesita un espacio donde realizarse.",
  },
  catering: {
    boda: "La comida es el centro de la recepción — es lo que más recuerdan los invitados.",
    conferencia: "Un coffee break bien ejecutado mejora la energía de los asistentes.",
    default: "El catering es uno de los ítems más recordados por los invitados.",
  },
  licor_bebidas: {
    boda: "El bar abierto es parte esencial de la celebración y anima el ambiente.",
    default: "Las bebidas complementan la experiencia gastronómica del evento.",
  },
  torta_postres: {
    boda: "La torta de bodas es uno de los momentos más fotografiados del evento.",
    cumpleanos_adulto: "El pastel de cumpleaños es el centro de la celebración.",
    default: "Los postres y la torta son un elemento especial que los invitados disfrutan.",
  },
  musica_entretenimiento: {
    boda: "La pista de baile es parte esencial. Un buen DJ o banda marca la diferencia.",
    cumpleanos_adulto: "La música anima el ambiente y mantiene a los invitados en la fiesta.",
    default: "La música y el entretenimiento definen el ambiente del evento.",
  },
  fotografia_video: {
    boda: "Las fotos y el video son el único recuerdo tangible que queda del día más importante.",
    default: "Los recuerdos visuales del evento duran para siempre.",
  },
  decoracion_flores: {
    boda: "La decoración transforma el espacio y crea la atmósfera de ensueño que buscas.",
    cumpleanos_infantil: "Una decoración temática hace que los niños vivan la experiencia completa.",
    default: "La decoración define la estética y el ambiente del evento.",
  },
  sonido_iluminacion: {
    conferencia: "Un sistema de sonido profesional garantiza que todos escuchen con claridad.",
    concierto: "La iluminación y el sonido son el corazón técnico de un evento masivo.",
    default: "El sonido e iluminación profesionales elevan la calidad de cualquier evento.",
  },
  transporte: {
    boda: "Coordinar el transporte de los novios y los invitados evita retrasos y desorganización.",
    default: "El transporte facilita la llegada y salida ordenada de los asistentes.",
  },
  vestuario_belleza: {
    boda: "Vestuario de novios, damas y caballeros de honor: una parte visual clave de tu boda.",
    default: "El vestuario y la presentación elevan la imagen del evento.",
  },
  planeacion_coordinacion: {
    boda: "Un coordinador profesional te libera el día del evento para que solo disfrutes.",
    feria: "Un planner es clave para coordinar múltiples proveedores en eventos masivos.",
    default: "Un planner coordina todos los proveedores y reduce tu carga el día del evento.",
  },
  invitaciones_papeleria: {
    boda: "Invitaciones, menús y seating chart: el primer impacto visual para tus invitados.",
    default: "La papelería comunica el estilo del evento antes de que empiece.",
  },
  seguridad: {
    concierto: "En eventos masivos, la seguridad es indispensable para el orden y la protección.",
    evento_corporativo: "El personal de seguridad garantiza el acceso controlado y la tranquilidad.",
    default: "La seguridad garantiza el orden y la tranquilidad durante el evento.",
  },
  personal_eventos: {
    conferencia: "El personal gestiona el registro, la logística y la atención a los asistentes.",
    default: "El personal de apoyo facilita la logística y la atención a los asistentes.",
  },
};

export function getSuggestedServices(eventType: EventType | null): ServiceType[] {
  if (!eventType) return [];
  return SUGGESTIONS_BY_EVENT[eventType] ?? SUGGESTIONS_BY_EVENT["otro"];
}

export function getServiceReason(service: ServiceType, eventType: EventType | null): string {
  const reasons = REASONS[service];
  if (!reasons) return "";
  const specific = eventType ? reasons[eventType] : undefined;
  return specific ?? reasons.default;
}
