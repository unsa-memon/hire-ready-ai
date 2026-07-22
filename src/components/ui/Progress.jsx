import * as React from "react"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800 shadow-inner",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-primary to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
