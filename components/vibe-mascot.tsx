import { IceCream } from "lucide-react"

const sizeMap = {
  xs: { icon: 16, container: 24, text: "text-sm" },
  sm: { icon: 20, container: 32, text: "text-base" },
  md: { icon: 24, container: 40, text: "text-xl" },
  lg: { icon: 32, container: 56, text: "text-2xl" },
  xl: { icon: 48, container: 80, text: "text-3xl" },
}

export function VibeMascot({ size = "md", withText = false, className = "" }: VibeMascotProps) {
  const { icon, container, text } = sizeMap[size]

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400`}
        style={{ width: `${container}px`, height: `${container}px` }}
      >
        <IceCream className={`text-white`} style={{ width: `${icon}px`, height: `${icon}px` }} />
      </div>
      {withText && (
        <div className="ml-3">
          <h2 className={`font-bold tracking-tight ${text}`}>Vibe Dieting</h2>
          {size !== "xs" && size !== "sm" && <p className="text-xs text-muted-foreground">AI-powered nutrition</p>}
        </div>
      )}
    </div>
  )
}

interface VibeMascotProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  withText?: boolean
  className?: string
}
