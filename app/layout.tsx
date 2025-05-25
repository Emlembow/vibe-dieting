import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: "Vibe Dieting",
  description: "Track your macros with AI-powered nutrition estimates",
  metadataBase: new URL(siteUrl),

  // Basic OpenGraph metadata
  openGraph: {
    title: "Vibe Dieting - AI-Powered Macro Tracking",
    description:
      "Track your nutrition with our fun, AI-powered macro tracker. Get instant nutrition estimates for any food!",
    url: siteUrl,
    siteName: "Vibe Dieting",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Vibe Dieting - AI-Powered Macro Tracking",
      },
      {
        url: "/og/og-image-1200x1200.png",
        width: 1200,
        height: 1200,
        alt: "Vibe Dieting - AI-Powered Macro Tracking",
      },
      {
        url: "/og/og-image-800x600.png",
        width: 800,
        height: 600,
        alt: "Vibe Dieting - AI-Powered Macro Tracking",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Vibe Dieting - AI-Powered Macro Tracking",
    description:
      "Track your nutrition with our fun, AI-powered macro tracker. Get instant nutrition estimates for any food!",
    creator: "@vibedieting",
    images: ["/og/twitter-card-1200x628.png"],
  },

  // App icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png",
      },
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#F960B1",
      },
    ],
  },

  // Additional metadata
  applicationName: "Vibe Dieting",
  keywords: ["nutrition", "diet", "macro tracking", "AI", "food tracking", "health", "fitness"],
  authors: [{ name: "Vibe Dieting Team" }],
  creator: "Vibe Dieting",
  publisher: "Vibe Dieting",
  formatDetection: {
    telephone: false,
  },
  themeColor: "#F960B1",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  category: "Health & Fitness",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Explicit link tag for Apple Touch Icon for maximum compatibility */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
