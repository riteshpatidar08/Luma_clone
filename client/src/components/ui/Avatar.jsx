import * as React from "react"
import { cn } from "../../lib/utils"

const Avatar = React.forwardRef(({ className, src, alt, fallback, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    setHasError(false)
  }, [src])

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-luma-border-default bg-luma-card/40",
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full aspect-square object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-luma-indigo/35 to-luma-blue/35 text-xs font-semibold text-luma-text-primary uppercase select-none">
          {fallback || "U"}
        </div>
      )}
    </div>
  )
})
Avatar.displayName = "Avatar"

export { Avatar }
