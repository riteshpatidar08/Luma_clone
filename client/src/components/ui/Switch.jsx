import * as React from "react"
import { cn } from "../../lib/utils"

const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [internalChecked, setInternalChecked] = React.useState(checked || false)

  React.useEffect(() => {
    if (checked !== undefined) {
      setInternalChecked(checked)
    }
  }, [checked])

  const handleToggle = () => {
    const nextState = !internalChecked
    setInternalChecked(nextState)
    if (onCheckedChange) {
      onCheckedChange(nextState)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={internalChecked}
      data-state={internalChecked ? "checked" : "unchecked"}
      onClick={handleToggle}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luma-blue focus-visible:ring-offset-2 focus-visible:ring-offset-luma-bg disabled:cursor-not-allowed disabled:opacity-50",
        internalChecked ? "bg-luma-blue" : "bg-luma-border-gray",
        className
      )}
      ref={ref}
      {...props}
    >
      <span
        data-state={internalChecked ? "checked" : "unchecked"}
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-luma-white shadow-lg ring-0 transition-transform duration-200",
          internalChecked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }
