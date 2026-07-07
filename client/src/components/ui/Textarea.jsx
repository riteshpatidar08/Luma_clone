import * as React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-lg border border-luma-border-default bg-luma-card/20 px-3 py-2 text-sm text-luma-text-primary shadow-sm placeholder:text-luma-text-gray focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-luma-blue disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
