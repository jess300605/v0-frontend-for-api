"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, type DashboardData } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"

export function AdminControlPanel() {
  const { user, isAuthenticated } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user?.rol === "admin") {
      loadDashboardData()
    }
  }, [isAuthenticated, user])

  const loadDashboardData = async () => {
    try {
      const response = await api.getDashboard()
      if (response.success && response.data) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error("[v0] Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  // Only show for admin users
  if (!isAuthenticated || user?.rol !== "admin") {
    return null
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <LayoutDashboard className="h-4 w-4" />
          Panel Admin
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Panel de Control Admin</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-8 w-32 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.metricas_principales.ventas_hoy || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    ${(dashboardData?.metricas_principales.monto_hoy || 0).toFixed(2)} en total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.metricas_principales.productos_activos || 0}</div>
                  <p className="text-xs text-muted-foreground">En inventario</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {dashboardData?.metricas_principales.productos_stock_bajo || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Productos requieren atención</p>
                </CardContent>
              </Card>

              <div className="space-y-2 pt-4">
                <Link href="/admin/dashboard" className="block">
                  <Button className="w-full" variant="default">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard Completo
                  </Button>
                </Link>
                <Link href="/admin/productos" className="block">
                  <Button className="w-full bg-transparent" variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    Gestionar Productos
                  </Button>
                </Link>
                <Link href="/admin/ventas" className="block">
                  <Button className="w-full bg-transparent" variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ver Ventas
                  </Button>
                </Link>
                <Link href="/admin/reportes" className="block">
                  <Button className="w-full bg-transparent" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Reportes
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
