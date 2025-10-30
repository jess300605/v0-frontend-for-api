"use client"

import { useEffect, useState } from "react"
import { api, type Producto } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductImage } from "@/lib/product-images"
import { useCart } from "@/contexts/cart-context"
import { ProductDetailDialog } from "@/components/product-detail-dialog"

export default function HomePage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      const response = await api.getProductos()
      console.log("[v0] Productos response:", response)

      let productosData: Producto[] = []
      if (response.success) {
        if (response.data?.productos && Array.isArray(response.data.productos)) {
          productosData = response.data.productos
        } else if (Array.isArray(response.data)) {
          productosData = response.data
        }
      }

      // Filter active products with stock
      const activeProducts = productosData.filter((p) => p.activo && p.stock > 0)
      setProductos(activeProducts)
    } catch (error) {
      console.error("[v0] Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (producto: Producto) => {
    setSelectedProduct(producto)
    setShowDetailDialog(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
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
      {/* Hero Banner */}
      <div className="mb-12 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 p-12 text-white">
        <h1 className="mb-4 text-4xl font-bold">Bienvenido a PALERMO</h1>
        <p className="mb-6 text-xl">Los mejores muebles para tu hogar</p>
        <Link href="/catalogo">
          <Button size="lg" variant="secondary">
            Ver Catálogo Completo
          </Button>
        </Link>
      </div>

      {/* Featured Products */}
      <div className="mb-8">
        <h2 className="mb-6 text-3xl font-bold">Productos Destacados</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productos.slice(0, 8).map((producto) => (
            <Card key={producto.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
              <div
                className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => handleImageClick(producto)}
              >
                <Image
                  src={getProductImage(producto) || "/placeholder.svg"}
                  alt={producto.nombre}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  key={`${producto.id}-${producto.url_imagen || producto.nombre}`}
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
                  <span className="text-2xl font-bold text-emerald-600">
                    ${Number(producto.precio || 0).toFixed(2)}
                  </span>
                  <Button size="sm" className="gap-2" onClick={() => addToCart(producto)}>
                    <ShoppingCart className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="mb-6 text-3xl font-bold">Categorías Populares</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Salas", "Comedores", "Recámaras", "Decoración"].map((categoria) => (
            <Link key={categoria} href={`/catalogo?categoria=${categoria}`}>
              <Card className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-700">{categoria}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <ProductDetailDialog producto={selectedProduct} open={showDetailDialog} onOpenChange={setShowDetailDialog} />
    </div>
  )
}
