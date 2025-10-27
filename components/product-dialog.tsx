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
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (product) {
      console.log("[v0] Editing product:", product)
      setFormData({
        codigo: product.codigo_sku || "",
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        categoria: product.categoria || "",
        precio: product.precio?.toString() || "0",
        stock_actual: product.stock?.toString() || "0",
        stock_minimo: product.stock_minimo?.toString() || "0",
      })
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: "",
        stock_actual: "",
        stock_minimo: "",
      })
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

      const data = {
        codigo_sku: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        categoria: formData.categoria.trim(),
        precio: precio,
        stock: stock,
        stock_minimo: stock_minimo,
      }

      console.log("[v0] Form data before submit:", formData)
      console.log("[v0] Sending product data:", data)
      console.log("[v0] Product ID:", product?.id)

      const response = product ? await api.updateProducto(product.id, data) : await api.createProducto(data)

      console.log("[v0] Response received:", response)

      if (response.success) {
        onClose(true)
      } else {
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
                disabled={isLoading}
                placeholder="SKU-001"
              />
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
