"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getProductImage } from "@/lib/product-images"
import { Package, Tag, Layers } from "lucide-react"

interface Producto {
  id: number
  nombre: string
  descripcion?: string | null
  precio: number
  categoria: string
  codigo_sku?: string | null
  stock: number
  stock_minimo: number
  url_imagen?: string | null
  activo: boolean
}

interface ProductDetailDialogProps {
  producto: Producto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailDialog({ producto, open, onOpenChange }: ProductDetailDialogProps) {
  if (!producto) return null

  const imageUrl = getProductImage(producto)
  const inStock = producto.stock > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{producto.nombre}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={producto.nombre}
              fill
              className="object-cover"
              key={imageUrl}
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-4">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">${Number(producto.precio || 0).toFixed(2)}</span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              {inStock ? (
                <Badge variant="default" className="bg-green-600">
                  En Stock ({producto.stock} disponibles)
                </Badge>
              ) : (
                <Badge variant="destructive">Agotado</Badge>
              )}
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{producto.categoria}</Badge>
            </div>

            {/* SKU */}
            {producto.codigo_sku && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-mono">SKU: {producto.codigo_sku}</span>
              </div>
            )}

            {/* Description */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {producto.descripcion || "Sin descripción disponible."}
              </p>
            </div>

            {/* Stock Warning */}
            {inStock && producto.stock <= producto.stock_minimo && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">⚠️ Pocas unidades disponibles</p>
              </div>
            )}

            {/* Action Button */}
            <Button className="mt-4 w-full" size="lg" disabled={!inStock}>
              {inStock ? "Agregar al Carrito" : "No Disponible"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
