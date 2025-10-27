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
              <p className="font-medium">{format(new Date(venta.fecha), "dd/MM/yyyy HH:mm", { locale: es })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="font-medium">{venta.usuario_nombre || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <div className="mt-1">{getEstadoBadge(venta.estado)}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">${venta.total.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Productos</h3>
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
                  {venta.detalles?.map((detalle, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{detalle.producto_nombre}</p>
                          <p className="text-sm text-muted-foreground">{detalle.producto_codigo}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${detalle.precio_unitario.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{detalle.cantidad}</TableCell>
                      <TableCell className="text-right font-medium">${detalle.subtotal.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
