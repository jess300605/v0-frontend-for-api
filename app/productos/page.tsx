"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react"
import { api, type Producto } from "@/lib/api"
import { ProductDialog } from "@/components/product-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ProductosPage() {
  const { hasPermission } = useAuth()
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null)

  // Verificar permisos y cargar productos
  useEffect(() => {
    if (!hasPermission("productos.ver")) {
      router.push("/dashboard")
    } else {
      loadProductos()
    }
  }, [hasPermission, router])

  // Filtrado seguro de productos
  useEffect(() => {
    const filtered = (Array.isArray(productos) ? productos : []).filter((p) => {
      const nombre = p.nombre?.toLowerCase() ?? ""
      const codigo = p.codigo?.toLowerCase() ?? ""
      const categoria = p.categoria?.toLowerCase() ?? ""
      const term = searchTerm.toLowerCase()
      return nombre.includes(term) || codigo.includes(term) || categoria.includes(term)
    })
    setFilteredProductos(filtered)
  }, [searchTerm, productos])

  // Cargar productos desde la API
  const loadProductos = async () => {
    try {
      setIsLoading(true)
      const response = await api.getProductos()
      if (response.success && Array.isArray(response.data)) {
        const activos = response.data.filter((p) => p.activo && p.stock_actual > 0)
        setProductos(activos)
        setFilteredProductos(activos)
      } else {
        setProductos([])
        setFilteredProductos([])
      }
    } catch (error) {
      console.error("Error al cargar productos:", error)
      setProductos([])
      setFilteredProductos([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (producto: Producto) => {
    setSelectedProduct(producto)
    setIsDialogOpen(true)
  }

  const handleDelete = (producto: Producto) => {
    setProductToDelete(producto)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    try {
      const response = await api.deleteProducto(productToDelete.id)
      if (response.success) {
        await loadProductos()
        setIsDeleteDialogOpen(false)
        setProductToDelete(null)
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error)
    }
  }

  const handleDialogClose = (refresh: boolean) => {
    setIsDialogOpen(false)
    setSelectedProduct(null)
    if (refresh) loadProductos()
  }

  const getStockBadge = (producto: Producto) => {
    if ((producto.stock_actual ?? 0) === 0) return <Badge variant="destructive">Sin stock</Badge>
    if ((producto.stock_actual ?? 0) <= (producto.stock_minimo ?? 0)) return <Badge className="bg-orange-500">Stock bajo</Badge>
    return <Badge variant="secondary">En stock</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
          </div>
          {hasPermission("productos.crear") && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          )}
        </div>

        {/* Tarjeta de inventario */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
            <CardDescription>
              {filteredProductos.length} {filteredProductos.length === 1 ? "producto" : "productos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Buscador */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Cargando o sin productos */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Cargando productos...</p>
              </div>
            ) : filteredProductos.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No se encontraron productos" : "No hay productos registrados"}
                </p>
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
                      {(hasPermission("productos.editar") || hasPermission("productos.eliminar")) && (
                        <TableHead className="text-right">Acciones</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {(Array.isArray(filteredProductos) ? filteredProductos : []).map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-mono text-sm">{producto.codigo ?? "-"}</TableCell>
                        <TableCell className="font-medium">{producto.nombre ?? "-"}</TableCell>
                        <TableCell>{producto.categoria ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          ${Number(producto.precio ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(producto.stock_actual ?? 0)} / {Number(producto.stock_minimo ?? 0)}
                        </TableCell>
                        <TableCell>{getStockBadge(producto)}</TableCell>
                        {(hasPermission("productos.editar") || hasPermission("productos.eliminar")) && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {hasPermission("productos.editar") && (
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {hasPermission("productos.eliminar") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(producto)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogos */}
      <ProductDialog open={isDialogOpen} onClose={handleDialogClose} product={selectedProduct} />
      <DeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        description={`¿Estás seguro de que deseas eliminar el producto "${productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </DashboardLayout>
  )
}
