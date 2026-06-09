import { Info } from "lucide-react";
import { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  variant?: "warning" | "info";
}

export default function Alert({ children, variant = "warning" }: AlertProps) {
  return (
    <div
      className={`flex gap-3 rounded-[var(--radius-card)] p-4 text-sm ${
        variant === "warning"
          ? "bg-warning text-warning-text"
          : "bg-primary/8 text-primary"
      }`}
    >
      <Info className="mt-0.5 shrink-0" size={16} />
      <div>{children}</div>
    </div>
  );
}
