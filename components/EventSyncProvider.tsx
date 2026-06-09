"use client";
import { useEffect } from "react";
import { useTaskPlanStore } from "@/stores/taskPlan";
import { useEventsStore } from "@/stores/events";

export default function EventSyncProvider({ children }: { children: React.ReactNode }) {
  const tasks = useTaskPlanStore((s) => s.tasks);
  const initialized = useTaskPlanStore((s) => s.initialized);
  const activeEventId = useEventsStore((s) => s.activeEventId);
  const syncTasks = useEventsStore((s) => s.syncTasks);

  useEffect(() => {
    if (activeEventId && initialized) {
      syncTasks(activeEventId, tasks, initialized);
    }
  }, [tasks, initialized, activeEventId, syncTasks]);

  return <>{children}</>;
}
