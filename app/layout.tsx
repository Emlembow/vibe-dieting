import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vibe Dieting",
  description: "Track your macros with AI-powered nutrition estimates",
  icons: {
    icon: [
      { url: "/images/logos/vibe-logo-icon.png", sizes: "any" },
      { url: "/images/logos/vibe-logo-icon.png", sizes: "16x16", type: "image/png" },
      { url: "/images/logos/vibe-logo-icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/images/logos/vibe-logo-icon.png",
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
