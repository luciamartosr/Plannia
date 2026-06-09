// Maps provider category labels → service key, and defines which context
// fields are required for each service type when building a quote request.

export type ServiceKey =
  | "locales_espacios" | "catering" | "licor_bebidas" | "torta_postres"
  | "fotografia_video" | "musica_entretenimiento" | "decoracion_flores"
  | "sonido_iluminacion" | "invitaciones_papeleria" | "transporte"
  | "vestuario_belleza" | "personal_eventos" | "seguridad"
  | "planeacion_coordinacion" | "otros";

export type FieldKey =
  | "guests"           // número de personas/invitados
  | "date"             // fecha del evento
  | "city"             // lugar del evento
  | "time"             // horario del servicio
  | "hours"            // duración en horas
  | "venueCapacity"    // capacidad del espacio en m² o personas
  | "sendDate"         // fecha de envío (papelería)
  | "quantity"         // cantidad de unidades (invitaciones, guardias…)
  | "serviceDetails"   // detalles del servicio (vestuario, etc.)
  | "eventType";       // tipo de evento (boda, corporativo…)

export interface ContextFieldDef {
  key: FieldKey;
  label: string;
  placeholder?: string;
  type: "number" | "date" | "text" | "time" | "select";
  options?: string[];   // for "select"
  required?: boolean;
}

export interface ServiceContextConfig {
  serviceKey: ServiceKey;
  label: string;
  icon: string;
  fields: ContextFieldDef[];
  allowRefs: boolean;   // visual references (photos)
  refHint?: string;     // hint text for the upload zone
  notesPlaceholder: string;
}

// ─── Field definitions (reused across services) ────────────────────────────

const F_GUESTS: ContextFieldDef = {
  key: "guests", label: "Cantidad de invitados", type: "number",
  placeholder: "Ej: 120", required: true,
};
const F_DATE: ContextFieldDef = {
  key: "date", label: "Fecha del evento", type: "date", required: true,
};
const F_CITY: ContextFieldDef = {
  key: "city", label: "Lugar del evento", type: "text",
  placeholder: "Lugar del evento o dirección",
};
const F_TIME: ContextFieldDef = {
  key: "time", label: "Horario del evento", type: "time", placeholder: "19:00",
};
const F_HOURS: ContextFieldDef = {
  key: "hours", label: "Duración estimada (horas)", type: "number",
  placeholder: "Ej: 6", required: true,
};
const F_VENUE_CAP: ContextFieldDef = {
  key: "venueCapacity", label: "Capacidad del espacio", type: "number",
  placeholder: "Cantidad de personas que caben", required: true,
};
const F_SEND_DATE: ContextFieldDef = {
  key: "sendDate", label: "Fecha estimada de envío / entrega", type: "date",
};
const F_QUANTITY: ContextFieldDef = {
  key: "quantity", label: "Cantidad necesaria", type: "number",
  placeholder: "Ej: 150 invitaciones",
};
const F_SERVICE_DETAILS: ContextFieldDef = {
  key: "serviceDetails", label: "Detalle del servicio requerido", type: "text",
  placeholder: "Ej: peinado + maquillaje para novia y 3 damas",
};
const F_EVENT_TYPE: ContextFieldDef = {
  key: "eventType", label: "Tipo de evento", type: "select",
  options: ["Boda", "Quinceañero", "Cumpleaños", "Corporativo", "Conferencia", "Baby Shower", "Graduación", "Otro"],
};

// ─── Config per service ────────────────────────────────────────────────────

