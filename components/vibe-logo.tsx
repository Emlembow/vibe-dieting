import { Sparkles } from "lucide-react"

export function VibeLogo({ size = "md", showText = true }: VibeLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  }

  return (
    <div className="flex items-center">
      <div
        className={`relative flex ${sizeClasses[size]} items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-500`}
      >
        <span className={`${textSizeClasses[size]} font-bold text-white`}>V</span>
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />
      </div>
      {showText && (
        <div className="ml-3">
          <h2 className="font-bold tracking-tight">Vibe Dieting</h2>
          <p className="text-xs text-muted-foreground">AI-powered nutrition</p>
        </div>
      )}
    </div>
  )
}

interface VibeLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}
