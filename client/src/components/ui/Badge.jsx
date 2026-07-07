import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-luma-white text-luma-black": 
            variant === "default",
          "border-luma-border-default bg-luma-card text-luma-text-primary": 
            variant === "secondary",
          "border-transparent bg-luma-green-bg text-luma-green": 
            variant === "success",
          "border-transparent bg-luma-yellow-bg/25 text-luma-yellow": 
            variant === "warning",
          "border-transparent bg-luma-red/10 text-luma-red": 
            variant === "danger",
          "border-transparent bg-luma-blue/15 text-luma-blue": 
            variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
