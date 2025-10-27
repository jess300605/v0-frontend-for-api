"use client"

import { useEffect, useState } from "react"
import { api, type Producto } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Percent } from "lucide-react"
import Image from "next/image"
import { formatPrice, parsePrice } from "@/lib/utils"

export default function OfertasPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProductos()
  }, [])

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

      // Show products with low stock as "offers"
      const ofertas = productosData.filter((p) => p.activo && p.stock > 0 && p.stock < 15)
      setProductos(ofertas)
    } catch (error) {
      console.error("[v0] Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (producto: Producto) => {
    const query = encodeURIComponent(producto.nombre + " furniture")
    return `/placeholder.svg?height=300&width=300&query=${query}`
  }

  const getDiscount = () => Math.floor(Math.random() * 30) + 10 // Random discount 10-40%

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
      {/* Hero Banner */}
      <div className="mb-12 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 p-12 text-white">
        <div className="flex items-center gap-4">
          <Percent className="h-16 w-16" />
          <div>
            <h1 className="mb-2 text-4xl font-bold">Ofertas Especiales</h1>
            <p className="text-xl">Aprovecha nuestros descuentos por tiempo limitado</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {productos.map((producto) => {
          const discount = getDiscount()
          const originalPrice = parsePrice(producto.precio)
          const discountedPrice = originalPrice * (1 - discount / 100)

          return (
            <Card key={producto.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={getProductImage(producto) || "/placeholder.svg"}
                  alt={producto.nombre}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <Badge className="absolute left-2 top-2 bg-red-500 text-lg">-{discount}%</Badge>
                {producto.stock < 10 && (
                  <Badge className="absolute right-2 top-2 bg-orange-500">Solo {producto.stock} disponibles</Badge>
                )}
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
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">${formatPrice(originalPrice)}</span>
                  <span className="text-2xl font-bold text-red-600">${formatPrice(discountedPrice)}</span>
                </div>
                <Button className="w-full gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Agregar al Carrito
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {productos.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No hay ofertas disponibles en este momento</p>
        </div>
      )}
    </div>
  )
}
