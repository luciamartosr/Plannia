"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding";
import { useTaskPlanStore } from "@/stores/taskPlan";

export default function NuevoEventoPage() {
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((s) => s.resetToInitial);
  const resetTasks = useTaskPlanStore((s) => s.resetAll);

  useEffect(() => {
    // Clear persisted localStorage keys directly to avoid rehydration race
    if (typeof window !== "undefined") {
      localStorage.removeItem("plannia-onboarding");
      localStorage.removeItem("plannia-tasks");
    }
    resetOnboarding();
    resetTasks();
    router.replace("/onboarding/tipo");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
