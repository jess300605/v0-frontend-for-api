"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { api, type DashboardData, type Venta, type Producto } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [recentSales, setRecentSales] = useState<Venta[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user && user.rol !== "admin") {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.rol === "admin") {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const [ventasRes, productosRes] = await Promise.all([api.getVentas(), api.getProductos()])

      let ventas: Venta[] = []
      let productos: Producto[] = []

      if (ventasRes.success && ventasRes.data) {
        ventas = Array.isArray(ventasRes.data) ? ventasRes.data : ventasRes.data.ventas || []
        setRecentSales(ventas.slice(0, 5))
      }

      if (productosRes.success && productosRes.data) {
        productos = Array.isArray(productosRes.data) ? productosRes.data : productosRes.data.productos || []
        const lowStock = productos.filter((p: Producto) => p.stock <= p.stock_minimo && p.activo)
        setLowStockProducts(lowStock.slice(0, 5))
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const ventasHoy = ventas.filter((v) => {
        const ventaDate = new Date(v.created_at || v.fecha)
        ventaDate.setHours(0, 0, 0, 0)
        return ventaDate.getTime() === today.getTime()
      })

      const metricas = {
        ventas_hoy: ventasHoy.length,
        monto_hoy: ventasHoy.reduce((sum, v) => sum + Number(v.total || 0), 0),
        productos_activos: productos.filter((p) => p.activo).length,
        productos_stock_bajo: productos.filter((p) => p.stock <= p.stock_minimo && p.activo).length,
      }

      setDashboardData({
        metricas_principales: metricas,
        fecha_actualizacion: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[v0] Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const metrics = dashboardData?.metricas_principales

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Control</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.nombre}</p>
        </div>
        <Button asChild>
          <Link href="/admin/ventas/nueva">Nueva Venta</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.ventas_hoy || 0}</div>
            <p className="text-xs text-muted-foreground">transacciones completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics?.monto_hoy || 0)}</div>
            <p className="text-xs text-muted-foreground">en ventas del día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.productos_activos || 0}</div>
            <p className="text-xs text-muted-foreground">en catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.productos_stock_bajo || 0}</div>
            <p className="text-xs text-muted-foreground">productos requieren atención</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimas 5 transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map((venta) => (
                  <div key={venta.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{venta.nombre_cliente || "Cliente"}</p>
                      <p className="text-sm text-muted-foreground">{new Date(venta.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(venta.total)}</p>
                      <p className="text-xs text-muted-foreground">{venta.estado}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/admin/ventas">Ver todas las ventas</Link>
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay ventas recientes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de Stock</CardTitle>
            <CardDescription>Productos con stock bajo</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">{producto.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{producto.stock} unidades</p>
                      <p className="text-xs text-muted-foreground">Mín: {producto.stock_minimo}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/admin/productos">Ver todos los productos</Link>
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay productos con stock bajo</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild variant="outline" className="h-20 bg-transparent">
              <Link href="/admin/ventas/nueva">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Nueva Venta
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 bg-transparent">
              <Link href="/admin/productos">
                <Package className="mr-2 h-5 w-5" />
                Gestionar Productos
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 bg-transparent">
              <Link href="/admin/reportes">
                <TrendingUp className="mr-2 h-5 w-5" />
                Ver Reportes
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 bg-transparent">
              <Link href="/admin/ventas">
                <Users className="mr-2 h-5 w-5" />
                Ver Ventas
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
