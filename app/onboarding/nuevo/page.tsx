"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevoEventoPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any stale persisted data from older app versions
    if (typeof window !== "undefined") {
      localStorage.removeItem("plannia-onboarding");
      localStorage.removeItem("plannia-tasks");
    }
    router.replace("/onboarding/tipo?reset=1");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
