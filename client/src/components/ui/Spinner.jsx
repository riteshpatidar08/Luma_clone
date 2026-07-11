import * as React from "react"
import { cn } from "../../lib/utils"

export function Spinner({
  className,
  size = "md",
  variant = "primary",
  label,
  ...props
}) {
  const sizeClasses = {
    xs: "h-3.5 w-3.5 stroke-[3]",
    sm: "h-5 w-5 stroke-[2.5]",
    md: "h-8 w-8 stroke-[2]",
    lg: "h-12 w-12 stroke-[2]",
    xl: "h-16 w-16 stroke-[1.5]",
  }

  const colorClasses = {
    primary: "text-luma-blue",
    secondary: "text-luma-indigo",
    white: "text-white",
    muted: "text-luma-text-muted",
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      {...props}
    >
      <div className="relative flex items-center justify-center">
        {/* Premium ambient glow that matches Luma's neon/glassmorphism aesthetics */}
        {variant === "primary" && (
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-luma-blue/15 blur-md opacity-80 animate-pulse",
              size === "xs" && "blur-[2px]",
              size === "sm" && "blur-sm",
              size === "md" && "blur-md",
              size === "lg" && "blur-lg",
              size === "xl" && "blur-xl"
            )}
          />
        )}
        {variant === "secondary" && (
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-luma-indigo/15 blur-md opacity-80 animate-pulse",
              size === "xs" && "blur-[2px]",
              size === "sm" && "blur-sm",
              size === "md" && "blur-md",
              size === "lg" && "blur-lg",
              size === "xl" && "blur-xl"
            )}
          />
        )}
        <svg
          className={cn(
            "animate-spin",
            sizeClasses[size] || "h-8 w-8",
            colorClasses[variant] || "text-luma-blue"
          )}
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-15"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-80"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      </div>
      {label && (
        <span className={cn(
          "text-luma-text-muted select-none font-medium text-[13px] tracking-wide animate-pulse mt-1",
          size === "xs" || size === "sm" ? "text-[11px]" : "text-[13px]"
        )}>
          {label}
        </span>
      )}
    </div>
  )
}
