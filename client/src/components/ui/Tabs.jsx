import * as React from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext(null)

const Tabs = ({ defaultValue, value, onValueChange, className, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue)

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleValueChange = React.useCallback((val) => {
    setActiveTab(val)
    if (onValueChange) {
      onValueChange(val)
    }
  }, [onValueChange])

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleValueChange }}>
      <div className={cn("w-full", className)} {...props} />
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-start border-b border-luma-border-default pb-px w-full gap-6 text-sm",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  
  const isActive = context.activeTab === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border-b-2 border-transparent text-luma-text-muted hover:text-luma-text-primary cursor-pointer select-none -mb-[2px]",
        {
          "border-luma-white text-luma-text-primary font-semibold": isActive,
        },
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  const isActive = context.activeTab === value

  if (!isActive) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        "mt-6 focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
