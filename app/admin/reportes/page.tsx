"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Package, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api, type ReporteVentas, type ReporteProductos } from "@/lib/api"
import { formatPrice } from "@/lib/utils"

export default function ReportesPage() {
  const [reporteVentas, setReporteVentas] = useState<ReporteVentas | null>(null)
  const [reporteProductos, setReporteProductos] = useState<ReporteProductos | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReportes()
  }, [])

  const loadReportes = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Loading reportes...")
      const [ventasResponse, productosResponse] = await Promise.all([api.getReporteVentas(), api.getReporteProductos()])

      console.log("[v0] Ventas report response:", ventasResponse)
      console.log("[v0] Productos report response:", productosResponse)

      if (ventasResponse.success && ventasResponse.data) {
        let reporteData = ventasResponse.data

        // Check if data is nested
        if (typeof reporteData === "object" && "data" in reporteData) {
          reporteData = reporteData.data
        }

        console.log("[v0] Setting reporte ventas:", reporteData)
        setReporteVentas(reporteData)
      }

      if (productosResponse.success && productosResponse.data) {
        let reporteData = productosResponse.data

        // Check if data is nested
        if (typeof reporteData === "object" && "data" in reporteData) {
          reporteData = reporteData.data
        }

        console.log("[v0] Setting reporte productos:", reporteData)
        setReporteProductos(reporteData)
      }
    } catch (error) {
      console.error("[v0] Error loading reportes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">Análisis de ventas y productos</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">Cargando reportes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">Análisis de ventas y productos</p>
      </div>

      {/* Reporte de Ventas */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          Reporte de Ventas
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{formatPrice(reporteVentas?.total_ventas || 0)}</div>
              <p className="text-xs text-muted-foreground">Ingresos totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cantidad de Ventas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reporteVentas?.cantidad_ventas || 0}</div>
              <p className="text-xs text-muted-foreground">Transacciones realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(reporteVentas?.promedio_venta || 0)}</div>
              <p className="text-xs text-muted-foreground">Ticket promedio</p>
            </CardContent>
          </Card>
        </div>

        {reporteVentas?.ventas_por_fecha && reporteVentas.ventas_por_fecha.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Fecha</CardTitle>
              <CardDescription>Detalle de ventas diarias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporteVentas.ventas_por_fecha.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(item.fecha)}</TableCell>
                        <TableCell className="text-right">{item.cantidad}</TableCell>
                        <TableCell className="text-right font-semibold">{formatPrice(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reporte de Productos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Package className="h-6 w-6 text-emerald-600" />
          Reporte de Productos
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reporteProductos?.total_productos || 0}</div>
              <p className="text-xs text-muted-foreground">Productos en catálogo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatPrice(reporteProductos?.valor_total_inventario || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Valor del stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <Package className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{reporteProductos?.productos_stock_bajo || 0}</div>
              <p className="text-xs text-muted-foreground">Requieren reposición</p>
            </CardContent>
          </Card>
        </div>

        {reporteProductos?.productos_por_categoria && reporteProductos.productos_por_categoria.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Productos por Categoría</CardTitle>
              <CardDescription>Distribución del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Stock Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporteProductos.productos_por_categoria.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.categoria}</TableCell>
                        <TableCell className="text-right">{item.cantidad}</TableCell>
                        <TableCell className="text-right">{item.stock_total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
