"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Venta } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface SaleDetailDialogProps {
  open: boolean
  onClose: () => void
  venta: Venta | null
}

export function SaleDetailDialog({ open, onClose, venta }: SaleDetailDialogProps) {
  if (!venta) return null

  const fechaVenta = venta.fecha || venta.created_at

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Venta #{venta.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {fechaVenta ? format(new Date(fechaVenta), "dd/MM/yyyy HH:mm", { locale: es }) : "N/A"}
              </p>
            </div>
            {venta.nombre_cliente && (
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{venta.nombre_cliente}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <div className="mt-1">{getEstadoBadge(venta.estado)}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">${venta.total.toLocaleString()}</p>
            </div>
          </div>

          {(() => {
            console.log("[v0] Venta completa:", venta)
            console.log("[v0] Detalles de venta:", venta.detalles)
            console.log("[v0] Tipo de detalles:", typeof venta.detalles, Array.isArray(venta.detalles))

            if (!venta.detalles) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay detalles de productos disponibles</p>
                  <p className="text-xs mt-2">La venta no incluye información de productos</p>
                </div>
              )
            }

            if (!Array.isArray(venta.detalles)) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Error al cargar los detalles de productos</p>
                  <p className="text-xs mt-2">Formato de datos incorrecto</p>
                </div>
              )
            }

            if (venta.detalles.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Esta venta no tiene productos asociados</p>
                </div>
              )
            }

            return (
              <div>
                <h3 className="font-semibold mb-3">Productos ({venta.detalles.length})</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {venta.detalles.map((detalle, index) => {
                        console.log("[v0] Detalle individual:", detalle)
                        return (
                          <TableRow key={detalle.id || index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {detalle.producto_nombre || detalle.nombre_producto || "Producto sin nombre"}
                                </p>
                                {(detalle.producto_codigo || detalle.codigo_producto) && (
                                  <p className="text-sm text-muted-foreground">
                                    {detalle.producto_codigo || detalle.codigo_producto}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ${(detalle.precio_unitario || detalle.precio || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">{detalle.cantidad || 0}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${(detalle.subtotal || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          })()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
