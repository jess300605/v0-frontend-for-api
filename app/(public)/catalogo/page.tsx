"use client"

import { useEffect, useState } from "react"
import { api, type Producto } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Star } from "lucide-react"
import Image from "next/image"
import { getProductImage } from "@/lib/product-images"
import { useCart } from "@/contexts/cart-context"

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { addToCart } = useCart()

  useEffect(() => {
    loadProductos()
  }, [])

  useEffect(() => {
    filterProductos()
  }, [searchTerm, selectedCategory, productos])

  const loadProductos = async () => {
    try {
      const response = await api.getProductos()
      let productosData: Producto[] = []

      if (response.success) {
        if (response.data?.productos && Array.isArray(response.data.productos)) {
          productosData = response.data.productos
        } else if (Array.isArray(response.data)) {
          productosData = response.data
        }
      }

      const activeProducts = productosData.filter((p) => p.activo && p.stock > 0)
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

  const categories = Array.from(new Set(productos.map((p) => p.categoria)))

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
      <h1 className="mb-8 text-4xl font-bold">Catálogo de Productos</h1>

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
        {filteredProductos.map((producto) => (
          <Card key={producto.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <Image
                src={getProductImage(producto.nombre) || "/placeholder.svg"}
                alt={producto.nombre}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {producto.stock < 10 && <Badge className="absolute right-2 top-2 bg-red-500">Últimas unidades</Badge>}
            </div>
            <CardContent className="p-4">
              <p className="mb-1 text-sm text-muted-foreground">{producto.categoria}</p>
              <h3 className="mb-2 font-semibold">{producto.nombre}</h3>
              <div className="mb-3 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1 text-sm text-muted-foreground">(4.5)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-emerald-600">${Number(producto.precio || 0).toFixed(2)}</span>
                <Button size="sm" className="gap-2" onClick={() => addToCart(producto)}>
                  <ShoppingCart className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProductos.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No se encontraron productos</p>
        </div>
      )}
    </div>
  )
}
