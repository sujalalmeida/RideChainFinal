"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Car, CreditCard, Home, LogOut, Menu, MessageSquare, Settings, Shield, User } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"

interface RiderLayoutProps {
  children: React.ReactNode
}

export function RiderLayout({ children }: RiderLayoutProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, logout } = useAppContext()

  const routes = [
    {
      href: "/rider/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/rider/dashboard",
    },
    {
      href: "/rider/book",
      label: "Book a Ride",
      icon: Car,
      active: pathname === "/rider/book",
    },
    {
      href: "/rider/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/rider/profile",
    },
    {
      href: "/rider/payments",
      label: "Payments",
      icon: CreditCard,
      active: pathname === "/rider/payments",
    },
    {
      href: "/rider/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname === "/rider/messages",
    },
    {
      href: "/rider/safety",
      label: "Safety",
      icon: Shield,
      active: pathname === "/rider/safety" || pathname === "/rider/security",
    },
    {
      href: "/rider/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/rider/settings",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="md:hidden mr-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm ${
                        route.active
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Link>
                  ))}
                  <Button
                    variant="ghost"
                    className="justify-start px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-indigo-600" />
            <Link href="/rider/dashboard" className="font-bold">
              RideChain
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-5 mx-6">
            {routes.slice(0, 4).map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-2 text-sm ${
                  route.active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-indigo-600"></span>
              <span className="sr-only">Notifications</span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt={user?.name || "User"} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  )
}

