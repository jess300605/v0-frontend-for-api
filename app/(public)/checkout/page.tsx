"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import { getProductImage } from "@/lib/product-images"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { ShoppingBag, CreditCard, MapPin } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    nombre_cliente: user?.nombre || "",
    email_cliente: user?.email || "",
    telefono_cliente: "",
  })

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
            <p className="text-center text-muted-foreground">
              Agrega productos a tu carrito para continuar con la compra
            </p>
            <Link href="/catalogo">
              <Button>Ver Catálogo</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CreditCard className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Inicia sesión para continuar</h2>
            <p className="text-center text-muted-foreground">
              Necesitas iniciar sesión o registrarte para completar tu compra
            </p>
            <div className="flex gap-2">
              <Link href="/login">
                <Button>Iniciar Sesión</Button>
              </Link>
              <Link href="/registro">
                <Button variant="outline">Registrarse</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productos = items.map((item) => ({
        id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: Number(item.producto.precio),
      }))

      await api.createVenta({
        nombre_cliente: customerInfo.nombre_cliente,
        email_cliente: customerInfo.email_cliente,
        telefono_cliente: customerInfo.telefono_cliente,
        productos,
      })

      clearCart()
      router.push("/checkout/success")
    } catch (error) {
      console.error("[v0] Error creating sale:", error)
      alert("Error al procesar la compra. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Finalizar Compra</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.producto.id} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        key={`checkout-${item.producto.id}-${item.producto.url_imagen || "default"}`}
                        src={getProductImage(item.producto) || "/placeholder.svg"}
                        alt={item.producto.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 justify-between">
                      <div>
                        <h4 className="font-medium">{item.producto.nombre}</h4>
                        <p className="text-sm text-muted-foreground">{item.producto.categoria}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.cantidad}</p>
                      </div>
                      <p className="font-semibold text-emerald-600">{formatPrice(item.producto.precio)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={customerInfo.nombre_cliente}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, nombre_cliente: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email_cliente}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email_cliente: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={customerInfo.telefono_cliente}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, telefono_cliente: e.target.value })}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Total a Pagar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-emerald-600">Gratis</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
                {loading ? "Procesando..." : "Confirmar Pedido"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Al confirmar tu pedido, aceptas nuestros términos y condiciones
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
