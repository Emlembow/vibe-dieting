import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vibe Dieting - AI-Powered Macro Tracking",
  description: "Track your macros effortlessly with AI-powered nutrition estimates. Upload food photos, get instant macro breakdowns, and reach your fitness goals with Vibe Dieting.",
  keywords: ["macro tracking", "nutrition", "AI", "fitness", "diet", "health", "calorie counter", "meal tracking"],
  authors: [{ name: "Vibe Dieting Team" }],
  creator: "Vibe Dieting",
  publisher: "Vibe Dieting",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://vibe-dieting.vercel.app'),
  openGraph: {
    title: "Vibe Dieting - AI-Powered Macro Tracking",
    description: "Track your macros effortlessly with AI-powered nutrition estimates. Upload food photos, get instant macro breakdowns, and reach your fitness goals.",
    url: '/',
    siteName: 'Vibe Dieting',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vibe Dieting - AI-Powered Macro Tracking',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vibe Dieting - AI-Powered Macro Tracking",
    description: "Track your macros effortlessly with AI-powered nutrition estimates.",
    images: ['/og-image.png'],
    creator: '@vibedieting',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: '/manifest.json',
  generator: 'Next.js'
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
