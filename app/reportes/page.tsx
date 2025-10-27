"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, type ReporteVentas, type ReporteProductos } from "@/lib/api"
import { SalesChart } from "@/components/sales-chart"
import { TopProductsChart } from "@/components/top-products-chart"
import { CategoryChart } from "@/components/category-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ReportesPage() {
  const { hasPermission } = useAuth()
  const router = useRouter()
  const [reporteVentas, setReporteVentas] = useState<ReporteVentas | null>(null)
  const [reporteProductos, setReporteProductos] = useState<ReporteProductos | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!hasPermission("reportes.ventas")) {
      router.push("/dashboard")
    } else {
      loadReportes()
    }
  }, [hasPermission, router])

  const loadReportes = async () => {
    try {
      setIsLoading(true)
      const [ventasResponse, productosResponse] = await Promise.all([api.getReporteVentas(), api.getReporteProductos()])

      console.log("[v0] Ventas Response completo:", ventasResponse)
      console.log("[v0] Ventas Response.data:", ventasResponse.data)
      console.log("[v0] Productos Response completo:", productosResponse)
      console.log("[v0] Productos Response.data:", productosResponse.data)

      if (ventasResponse.success && ventasResponse.data) {
        console.log("[v0] Setting reporte ventas:", ventasResponse.data)
        setReporteVentas(ventasResponse.data)
      } else {
        console.error("[v0] No se pudo cargar reporte de ventas:", ventasResponse)
      }

      if (productosResponse.success && productosResponse.data) {
        console.log("[v0] Setting reporte productos:", productosResponse.data)
        setReporteProductos(productosResponse.data)
      } else {
        console.error("[v0] No se pudo cargar reporte de productos:", productosResponse)
      }
    } catch (error) {
      console.error("[v0] Error al cargar reportes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando reportes...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Visualiza el rendimiento de tu negocio</p>
        </div>

        <Tabs defaultValue="ventas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="productos">Productos</TabsTrigger>
          </TabsList>

          <TabsContent value="ventas" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${reporteVentas?.total_ventas.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Período actual</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporteVentas?.total_transacciones || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ventas completadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${reporteVentas?.ticket_promedio.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Por transacción</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporteVentas?.productos_vendidos || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Unidades totales</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SalesChart data={reporteVentas?.ventas_por_dia || []} />
              <TopProductsChart data={reporteVentas?.productos_mas_vendidos || []} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ventas por Usuario</CardTitle>
                <CardDescription>Rendimiento del equipo de ventas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Promedio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporteVentas?.ventas_por_usuario.map((usuario) => (
                        <TableRow key={usuario.usuario_id}>
                          <TableCell className="font-medium">{usuario.usuario_nombre}</TableCell>
                          <TableCell className="text-right">{usuario.total_ventas}</TableCell>
                          <TableCell className="text-right">${usuario.monto_total.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${usuario.promedio.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="productos" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporteProductos?.total_productos || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">En inventario</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${reporteProductos?.valor_total_inventario.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Valor total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporteProductos?.productos_bajo_stock || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Requieren reabastecimiento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporteProductos?.productos_sin_stock || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Agotados</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <CategoryChart data={reporteProductos?.productos_por_categoria || []} />

              <Card>
                <CardHeader>
                  <CardTitle>Productos Más Vendidos</CardTitle>
                  <CardDescription>Top 10 productos por unidades vendidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reporteProductos?.productos_mas_vendidos.slice(0, 10).map((producto, index) => (
                      <div key={producto.producto_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">{producto.producto_nombre}</p>
                            <p className="text-xs text-muted-foreground">{producto.categoria}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{producto.total_vendido} unidades</p>
                          <p className="text-xs text-muted-foreground">${producto.ingresos.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventario por Categoría</CardTitle>
                <CardDescription>Distribución de stock por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Productos</TableHead>
                        <TableHead className="text-right">Stock Total</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporteProductos?.productos_por_categoria.map((categoria) => (
                        <TableRow key={categoria.categoria}>
                          <TableCell className="font-medium">{categoria.categoria}</TableCell>
                          <TableCell className="text-right">{categoria.total_productos}</TableCell>
                          <TableCell className="text-right">{categoria.stock_total}</TableCell>
                          <TableCell className="text-right">${categoria.valor_total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
