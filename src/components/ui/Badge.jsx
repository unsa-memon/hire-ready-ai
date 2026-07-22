import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-md hover:bg-primary/80",
        secondary:
          "border-transparent bg-surface-100 text-foreground hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700",
        destructive:
          "border-transparent bg-red-500/10 text-red-500 hover:bg-red-500/20",
        outline: "text-foreground",
        success: "border-transparent bg-green-500/10 text-green-500 hover:bg-green-500/20",
        premium: "border-transparent bg-gradient-to-r from-primary/20 to-cyan-500/20 text-primary hover:from-primary/30 hover:to-cyan-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
