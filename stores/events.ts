import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OnboardingData } from "@/stores/onboarding";
import { EventTask } from "@/lib/taskPlan";

export interface StoredEvent {
  id: string;
  createdAt: string;
  onboarding: OnboardingData;
  tasks: EventTask[];
  tasksInitialized: boolean;
}

interface EventsStore {
  events: StoredEvent[];
  activeEventId: string | null;

  createEvent: (onboarding: OnboardingData) => string;
  setActiveEvent: (id: string) => void;
  clearActive: () => void;
  deleteEvent: (id: string) => void;
  syncTasks: (eventId: string, tasks: EventTask[], initialized: boolean) => void;
  syncOnboarding: (eventId: string, data: OnboardingData) => void;
  getActiveEvent: () => StoredEvent | null;
}

export const useEventsStore = create<EventsStore>()(
  persist(
    (set, get) => ({
      events: [],
      activeEventId: null,

      createEvent(onboarding) {
        const id = `event-${Date.now()}`;
        const newEvent: StoredEvent = {
          id,
          createdAt: new Date().toISOString(),
          onboarding,
          tasks: [],
          tasksInitialized: false,
        };
        set((s) => ({ events: [...s.events, newEvent], activeEventId: id }));
        return id;
      },

      setActiveEvent(id) {
        set({ activeEventId: id });
      },

      clearActive() {
        set({ activeEventId: null });
      },

      deleteEvent(id) {
        set((s) => {
          const events = s.events.filter((e) => e.id !== id);
          const activeEventId =
            s.activeEventId === id
              ? (events[0]?.id ?? null)
              : s.activeEventId;
          return { events, activeEventId };
        });
      },

      syncTasks(eventId, tasks, initialized) {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, tasks, tasksInitialized: initialized } : e
          ),
        }));
      },

      syncOnboarding(eventId, data) {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, onboarding: data } : e
          ),
        }));
      },

      getActiveEvent() {
        return get().events.find((e) => e.id === get().activeEventId) ?? null;
      },
    }),
    { name: "plannia-events" }
  )
);
