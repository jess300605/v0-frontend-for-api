"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Pencil, Trash2, Package, LayoutGrid, List } from "lucide-react"
import { api, type Producto } from "@/lib/api"
import { ProductDialog } from "@/components/product-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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
      const codigo = p.codigo_sku?.toLowerCase() ?? "" // Updated to use codigo_sku from API response
      const categoria = p.categoria?.toLowerCase() ?? ""
      const term = searchTerm.toLowerCase()
      return nombre.includes(term) || codigo.includes(term) || categoria.includes(term)
    })
    setFilteredProductos(filtered)
  }, [searchTerm, productos])

  const loadProductos = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Cargando productos...")
      const response = await api.getProductos()
      console.log("[v0] Respuesta completa:", response)

      if (response.success && response.data) {
        const productosData = (response.data as any).productos || response.data
        console.log("[v0] Productos extraídos:", productosData)

        if (Array.isArray(productosData)) {
          setProductos(productosData)
          setFilteredProductos(productosData)
          console.log("[v0] Total productos cargados:", productosData.length)
        } else {
          console.error("[v0] Los datos de productos no son un array:", productosData)
          setProductos([])
          setFilteredProductos([])
        }
      } else {
        console.error("[v0] Respuesta sin éxito o sin datos")
        setProductos([])
        setFilteredProductos([])
      }
    } catch (error) {
      console.error("[v0] Error al cargar productos:", error)
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
    if ((producto.stock ?? 0) === 0) return <Badge variant="destructive">Sin stock</Badge>
    if ((producto.stock ?? 0) <= (producto.stock_minimo ?? 0))
      return <Badge className="bg-orange-500">Stock bajo</Badge>
    return <Badge variant="secondary">En stock</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {hasPermission("productos.crear") && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
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
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron productos" : "No hay productos registrados"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProductos.map((producto) => (
                <ProductCard
                  key={producto.id}
                  product={producto}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  canEdit={hasPermission("productos.editar")}
                  canDelete={hasPermission("productos.eliminar")}
                />
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <Card>
              <CardHeader>
                <CardTitle>Inventario</CardTitle>
                <CardDescription>
                  {filteredProductos.length} {filteredProductos.length === 1 ? "producto" : "productos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      {filteredProductos.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell className="font-mono text-sm">{producto.codigo_sku ?? "-"}</TableCell>
                          <TableCell className="font-medium">{producto.nombre ?? "-"}</TableCell>
                          <TableCell>{producto.categoria ?? "-"}</TableCell>
                          <TableCell className="text-right">${Number(producto.precio ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            {Number(producto.stock ?? 0)} / {Number(producto.stock_minimo ?? 0)}
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
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Diálogos */}
      <ProductDialog open={isDialogOpen} onClose={handleDialogClose} product={selectedProduct} />
      <DeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        description={`¿Estás seguro de que deseas eliminar el producto "${productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
