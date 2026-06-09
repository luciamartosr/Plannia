import { ServiceType } from "@/stores/onboarding";

// Price ranges per service per person or per event, by region tier
const PRICE_RANGES: Record<ServiceType, { min: number; max: number; unit: "persona" | "evento" }> = {
  locales_espacios:       { min: 3000,  max: 12000, unit: "evento" },
  catering:               { min: 220,   max: 550,   unit: "persona" },
  licor_bebidas:          { min: 900,   max: 3500,  unit: "evento" },
  torta_postres:          { min: 300,   max: 1200,  unit: "evento" },
  fotografia_video:       { min: 2500,  max: 7000,  unit: "evento" },
  musica_entretenimiento: { min: 1500,  max: 5500,  unit: "evento" },
  decoracion_flores:      { min: 1500,  max: 6000,  unit: "evento" },
  sonido_iluminacion:     { min: 1200,  max: 4500,  unit: "evento" },
  invitaciones_papeleria: { min: 500,   max: 2000,  unit: "evento" },
  transporte:             { min: 800,   max: 3000,  unit: "evento" },
  vestuario_belleza:      { min: 1500,  max: 5000,  unit: "evento" },
  personal_eventos:       { min: 600,   max: 2500,  unit: "evento" },
  seguridad:              { min: 800,   max: 3000,  unit: "evento" },
  planeacion_coordinacion:{ min: 2000,  max: 6000,  unit: "evento" },
  otros:                  { min: 500,   max: 2000,  unit: "evento" },
};

// Destination city multipliers
const CITY_MULTIPLIERS: Record<string, number> = {
  cusco: 1.35,
  puno: 1.30,
  iquitos: 1.25,
  tarapoto: 1.20,
  lima: 1.0,
  arequipa: 1.05,
  trujillo: 1.05,
  piura: 1.05,
};

function getCityMultiplier(city: string, isDestination: boolean): number {
  if (!isDestination) return 1.0;
  const key = city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return CITY_MULTIPLIERS[key] ?? 1.15;
}

export function estimateBudget(
  city: string,
  guestCount: number,
  services: ServiceType[],
  isDestination: boolean
): { min: number; max: number; breakdown: { service: ServiceType; min: number; max: number }[] } {
  const multiplier = getCityMultiplier(city, isDestination);
  const breakdown: { service: ServiceType; min: number; max: number }[] = [];
  let totalMin = 0;
  let totalMax = 0;

  for (const service of services) {
    const range = PRICE_RANGES[service];
    const baseMin = range.unit === "persona" ? range.min * guestCount : range.min;
    const baseMax = range.unit === "persona" ? range.max * guestCount : range.max;
    const serviceMin = Math.round(baseMin * multiplier);
    const serviceMax = Math.round(baseMax * multiplier);
    breakdown.push({ service, min: serviceMin, max: serviceMax });
    totalMin += serviceMin;
    totalMax += serviceMax;
  }

  return { min: totalMin, max: totalMax, breakdown };
}

export function formatSoles(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`;
}
