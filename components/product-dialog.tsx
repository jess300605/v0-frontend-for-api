"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, type Producto } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface ProductDialogProps {
  open: boolean
  onClose: (refresh: boolean) => void
  product?: Producto | null
}

export function ProductDialog({ open, onClose, product }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    stock_actual: "",
    stock_minimo: "",
    url_imagen: "",
    activo: true,
  })
  const [originalCodigo, setOriginalCodigo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (product) {
      console.log("[v0] Editing product:", product)
      const codigoValue = product.codigo_sku || ""
      setFormData({
        codigo: codigoValue,
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        categoria: product.categoria || "",
        precio: product.precio?.toString() || "0",
        stock_actual: product.stock?.toString() || "0",
        stock_minimo: product.stock_minimo?.toString() || "0",
        url_imagen: product.url_imagen || "",
        activo: product.activo ?? true,
      })
      setOriginalCodigo(codigoValue)
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: "",
        stock_actual: "",
        stock_minimo: "",
        url_imagen: "",
        activo: true,
      })
      setOriginalCodigo("")
    }
    setError("")
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const precio = Number.parseFloat(formData.precio)
      const stock = Number.parseInt(formData.stock_actual)
      const stock_minimo = Number.parseInt(formData.stock_minimo)

      if (isNaN(precio) || precio < 0) {
        setError("El precio debe ser un número válido mayor o igual a 0")
        setIsLoading(false)
        return
      }

      if (isNaN(stock) || stock < 0) {
        setError("El stock debe ser un número válido mayor o igual a 0")
        setIsLoading(false)
        return
      }

      if (isNaN(stock_minimo) || stock_minimo < 0) {
        setError("El stock mínimo debe ser un número válido mayor o igual a 0")
        setIsLoading(false)
        return
      }

      const data: any = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        categoria: formData.categoria.trim(),
        precio: precio,
        stock: stock,
        stock_minimo: stock_minimo,
        url_imagen: formData.url_imagen.trim() || undefined,
        activo: formData.activo,
      }

      // Only send codigo_sku if it's a new product or if it has changed
      const codigoTrimmed = formData.codigo.trim()
      if (!product || codigoTrimmed !== originalCodigo) {
        data.codigo_sku = codigoTrimmed
      }

      console.log("[v0] Form data before submit:", formData)
      console.log("[v0] Sending product data:", data)
      console.log("[v0] Product ID:", product?.id)
      console.log("[v0] Original codigo:", originalCodigo, "New codigo:", codigoTrimmed)
      console.log("[v0] Is creating new product:", !product)

      const response = product ? await api.updateProducto(product.id, data) : await api.createProducto(data)

      console.log("[v0] Response received:", response)
      console.log("[v0] Response.success:", response.success)
      console.log("[v0] Response.data:", response.data)
      console.log("[v0] Response.message:", response.message)

      if (response.success) {
        console.log("[v0] Product saved successfully, closing dialog with refresh=true")
        onClose(true)
      } else {
        console.error("[v0] Product save failed:", response.message)
        setError(response.message || "Error al guardar el producto")
      }
    } catch (err) {
      console.error("[v0] Error saving product:", err)
      setError(err instanceof Error ? err.message : "Error al guardar el producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {product ? "Actualiza la información del producto" : "Agrega un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="whitespace-pre-line text-sm mt-2">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código SKU *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
                disabled={isLoading}
                placeholder="SKU-001"
              />
              {product && (
                <p className="text-xs text-muted-foreground">Solo modifica el código si necesitas cambiarlo</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
                disabled={isLoading}
                placeholder="Electrónica"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              disabled={isLoading}
              placeholder="Nombre del producto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              disabled={isLoading}
              placeholder="Descripción detallada del producto"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_imagen">URL de Imagen (Google)</Label>
            <Input
              id="url_imagen"
              type="url"
              value={formData.url_imagen}
              onChange={(e) => setFormData({ ...formData, url_imagen: e.target.value })}
              disabled={isLoading}
              placeholder="https://example.com/imagen.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Pega aquí la URL de una imagen de Google para personalizar la imagen del producto
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
                disabled={isLoading}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_actual">Stock Actual *</Label>
              <Input
                id="stock_actual"
                type="number"
                min="0"
                value={formData.stock_actual}
                onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                required
                disabled={isLoading}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
              <Input
                id="stock_minimo"
                type="number"
                min="0"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                required
                disabled={isLoading}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="activo" className="text-base">
                Producto Activo
              </Label>
              <p className="text-sm text-muted-foreground">Los productos activos se muestran en el catálogo público</p>
            </div>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : product ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
