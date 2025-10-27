"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Eye, XCircle } from "lucide-react"
import { api, type Venta } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { SaleDetailDialog } from "@/components/sale-detail-dialog"

export default function VentasPage() {
  const { user, hasPermission } = useAuth()
  const router = useRouter()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  useEffect(() => {
    if (!hasPermission("ventas.ver")) {
      router.push("/dashboard")
    } else {
      loadVentas()
    }
  }, [hasPermission, router])

  useEffect(() => {
    const filtered = ventas.filter(
      (v) =>
        v.id.toString().includes(searchTerm) ||
        v.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.estado.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredVentas(filtered)
  }, [searchTerm, ventas])

  const loadVentas = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Cargando ventas...")
      const response = await api.getVentas()
      console.log("[v0] Respuesta completa:", response)

      if (response.success && response.data) {
        // La API devuelve { success: true, data: { ventas: [...], paginacion: {...} } }
        const ventasData = (response.data as any).ventas || response.data
        console.log("[v0] Ventas extraídas:", ventasData)
        if (Array.isArray(ventasData) && ventasData.length > 0) {
          console.log("[v0] Primera venta (verificar usuario_nombre):", ventasData[0])
        }

        if (Array.isArray(ventasData)) {
          setVentas(ventasData)
          setFilteredVentas(ventasData)
        } else {
          console.error("[v0] Los datos de ventas no son un array:", ventasData)
          setVentas([])
          setFilteredVentas([])
        }
      } else {
        console.error("[v0] Respuesta sin éxito o sin datos")
        setVentas([])
        setFilteredVentas([])
      }
    } catch (error) {
      console.error("[v0] Error al cargar ventas:", error)
      setVentas([])
      setFilteredVentas([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetail = async (venta: Venta) => {
    try {
      const response = await api.getVenta(venta.id)
      if (response.success && response.data) {
        setSelectedVenta(response.data)
        setIsDetailDialogOpen(true)
      }
    } catch (error) {
      console.error("Error al cargar detalle de venta:", error)
    }
  }

  const handleCancelSale = async (ventaId: number) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta venta?")) return

    try {
      const response = await api.cancelVenta(ventaId)
      if (response.success) {
        await loadVentas()
      }
    } catch (error) {
      console.error("Error al cancelar venta:", error)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completada":
        return <Badge variant="secondary">Completada</Badge>
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
      case "pendiente":
        return <Badge className="bg-orange-500">Pendiente</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
            <p className="text-muted-foreground">Gestiona las ventas y transacciones</p>
          </div>
          {hasPermission("ventas.crear") && (
            <Button onClick={() => router.push("/ventas/nueva")}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>
              {filteredVentas.length} {filteredVentas.length === 1 ? "venta" : "ventas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, cliente o estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Cargando ventas...</p>
              </div>
            ) : filteredVentas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm ? "No se encontraron ventas" : "No hay ventas registradas"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVentas.map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell className="font-mono">#{venta.id}</TableCell>
                        <TableCell>{format(new Date(venta.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                        <TableCell className="font-medium">{venta.nombre_cliente || "N/A"}</TableCell>
                        <TableCell className="text-right font-medium">${venta.total.toLocaleString()}</TableCell>
                        <TableCell>{getEstadoBadge(venta.estado)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewDetail(venta)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {hasPermission("ventas.cancelar") && venta.estado === "completada" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancelSale(venta.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SaleDetailDialog
        open={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false)
          setSelectedVenta(null)
        }}
        venta={selectedVenta}
      />
    </DashboardLayout>
  )
}
