import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  ...props 
}, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-luma-blue disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        {
          // Variants
          // Primary button: white background, black text
          "bg-luma-white text-luma-black hover:bg-luma-white/90 active:scale-[0.98] transition-transform": 
            variant === "default" || variant === "primary",
          // Secondary button: translucent dark, white border
          "bg-luma-card border border-luma-border-default text-luma-text-primary hover:bg-luma-card-hover active:scale-[0.98] transition-transform": 
            variant === "secondary",
          // Muted secondary button: solid/translucent dark, no border or subtle border
          "bg-luma-border-gray/30 border border-luma-border-subtle text-luma-text-semi hover:bg-luma-border-gray/50 hover:text-luma-text-primary": 
            variant === "muted",
          // Ghost button: no background
          "text-luma-text-muted hover:text-luma-text-primary hover:bg-luma-card": 
            variant === "ghost",
          // Danger button: red background, white text
          "bg-luma-red text-luma-white hover:bg-luma-red-hover": 
            variant === "danger",
            
          // Sizes
          "h-7 px-3 text-xs": size === "xs",
          "h-9 px-4 text-sm": size === "sm",
          "h-10 px-5 text-base": size === "default",
          "h-11 px-6 text-base": size === "lg",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
