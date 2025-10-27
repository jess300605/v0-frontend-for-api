"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Package } from "lucide-react"
import type { Producto } from "@/lib/api"

interface ProductCardProps {
  product: Producto
  onEdit?: (product: Producto) => void
  onDelete?: (product: Producto) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ProductCard({ product, onEdit, onDelete, canEdit, canDelete }: ProductCardProps) {
  const getStockStatus = () => {
    if ((product.stock ?? 0) === 0) {
      return { variant: "destructive" as const, label: "Sin stock" }
    }
    if ((product.stock ?? 0) <= (product.stock_minimo ?? 0)) {
      return { variant: "default" as const, label: "Stock bajo", className: "bg-orange-500 hover:bg-orange-600" }
    }
    return { variant: "secondary" as const, label: "En stock" }
  }

  const stockStatus = getStockStatus()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate">{product.nombre}</h3>
            <p className="text-sm text-muted-foreground font-mono">{product.codigo_sku}</p>
          </div>
          <Badge variant={stockStatus.variant} className={stockStatus.className}>
            {stockStatus.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Categoría</span>
            <span className="text-sm font-medium">{product.categoria || "Sin categoría"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Precio</span>
            <span className="text-lg font-bold text-primary">${Number(product.precio ?? 0).toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stock</span>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {Number(product.stock ?? 0)} / {Number(product.stock_minimo ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {(canEdit || canDelete) && (
        <CardFooter className="pt-3 border-t bg-muted/50">
          <div className="flex gap-2 w-full">
            {canEdit && (
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onEdit?.(product)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                onClick={() => onDelete?.(product)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
