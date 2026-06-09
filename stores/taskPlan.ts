import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EventTask, TaskProvider, deriveStatus, generateTaskPlan } from "@/lib/taskPlan";
import { ServiceType } from "@/stores/onboarding";

interface TaskPlanStore {
  tasks: EventTask[];
  initialized: boolean;

  initTasks: (
    services: ServiceType[],
    city: string,
    guestCount: number,
    isDestination: boolean,
    budgetDefined: number | null
  ) => void;

  addTask: (task: EventTask) => void;
  updateTask: (id: string, patch: Partial<EventTask>) => void;
  updateProvider: (taskId: string, providerId: string, patch: Partial<TaskProvider>) => void;
  addProvider: (taskId: string, provider: TaskProvider) => void;
  loadSnapshot: (tasks: EventTask[], initialized: boolean) => void;
  resetAll: () => void;
}

export const useTaskPlanStore = create<TaskPlanStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      initialized: false,

      initTasks(services, city, guestCount, isDestination, budgetDefined) {
        if (get().initialized) return;
        set({
          tasks: generateTaskPlan(services, city, guestCount, isDestination, budgetDefined),
          initialized: true,
        });
      },

      addTask(task) {
        set((s) => ({ tasks: [...s.tasks, task] }));
      },

      updateTask(id, patch) {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const updated = { ...t, ...patch };
            updated.status = deriveStatus(updated);
            return updated;
          }),
        }));
      },

      updateProvider(taskId, providerId, patch) {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const providers = t.providers.map((p) =>
              p.id === providerId ? { ...p, ...patch } : p
            );
            const updated = { ...t, providers };
            updated.status = deriveStatus(updated);
            return updated;
          }),
        }));
      },

      loadSnapshot(tasks, initialized) {
        set({ tasks, initialized });
      },

      resetAll() {
        set({ tasks: [], initialized: false });
      },

      addProvider(taskId, provider) {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const updated = { ...t, providers: [...t.providers, provider] };
            updated.status = deriveStatus(updated);
            return updated;
          }),
        }));
      },
    }),
    { name: "plannia-tasks" }
  )
);
