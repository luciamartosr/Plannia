"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevoEventoPage() {
  const router = useRouter();

  useEffect(() => {
    // Pass reset flag — the tipo page handles the actual reset
    router.replace("/onboarding/tipo?reset=1");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