export const CONTEXT_CONFIG: Record<ServiceKey, ServiceContextConfig> = {
  locales_espacios: {
    serviceKey: "locales_espacios", label: "Locales y Espacios", icon: "🏛️",
    fields: [F_GUESTS, F_DATE],
    allowRefs: false,
    notesPlaceholder: "Ej: Requiero el espacio con decoración y mobiliario incluido. El evento termina a la 1am.",
  },
  catering: {
    serviceKey: "catering", label: "Catering", icon: "🍽️",
    fields: [F_GUESTS, F_DATE, F_CITY],
    allowRefs: false,
    notesPlaceholder: "Ej: Necesito menú vegetariano para 15 invitados. Servicio sentado a la mesa. Incluir mozos.",
  },
  licor_bebidas: {
    serviceKey: "licor_bebidas", label: "Licor y Bebidas", icon: "🍾",
    fields: [F_GUESTS, F_DATE],
    allowRefs: false,
    notesPlaceholder: "Ej: Bar abierto por 5 horas, incluir cócteles sin alcohol. Evento en Miraflores.",
  },
  torta_postres: {
    serviceKey: "torta_postres", label: "Torta y Postres", icon: "🎂",
    fields: [F_GUESTS, F_DATE],
    allowRefs: true,
    refHint: "Sube fotos de referencia de diseño de torta, colores o estilos que te inspiran",
    notesPlaceholder: "Ej: Torta de 3 pisos para 120 personas. Temática jardín. Sabor: vainilla y frutos rojos.",
  },
  fotografia_video: {
    serviceKey: "fotografia_video", label: "Fotografía y Video", icon: "📷",
    fields: [F_DATE, F_CITY],
    allowRefs: false,
    notesPlaceholder: "Ej: Boda religiosa + recepción. Necesito 2 fotógrafos y video con dron. Entrega en 30 días.",
  },
  musica_entretenimiento: {
    serviceKey: "musica_entretenimiento", label: "Música y Entretenimiento", icon: "🎵",
    fields: [F_DATE, F_CITY, F_TIME],
    allowRefs: false,
    notesPlaceholder: "Ej: Boda para 150 personas. Set de 6 horas. Géneros: cumbia, salsa, reggaeton y baladas.",
  },
  decoracion_flores: {
    serviceKey: "decoracion_flores", label: "Decoración y Flores", icon: "🌸",
    fields: [F_DATE, F_CITY],
    allowRefs: true,
    refHint: "Sube fotos de referencia: estilos, colores, flores o decoraciones que te inspiran",
    notesPlaceholder: "Ej: 15 mesas redondas, arco de flores para el altar, decoración de pasillo. Paleta: blanco y verde.",
  },
  sonido_iluminacion: {
    serviceKey: "sonido_iluminacion", label: "Sonido, Iluminación y Pantallas", icon: "💡",
    fields: [F_DATE, F_CITY, F_VENUE_CAP],
    allowRefs: false,
    notesPlaceholder: "Ej: Sonido para salón de 200 personas. Requiero pantalla LED 3x2m para proyección y DJ.",
  },
  invitaciones_papeleria: {
    serviceKey: "invitaciones_papeleria", label: "Invitaciones y Papelería", icon: "✉️",
    fields: [F_SEND_DATE, F_QUANTITY],
    allowRefs: true,
    refHint: "Sube referencias de diseño: paleta de colores, tipografías, invitaciones que te gustan",
    notesPlaceholder: "Ej: 150 invitaciones impresas + versión digital. Paleta: dorado y marfil. Incluir menú de mesas.",
  },
  transporte: {
    serviceKey: "transporte", label: "Transporte", icon: "🚌",
    fields: [F_GUESTS, F_DATE],
    allowRefs: false,
    notesPlaceholder: "Ej: Traslado de 80 personas desde San Isidro a La Molina. Regreso a las 2am.",
  },
  vestuario_belleza: {
    serviceKey: "vestuario_belleza", label: "Vestuario y Belleza", icon: "👗",
    fields: [F_DATE, F_SERVICE_DETAILS],
    allowRefs: true,
    refHint: "Sube fotos de referencia de peinados, maquillaje o vestidos que te gustan",
    notesPlaceholder: "Ej: Maquillaje y peinado para novia, madre y 3 damas. Prueba 1 semana antes del evento.",
  },
  personal_eventos: {
    serviceKey: "personal_eventos", label: "Personal para Eventos", icon: "🤝",
    fields: [F_DATE, F_GUESTS, F_HOURS],
    allowRefs: false,
    notesPlaceholder: "Ej: Necesito 4 mozos y 2 anfitrionas. Montaje a las 2pm, evento desde las 7pm hasta medianoche.",
  },
  seguridad: {
    serviceKey: "seguridad", label: "Seguridad", icon: "🛡️",
    fields: [F_DATE, F_CITY, F_QUANTITY],
    allowRefs: false,
    notesPlaceholder: "Ej: 3 guardias para evento de 200 personas en espacio abierto. Control de acceso con lista.",
  },
  planeacion_coordinacion: {
    serviceKey: "planeacion_coordinacion", label: "Planeación y Coordinación", icon: "📋",
    fields: [F_DATE, F_CITY, F_EVENT_TYPE],
    allowRefs: false,
    notesPlaceholder: "Ej: Boda religiosa + recepción para 180 personas. Necesito coordinación el día del evento.",
  },
  otros: {
    serviceKey: "otros", label: "Otros Servicios", icon: "➕",
    fields: [F_DATE, F_CITY],
    allowRefs: false,
    notesPlaceholder: "Cuéntale al proveedor qué necesitas con el mayor detalle posible.",
  },
};

// ─── Category label → service key ─────────────────────────────────────────

export const CATEGORY_TO_SERVICE_KEY: Record<string, ServiceKey> = {
  "Locales y Espacios":            "locales_espacios",
  "Catering":                      "catering",
  "Licor":                         "licor_bebidas",
  "Torta y Postres":               "torta_postres",
  "Fotografía y Video":            "fotografia_video",
  "Música y Entretenimiento":      "musica_entretenimiento",
  "Decoración y Flores":           "decoracion_flores",
  "Sonido, Iluminación y Pantallas":"sonido_iluminacion",
  "Invitaciones y Papelería":      "invitaciones_papeleria",
  "Transporte":                    "transporte",
  "Vestuario y Belleza":           "vestuario_belleza",
  "Personal para Eventos":         "personal_eventos",
  "Seguridad":                     "seguridad",
  "Planeación y Coordinación":     "planeacion_coordinacion",
  "Otros":                         "otros",
};
