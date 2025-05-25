import Image from "next/image"

type LogoVariant = "default" | "icon" | "horizontal" | "vertical" | "dark" | "light"
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl"

interface LogoProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
}

const sizeMap = {
  xs: { width: 24, height: 24 },
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 128, height: 128 },
}

export function Logo({ variant = "default", size = "md", className = "" }: LogoProps) {
  const { width, height } = sizeMap[size]

  // Map variants to the appropriate logo file
  const logoSrc = {
    default: "/images/logos/vibe-logo-full.png",
    icon: "/images/logos/vibe-logo-icon.png",
    horizontal: "/images/logos/vibe-logo-horizontal.png",
    vertical: "/images/logos/vibe-logo-vertical.png",
    dark: "/images/logos/vibe-logo-dark.png",
    light: "/images/logos/vibe-logo-light.png",
  }[variant]

  return (
    <div className={className}>
      <Image src={logoSrc || "/placeholder.svg"} alt="Vibe Dieting Logo" width={width} height={height} priority />
    </div>
  )
}
