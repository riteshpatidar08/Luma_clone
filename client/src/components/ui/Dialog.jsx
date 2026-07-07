import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const DialogContext = React.createContext(null)

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ asChild, children, ...props }) {
  const { onOpenChange } = React.useContext(DialogContext)
  
  const handleClick = (e) => {
    onOpenChange(true)
    if (children.props?.onClick) {
      children.props.onClick(e)
    }
  }

  if (asChild) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...props
    })
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

function DialogContent({ className, children, ...props }) {
  const { open, onOpenChange } = React.useContext(DialogContext)

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-luma-black/75 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Dialog Box */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-2xl border border-luma-border-default bg-[#1a1c1e] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-luma-text-primary",
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-luma-text-muted hover:bg-luma-white/[0.04] hover:text-luma-text-primary transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-left pb-4 border-b border-luma-border-subtle", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-luma-border-subtle mt-6", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-luma-text-primary", className)}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-luma-text-muted mt-1.5", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
