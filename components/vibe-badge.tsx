import type React from "react"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface VibeBadgeProps {
  className?: string
  children: React.ReactNode
}

export function VibeBadge({ className, children }: VibeBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 text-xs font-medium text-white",
        className,
      )}
    >
      <Sparkles className="mr-1 h-3 w-3" />
      {children}
    </div>
  )
}
