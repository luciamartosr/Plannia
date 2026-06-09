import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppointmentStatus = "pendiente" | "confirmada" | "cancelada";

export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  date: string;       // ISO date "YYYY-MM-DD"
  time: string;       // "HH:MM"
  type: "presencial" | "videollamada" | "llamada";
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: AppointmentStatus;
  createdAt: string;
}

interface AppointmentsStore {
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, "id" | "status" | "createdAt">) => string;
  cancelAppointment: (id: string) => void;
  confirmAppointment: (id: string) => void;
}

export const useAppointmentsStore = create<AppointmentsStore>()(persist((set) => ({
  appointments: [],

  addAppointment: (appt) => {
    const id = `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({
      appointments: [
        ...s.appointments,
        { ...appt, id, status: "pendiente", createdAt: new Date().toISOString() },
      ],
    }));
    return id;
  },

  cancelAppointment: (id) =>
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: "cancelada" } : a
      ),
    })),

  confirmAppointment: (id) =>
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: "confirmada" } : a
      ),
    })),
}), { name: "plannia-appointments" }));
