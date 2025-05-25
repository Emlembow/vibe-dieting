"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Home, PlusCircle, Settings, LogOut, IceCream } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Add Food",
      href: "/add-food",
      icon: PlusCircle,
    },
    {
      title: "Goals",
      href: "/goals",
      icon: Settings,
    },
    {
      title: "Trends",
      href: "/trends",
      icon: BarChart2,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/10 bg-background">
        <div className="px-2 py-4">
          <Link href="/dashboard" className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 mr-3">
              <IceCream className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Vibe Dieting</h2>
              <p className="text-xs text-muted-foreground">AI-powered nutrition</p>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={item.href}
                    className={`flex items-center ${isActive ? "text-primary bg-muted" : "text-foreground hover:bg-muted/50"}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/10 bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="flex items-center text-foreground hover:bg-muted/50">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
