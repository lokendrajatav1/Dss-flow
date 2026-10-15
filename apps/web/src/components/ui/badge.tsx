import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    const variants = {
      default: "inline-flex items-center rounded-full border border-input bg-background px-2.5 py-0.5 text-sm font-semibold ring-offset-background",
      secondary: "inline-flex items-center rounded-full border border-secondary bg-secondary/10 px-2.5 py-0.5 text-sm font-semibold ring-offset-background",
      destructive: "inline-flex items-center rounded-full border border-destructive bg-destructive/10 px-2.5 py-0.5 text-sm font-semibold ring-offset-background",
      outline: "inline-flex items-center rounded-full border border-input bg-transparent px-2.5 py-0.5 text-sm font-semibold ring-offset-background",
      ghost: "inline-flex items-center rounded-full bg-transparent px-2.5 py-0.5 text-sm font-semibold ring-offset-background",
      link: "underline-offset-4 hover:underline text-primary",
    }

    return (
      <span
        className={cn(
          variants[variant || "default"],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }