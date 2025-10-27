"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Users, DollarSign, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCard } from "@/components/metric-card"
import { RecentSales } from "@/components/recent-sales"
import { LowStockAlert } from "@/components/low-stock-alert"

interface DashboardData {
  metricas_principales: {
    ventas_hoy: number
    monto_hoy: number
    productos_activos: number
    productos_stock_bajo: number
  }
  fecha_actualizacion: string
  ventas_recientes: Array<{
    id: number
    fecha: string
    total: number
    usuario: string
    items: number
  }>
  productos_bajo_stock_lista: Array<{
    id: number
    nombre: string
    stock_actual: number
    stock_minimo: number
  }>
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, hasPermission } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await api.getDashboard()
      console.log("[v0] Dashboard response:", response)
      if (response.success && response.data) {
        console.log("[v0] Dashboard data:", response.data)
        setData(response.data)
      } else {
        setError(response.message || "Error al cargar datos")
      }
    } catch (err) {
      setError("Error al cargar el dashboard")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadDashboardData}>Reintentar</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.nombre}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Ventas Hoy"
            value={data?.metricas_principales?.ventas_hoy || 0}
            icon={ShoppingCart}
            description="Cantidad de ventas del día"
          />
          <MetricCard
            title="Monto Hoy"
            value={`$${(data?.metricas_principales?.monto_hoy ?? 0).toLocaleString()}`}
            icon={DollarSign}
            description="Total de ventas del día"
          />
          <MetricCard
            title="Productos Activos"
            value={data?.metricas_principales?.productos_activos || 0}
            icon={Package}
            description="Total en inventario"
          />
          <MetricCard
            title="Stock Bajo"
            value={data?.metricas_principales?.productos_stock_bajo || 0}
            icon={AlertCircle}
            description="Productos con stock mínimo"
            variant={data?.metricas_principales?.productos_stock_bajo ? "warning" : "default"}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RecentSales sales={data?.ventas_recientes || []} />
          <LowStockAlert products={data?.productos_bajo_stock_lista || []} />
        </div>

        {hasPermission("dashboard.completo") && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => router.push("/ventas/nueva")}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Nueva Venta
                </Button>
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => router.push("/productos/nuevo")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
                {hasPermission("usuarios.ver") && (
                  <Button className="w-full bg-transparent" variant="outline" onClick={() => router.push("/usuarios")}>
                    <Users className="mr-2 h-4 w-4" />
                    Gestionar Usuarios
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
