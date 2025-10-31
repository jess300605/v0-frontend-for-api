"use client"

import { useEffect, useState } from "react"
import { api, type Producto } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Star, Edit, Save, X, Plus } from "lucide-react"
import Image from "next/image"
import { getProductImage } from "@/lib/product-images"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProductDetailDialog } from "@/components/product-detail-dialog"
import { ProductDialog } from "@/components/product-dialog"

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Producto>>({})
  const [originalSku, setOriginalSku] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [selectedProductDetail, setSelectedProductDetail] = useState<Producto | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadProductos()
  }, [])

  useEffect(() => {
    filterProductos()
  }, [searchTerm, selectedCategory, productos])

  const loadProductos = async () => {
    try {
      console.log("[v0] Catalog: Loading productos at", new Date().toISOString())
      const response = await api.getProductos()
      console.log("[v0] Catalog: API response:", response)

      let productosData: Producto[] = []

      if (response.success) {
        if (response.data?.productos && Array.isArray(response.data.productos)) {
          productosData = response.data.productos
        } else if (Array.isArray(response.data)) {
          productosData = response.data
        }
      }

      console.log("[v0] Catalog: Total productos from API:", productosData.length)
      const activeProducts = productosData.filter((p) => p.activo && p.stock > 0)
      console.log("[v0] Catalog: Active productos with stock:", activeProducts.length)
      console.log("[v0] Catalog: Filtered out productos:", productosData.length - activeProducts.length)

      setProductos(activeProducts)
      setFilteredProductos(activeProducts)
    } catch (error) {
      console.error("[v0] Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProductos = () => {
    let filtered = productos

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.categoria === selectedCategory)
    }

    setFilteredProductos(filtered)
  }

  const startEditing = (producto: Producto) => {
    setEditingId(producto.id)
    setEditForm(producto)
    setOriginalSku(producto.codigo_sku || "")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
    setOriginalSku("")
  }

  const saveProduct = async () => {
    if (!editingId || !editForm) return

    setSaving(true)
    try {
      const updateData: any = {
        nombre: editForm.nombre!,
        descripcion: editForm.descripcion || "",
        categoria: editForm.categoria!,
        precio: Number(editForm.precio),
        stock: Number(editForm.stock),
        stock_minimo: Number(editForm.stock_minimo),
        url_imagen: editForm.url_imagen || undefined,
      }

      if (editForm.codigo_sku !== originalSku) {
        updateData.codigo_sku = editForm.codigo_sku
      }

      console.log("[v0] Updating product with data:", updateData)
      const response = await api.updateProducto(editingId, updateData)
      console.log("[v0] Update response:", response)

      if (response.success) {
        await loadProductos()
        setEditingId(null)
        setEditForm({})
        setOriginalSku("")
      }
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      alert("Error al actualizar el producto")
    } finally {
      setSaving(false)
    }
  }

  const handleImageClick = (producto: Producto) => {
    if (editingId === producto.id) return // Don't open modal when editing
    setSelectedProductDetail(producto)
    setShowDetailDialog(true)
  }

  const handleCreateDialogClose = (refresh?: boolean) => {
    setShowCreateDialog(false)
    if (refresh) {
      loadProductos()
    }
  }

  const categories = Array.from(new Set(productos.map((p) => p.categoria)))
  const isAdmin = user?.rol === "admin" || user?.rol === "administrador"

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 h-12 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square animate-pulse bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-6 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Catálogo de Productos</h1>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Producto
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProductos.map((producto) => {
          const isEditing = editingId === producto.id

          return (
            <Card key={producto.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
              {isEditing ? (
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        value={editForm.nombre || ""}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Categoría</Label>
                      <Input
                        value={editForm.categoria || ""}
                        onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Precio</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.precio || ""}
                        onChange={(e) => setEditForm({ ...editForm, precio: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        value={editForm.stock || ""}
                        onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">URL de Imagen</Label>
                      <Input
                        type="url"
                        value={editForm.url_imagen || ""}
                        onChange={(e) => setEditForm({ ...editForm, url_imagen: e.target.value })}
                        className="h-8"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descripción</Label>
                      <Textarea
                        value={editForm.descripcion || ""}
                        onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                        className="h-16 text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveProduct} disabled={saving} className="flex-1">
                        <Save className="mr-1 h-3 w-3" />
                        {saving ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing} disabled={saving}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => handleImageClick(producto)}
                  >
                    <Image
                      key={`${producto.id}-${producto.url_imagen || producto.nombre}`}
                      src={getProductImage(producto) || "/placeholder.svg"}
                      alt={producto.nombre}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {producto.stock < 10 && (
                      <Badge className="absolute right-2 top-2 bg-red-500">Últimas unidades</Badge>
                    )}
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute left-2 top-2"
                        onClick={(e) => {
                          e.stopPropagation() // Prevent modal from opening
                          startEditing(producto)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="mb-1 text-sm text-muted-foreground">{producto.categoria}</p>
                    <h3 className="mb-2 font-semibold">{producto.nombre}</h3>
                    {producto.descripcion && (
                      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{producto.descripcion}</p>
                    )}
                    <div className="mb-3 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-1 text-sm text-muted-foreground">(4.5)</span>
                    </div>
                    {isAdmin && <p className="mb-2 text-xs text-muted-foreground">Stock: {producto.stock} unidades</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-600">
                        ${Number(producto.precio || 0).toFixed(2)}
                      </span>
                      <Button size="sm" className="gap-2" onClick={() => addToCart(producto)}>
                        <ShoppingCart className="h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          )
        })}
      </div>

      {filteredProductos.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No se encontraron productos</p>
        </div>
      )}

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        producto={selectedProductDetail}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      {/* ProductDialog for creating new products */}
      <ProductDialog open={showCreateDialog} onClose={handleCreateDialogClose} />
    </div>
  )
}
