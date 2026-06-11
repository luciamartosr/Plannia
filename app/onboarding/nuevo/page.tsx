"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding";

export default function NuevoEventoPage() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.resetToInitial);

  useEffect(() => {
    reset();
    router.replace("/onboarding/tipo");
  }, [reset, router]);

  return null;
}
