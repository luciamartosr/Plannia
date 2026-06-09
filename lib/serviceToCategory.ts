export const MARKETPLACE_CATEGORIES = [
  "Todos",
  "Locales y Espacios",
  "Catering",
  "Licor",
  "Torta y Postres",
  "Fotografía y Video",
  "Música y Entretenimiento",
  "Decoración y Flores",
  "Sonido, Iluminación y Pantallas",
  "Invitaciones y Papelería",
  "Transporte",
  "Vestuario y Belleza",
  "Personal para Eventos",
  "Seguridad",
  "Planeación y Coordinación",
  "Otros",
] as const;

export type MarketplaceCategory = typeof MARKETPLACE_CATEGORIES[number];

export const SERVICE_TO_CATEGORY: Record<string, string> = {
  locales_espacios:       "Locales y Espacios",
  catering:               "Catering",
  licor_bebidas:          "Licor",
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

// Dynamic "servicios incluidos" per category
export const SERVICES_BY_CATEGORY: Partial<Record<string, string[]>> = {
  "Locales y Espacios": ["Estacionamiento", "Área verde", "Aire acondicionado", "Mobiliario incluido", "Seguridad", "Cocina industrial", "Grupo electrógeno"],
  "Catering":           ["Menú infantil", "Menú vegetariano", "Bebidas incluidas", "Postres incluidos", "Mozos incluidos", "Menaje completo", "Degustación previa"],
  "Fotografía y Video": ["Álbum físico", "Video editado", "Drone", "Sesión previa", "Transmisión en vivo", "Cabina de fotos"],
  "Música y Entretenimiento": ["Equipo de sonido", "Iluminación básica", "Animador", "Micrófono inalámbrico", "Presentaciones en vivo"],
  "Decoración y Flores": ["Montaje incluido", "Flores naturales", "Iluminación decorativa", "Mesa de dulces", "Backdrop"],
  "Sonido, Iluminación y Pantallas": ["Pantalla LED", "Proyector", "Sistema de sonido profesional", "Luces de efecto", "Técnico incluido"],
  "Transporte": ["A/C", "Conductor incluido", "Decoración del vehículo", "Punto de recojo personalizado"],
};
