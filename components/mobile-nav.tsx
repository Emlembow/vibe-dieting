"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, IceCream, LayoutDashboard, PlusCircle, Settings, BarChart2, LogOut, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/add-food",
      label: "Add Food",
      icon: <PlusCircle className="h-5 w-5" />,
      active: pathname === "/add-food",
    },
    {
      href: "/goals",
      label: "Goals",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/goals",
    },
    {
      href: "/trends",
      label: "Trends",
      icon: <BarChart2 className="h-5 w-5" />,
      active: pathname === "/trends",
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/dashboard" className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 mr-2">
            <IceCream className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">Vibe Dieting</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <SheetHeader className="border-b pb-4 mb-4">
              <SheetTitle className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 mr-2">
                  <IceCream className="h-4 w-4 text-white" />
                </div>
                <span>Vibe Dieting</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-3 py-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    route.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {route.icon}
                  <span className="ml-3">{route.label}</span>
                </Link>
              ))}
              <Link
                href="https://github.com/Emlembow/vibe-dieting"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Github className="h-5 w-5" />
                <span className="ml-3">View Source</span>
              </Link>
              <Button
                variant="ghost"
                className="flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setOpen(false)
                  handleSignOut()
                }}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Sign Out</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
