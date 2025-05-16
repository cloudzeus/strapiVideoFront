"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart,
  Building2,
  Menu,
  X,
  Calendar,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "User Management",
    href: "/users",
    icon: Users,
  },
  {
    name: "Organizations",
    href: "/organizations",
    icon: Building2,
  },
  {
    name: "Meetings Management",
    href: "/meetings",
    icon: Calendar,
  },

]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      const width = window.innerWidth
      setIsMobile(width < 1024) // Changed to lg breakpoint
      if (width >= 1024) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <Sidebar 
        className={cn(
          "fixed lg:sticky top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-300 ease-in-out",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0",
          "lg:translate-x-0"
        )}
      >
        <ScrollArea className="h-full">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <div className="space-y-4">
                {navigation.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href && "bg-muted font-[10px]"
                    )}
                    asChild
                  >
                    <Link 
                      href={item.href} 
                      className="flex items-center"
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      <div className="mr-1 flex h-7 w-7 items-center justify-center rounded-[8px] bg-gray-900">
                        <item.icon className="h-3 w-3 text-orange-500" />
                      </div>
                      <span className="text-[10px] font-semibold">{item.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </Sidebar>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
} 