import * as React from "react"
import { CheckCircle2, AlertTriangle, X } from "lucide-react"
import { cn } from "../../lib/utils"

function Toast({ open, message, type = "success", onClose }) {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (onClose) onClose()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-xl border border-luma-border-default bg-[#1a1c1e]/95 backdrop-blur-md px-4.5 py-3.5 shadow-2xl animate-in slide-in-from-bottom-6 fade-in duration-300 max-w-sm text-luma-text-primary",
      )}
    >
      <div className="shrink-0">
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 text-luma-green" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-luma-yellow" />
        )}
      </div>
      
      <p className="text-sm font-medium leading-none select-none">{message}</p>
      
      <button
        onClick={onClose}
        className="ml-4 shrink-0 rounded-md p-0.5 text-luma-text-muted hover:bg-luma-white/[0.04] hover:text-luma-text-primary transition-all cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export { Toast }
