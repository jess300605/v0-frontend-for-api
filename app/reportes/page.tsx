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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Package, DollarSign } from "lucide-react"
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

      console.log("[v0] Loading reportes...")

      let ventasResponse
      let productosResponse

      try {
        console.log("[v0] Fetching ventas report...")
        ventasResponse = await api.getReporteVentas()
        console.log("[v0] Ventas Response completo:", ventasResponse)
      } catch (error) {
        console.error("[v0] Error loading ventas report:", error)
      }

      try {
        console.log("[v0] Fetching productos report...")
        productosResponse = await api.getReporteProductos()
        console.log("[v0] Productos Response completo:", productosResponse)
      } catch (error) {
        console.error("[v0] Error loading productos report:", error)
      }

      if (ventasResponse?.success && ventasResponse.data) {
        console.log("[v0] Setting reporte ventas:", ventasResponse.data)
        setReporteVentas(ventasResponse.data)
      } else {
        console.log("[v0] No ventas data available")
      }

      if (productosResponse?.success && productosResponse.data) {
        console.log("[v0] Setting reporte productos:", productosResponse.data)
        setReporteProductos(productosResponse.data)
      } else {
        console.log("[v0] No productos data available")
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
                  <div className="text-2xl font-bold">
                    ${reporteVentas?.resumen?.monto_total?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Período actual</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporteVentas?.resumen?.total_ventas || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ventas completadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${reporteVentas?.resumen?.promedio_venta?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Por transacción</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reporteVentas?.resumen?.crecimiento_monto?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">vs período anterior</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SalesChart data={reporteVentas?.grafico_ventas || []} />
              <TopProductsChart data={reporteVentas?.top_productos || []} />
            </div>
          </TabsContent>

          <TabsContent value="productos" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporteProductos?.totales?.productos_analizados || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Analizados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${reporteProductos?.totales?.ingresos_totales?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Generados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporteProductos?.totales?.unidades_totales || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </CardContent>
              </Card>
            </div>

            {!reporteProductos?.productos || reporteProductos.productos.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No hay datos de productos disponibles</p>
                    <p className="text-sm mt-2">Los reportes se generarán cuando haya ventas registradas</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Productos Más Vendidos</CardTitle>
                    <CardDescription>Top productos por rendimiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reporteProductos.productos.slice(0, 10).map((item, index) => (
                        <div key={item.producto.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{item.producto.nombre}</p>
                              <p className="text-xs text-muted-foreground">{item.producto.categoria}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.estadisticas.total_vendido} unidades</p>
                            <p className="text-xs text-muted-foreground">
                              ${item.estadisticas.ingresos_generados.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalle de Productos</CardTitle>
                    <CardDescription>Estadísticas completas por producto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Vendidos</TableHead>
                            <TableHead className="text-right">Ingresos</TableHead>
                            <TableHead className="text-right">% Ingresos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reporteProductos.productos.map((item) => (
                            <TableRow key={item.producto.id}>
                              <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                              <TableCell>{item.producto.categoria}</TableCell>
                              <TableCell className="text-right">{item.estadisticas.total_vendido}</TableCell>
                              <TableCell className="text-right">
                                ${item.estadisticas.ingresos_generados.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.estadisticas.porcentaje_ingresos.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
