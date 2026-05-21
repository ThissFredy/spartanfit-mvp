import { cn } from "@/lib/utils/cn";
import { Spinner } from "./spinner";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spartan/70 disabled:pointer-events-none disabled:opacity-55";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-spartan text-white hover:bg-spartan-strong active:bg-spartan-strong/90 shadow-soft",
  secondary:
    "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-700/90 border border-zinc-700",
  ghost: "text-zinc-200 hover:bg-zinc-800/70 active:bg-zinc-800",
  danger:
    "bg-red-600 text-white hover:bg-red-500 active:bg-red-500/90 shadow-soft border border-red-500/20",
  outline:
    "border border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800/70 active:bg-zinc-800/90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  className,
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
