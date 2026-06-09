import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GuestType = "adulto" | "niño";
export type RSVPStatus = "pendiente" | "confirmado" | "no_asiste";

export interface Companion {
  id: string;
  name: string;
  type: GuestType;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  type: GuestType;
  companions: Companion[];
  rsvp: RSVPStatus;
  notes: string;
}

interface GuestStore {
  guests: Guest[];
  addGuest: (g: Omit<Guest, "id">) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  setRSVP: (id: string, status: RSVPStatus) => void;
  importGuests: (guests: Omit<Guest, "id">[]) => void;
}

export const useGuestStore = create<GuestStore>()(persist((set) => ({
  guests: [],

  addGuest(g) {
    set((s) => ({ guests: [...s.guests, { ...g, id: `g-${Date.now()}-${Math.random()}` }] }));
  },

  updateGuest(id, patch) {
    set((s) => ({ guests: s.guests.map((g) => g.id === id ? { ...g, ...patch } : g) }));
  },

  removeGuest(id) {
    set((s) => ({ guests: s.guests.filter((g) => g.id !== id) }));
  },

  setRSVP(id, status) {
    set((s) => ({ guests: s.guests.map((g) => g.id === id ? { ...g, rsvp: status } : g) }));
  },

  importGuests(list) {
    const newGuests: Guest[] = list.map((g, i) => ({
      ...g,
      id: `g-import-${Date.now()}-${i}`,
    }));
    set((s) => ({ guests: [...s.guests, ...newGuests] }));
  },
}), { name: "plannia-guests" }));
