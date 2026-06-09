"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-light active:scale-[0.98] shadow-sm",
  secondary:
    "bg-accent text-white hover:opacity-90 active:scale-[0.98] shadow-sm",
  ghost:
    "bg-transparent text-primary hover:bg-primary/8 active:scale-[0.98]",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary/8 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-btn)] transition-all duration-150 cursor-pointer select-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
