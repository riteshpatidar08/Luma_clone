import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-lg border border-luma-border-default bg-luma-card-solid px-3 py-2 pr-10 text-sm text-luma-text-primary shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-luma-blue disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-luma-text-muted">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  )
})
Select.displayName = "Select"

export { Select }
