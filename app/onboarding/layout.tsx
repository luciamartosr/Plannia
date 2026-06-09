import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full px-6 py-4 flex items-center border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Plannia" width={32} height={32} className="rounded-md" />
          <span className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Plannia
          </span>
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10 md:py-16">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  );
}
