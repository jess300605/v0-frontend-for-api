"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Admin Layout - Auth state:", { user: user?.nombre, rol: user?.rol, isLoading })
  }, [user, isLoading])

  useEffect(() => {
    if (!isLoading) {
      console.log("[v0] Admin Layout - Checking access:", { hasUser: !!user, rol: user?.rol })
      if (!user) {
        console.log("[v0] Admin Layout - No user, redirecting to login")
        router.push("/login")
      } else if (user.rol !== "admin") {
        console.log("[v0] Admin Layout - User is not admin, redirecting to home")
        router.push("/")
      } else {
        console.log("[v0] Admin Layout - User is admin, allowing access")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user || user.rol !== "admin") {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </SidebarProvider>
  )
}
