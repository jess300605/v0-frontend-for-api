"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProductDialog } from "@/components/product-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { api, type Producto } from "@/lib/api"
import { formatPrice } from "@/lib/utils"

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null)

  useEffect(() => {
    loadProductos()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = productos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.codigo_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProductos(filtered)
    } else {
      setFilteredProductos(productos)
    }
  }, [searchTerm, productos])

  const loadProductos = async () => {
    try {
      setIsLoading(true)
      const response = await api.getProductos()
      if (response.success && response.data) {
        setProductos(response.data)
        setFilteredProductos(response.data)
      }
    } catch (error) {
      console.error("Error loading productos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (producto: Producto) => {
    setSelectedProduct(producto)
    setShowProductDialog(true)
  }

  const handleDelete = (producto: Producto) => {
    setProductToDelete(producto)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      const response = await api.deleteProducto(productToDelete.id)
      if (response.success) {
        await loadProductos()
      }
    } catch (error) {
      console.error("Error deleting producto:", error)
    } finally {
      setShowDeleteDialog(false)
      setProductToDelete(null)
    }
  }

  const handleDialogClose = (refresh: boolean) => {
    setShowProductDialog(false)
    setSelectedProduct(null)
    if (refresh) {
      loadProductos()
    }
  }

  const getStockBadge = (producto: Producto) => {
    const stock = producto.stock || 0
    const stockMinimo = producto.stock_minimo || 0

    if (stock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>
    } else if (stock <= stockMinimo) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          Stock Bajo
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          Disponible
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona el inventario de productos</p>
        </div>
        <Button onClick={() => setShowProductDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            {filteredProductos.length} producto{filteredProductos.length !== 1 ? "s" : ""} encontrado
            {filteredProductos.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando productos...</div>
          ) : filteredProductos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No se encontraron productos" : "No hay productos registrados"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-mono text-sm">{producto.codigo_sku}</TableCell>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>{producto.categoria}</TableCell>
                      <TableCell className="text-right">{formatPrice(producto.precio)}</TableCell>
                      <TableCell className="text-right">
                        {producto.stock} / {producto.stock_minimo}
                      </TableCell>
                      <TableCell>{getStockBadge(producto)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(producto)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(producto)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <ProductDialog open={showProductDialog} onClose={handleDialogClose} product={selectedProduct} />

      <DeleteDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        description={`¿Estás seguro de que deseas eliminar el producto "${productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
