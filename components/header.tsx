"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, IceCream } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { SidebarNav } from "./sidebar-nav"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-14 items-center">
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <SidebarNav />
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 mr-2">
              <IceCream className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Vibe Dieting</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
