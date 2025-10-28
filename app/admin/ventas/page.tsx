"use client"

import { useState, useEffect } from "react"
import { Eye, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { api, type Venta } from "@/lib/api"
import { formatPrice } from "@/lib/utils"

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    loadVentas()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = ventas.filter(
        (v) =>
          v.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || v.id?.toString().includes(searchTerm),
      )
      setFilteredVentas(filtered)
    } else {
      setFilteredVentas(ventas)
    }
  }, [searchTerm, ventas])

  const loadVentas = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Loading ventas...")
      const response = await api.getVentas()
      console.log("[v0] Ventas API response:", response)
      console.log("[v0] Response.success:", response.success)
      console.log("[v0] Response.data:", response.data)
      console.log("[v0] Is response.data an array?", Array.isArray(response.data))

      if (response.success && response.data) {
        const ventasArray = Array.isArray(response.data) ? response.data : []
        console.log("[v0] Ventas array length:", ventasArray.length)
        console.log("[v0] First venta:", ventasArray[0])
        setVentas(ventasArray)
        setFilteredVentas(ventasArray)
      } else {
        console.log("[v0] No data in response, setting empty arrays")
        setVentas([])
        setFilteredVentas([])
      }
    } catch (error) {
      console.error("[v0] Error loading ventas:", error)
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
        setShowDetailDialog(true)
      }
    } catch (error) {
      console.error("Error loading venta detail:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-muted-foreground">Historial de ventas realizadas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
          <CardDescription>
            {filteredVentas.length} venta{filteredVentas.length !== 1 ? "s" : ""} encontrada
            {filteredVentas.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando ventas...</div>
          ) : filteredVentas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No se encontraron ventas" : "No hay ventas registradas"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVentas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-mono text-sm">#{venta.id}</TableCell>
                      <TableCell className="font-medium">{venta.cliente_nombre || "Cliente"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(venta.fecha)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatPrice(venta.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Completada
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(venta)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Venta #{selectedVenta?.id}</DialogTitle>
            <DialogDescription>Información completa de la venta</DialogDescription>
          </DialogHeader>

          {selectedVenta && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedVenta.cliente_nombre || "Cliente"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDate(selectedVenta.fecha)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Productos</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedVenta.detalles?.map((detalle, index) => (
                        <TableRow key={index}>
                          <TableCell>{detalle.producto?.nombre || "Producto"}</TableCell>
                          <TableCell className="text-right">{detalle.cantidad}</TableCell>
                          <TableCell className="text-right">{formatPrice(detalle.precio_unitario)}</TableCell>
                          <TableCell className="text-right">{formatPrice(detalle.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatPrice(selectedVenta.total)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
