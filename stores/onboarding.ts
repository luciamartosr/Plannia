import { create } from "zustand";

export type EventCategory = "social" | "corporativo" | "masivo" | "otro";

export type EventType =
  | "boda" | "cumpleanos_adulto" | "cumpleanos_infantil" | "aniversario" | "baby_shower" | "graduacion"
  | "evento_corporativo" | "conferencia" | "seminario" | "lanzamiento"
  | "feria" | "concierto"
  | "otro";
export type BudgetType = "defined" | "approximate" | "unsure" | "none";

export type ServiceType =
  | "locales_espacios"
  | "catering"
  | "licor_bebidas"
  | "torta_postres"
  | "fotografia_video"
  | "musica_entretenimiento"
  | "decoracion_flores"
  | "sonido_iluminacion"
  | "invitaciones_papeleria"
  | "transporte"
  | "vestuario_belleza"
  | "personal_eventos"
  | "seguridad"
  | "planeacion_coordinacion"
  | "otros";

export interface OnboardingData {
  eventCategory: EventCategory | null;
  eventType: EventType | null;
  eventTypeCustom: string;
  eventName: string;
  guestCount: number;
  eventDate: string | null;
  unknownDate: boolean;
  city: string;
  isDestinationEvent: boolean;
  services: ServiceType[];
  budgetType: BudgetType | null;
  budgetDefined: number | null;   // only when budgetType === "defined"
  estimatedBudgetMin: number;
  estimatedBudgetMax: number;
}

interface OnboardingStore {
  data: OnboardingData;
  setEventCategory: (category: EventCategory) => void;
  setEventType: (type: EventType, custom?: string) => void;
  setEventName: (name: string) => void;
  setGuestCount: (count: number) => void;
  setEventDate: (date: string | null, unknown?: boolean) => void;
  setCity: (city: string, isDestination?: boolean) => void;
  toggleService: (service: ServiceType) => void;
  setBudget: (type: BudgetType, defined?: number) => void;
  setEstimatedBudget: (min: number, max: number) => void;
  reset: () => void;
  loadSnapshot: (data: OnboardingData) => void;
  resetToInitial: () => void;
}

const initialData: OnboardingData = {
  eventCategory: null,
  eventType: null,
  eventTypeCustom: "",
  eventName: "",
  guestCount: 50,
  eventDate: null,
  unknownDate: false,
  city: "",
  isDestinationEvent: false,
  services: [],
  budgetType: null,
  budgetDefined: null,
  estimatedBudgetMin: 0,
  estimatedBudgetMax: 0,
};

export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  data: initialData,
  setEventCategory: (category) =>
    set((s) => ({ data: { ...s.data, eventCategory: category, eventType: null, eventTypeCustom: "" } })),
  setEventType: (type, custom = "") =>
    set((s) => ({ data: { ...s.data, eventType: type, eventTypeCustom: custom } })),
  setEventName: (name) =>
    set((s) => ({ data: { ...s.data, eventName: name } })),
  setGuestCount: (count) =>
    set((s) => ({ data: { ...s.data, guestCount: count } })),
  setEventDate: (date, unknown = false) =>
    set((s) => ({ data: { ...s.data, eventDate: date, unknownDate: unknown } })),
  setCity: (city, isDestination = false) =>
    set((s) => ({ data: { ...s.data, city, isDestinationEvent: isDestination } })),
  toggleService: (service) =>
    set((s) => {
      const services = s.data.services.includes(service)
        ? s.data.services.filter((sv) => sv !== service)
        : [...s.data.services, service];
      return { data: { ...s.data, services } };
    }),
  setBudget: (type, defined = undefined) =>
    set((s) => ({ data: { ...s.data, budgetType: type, budgetDefined: defined ?? null } })),
  setEstimatedBudget: (min, max) =>
    set((s) => ({ data: { ...s.data, estimatedBudgetMin: min, estimatedBudgetMax: max } })),
  reset: () => set({ data: initialData }),
  loadSnapshot: (data) => set({ data }),
  resetToInitial: () => set({ data: initialData }),
}));
