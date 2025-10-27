"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Search, ShoppingCart } from "lucide-react"
import { api, type Producto } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CartItem {
  producto: Producto
  cantidad: number
  subtotal: number
}

export default function NuevaVentaPage() {
  const { hasPermission } = useAuth()
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)

  const [nombreCliente, setNombreCliente] = useState("")
  const [emailCliente, setEmailCliente] = useState("")
  const [telefonoCliente, setTelefonoCliente] = useState("")

  useEffect(() => {
    if (!hasPermission("ventas.crear")) {
      router.push("/dashboard")
    } else {
      loadProductos()
    }
  }, [hasPermission, router])

  const loadProductos = async () => {
    try {
      const response = await api.getProductos()
      console.log("[v0] Nueva venta - Response completo:", response)
      console.log("[v0] Nueva venta - response.data:", response.data)

      let productosData: Producto[] = []

      if (response.success) {
        if (response.data?.productos && Array.isArray(response.data.productos)) {
          productosData = response.data.productos
        } else if (Array.isArray(response.data)) {
          productosData = response.data
        }

        console.log("[v0] Nueva venta - Productos extraídos:", productosData.length)

        // Filter active products with stock
        const productosDisponibles = productosData.filter((p) => p.activo && p.stock > 0)
        console.log("[v0] Nueva venta - Productos disponibles:", productosDisponibles.length)

        setProductos(productosDisponibles)
      } else {
        console.warn("[v0] Nueva venta - Response no exitoso:", response)
      }
    } catch (error) {
      console.error("[v0] Error al cargar productos:", error)
    }
  }

  const addToCart = (producto: Producto) => {
    const existingItem = cart.find((item) => item.producto.id === producto.id)

    if (existingItem) {
      if (existingItem.cantidad >= producto.stock) {
        setError(`Stock insuficiente para ${producto.nombre}`)
        return
      }
      setCart(
        cart.map((item) =>
          item.producto.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * producto.precio,
              }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          producto,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ])
    }
    setOpen(false)
    setError("")
  }

  const updateQuantity = (productoId: number, cantidad: number) => {
    const item = cart.find((i) => i.producto.id === productoId)
    if (!item) return

    if (cantidad <= 0) {
      removeFromCart(productoId)
      return
    }

    if (cantidad > item.producto.stock) {
      setError(`Stock insuficiente para ${item.producto.nombre}`)
      return
    }

    setCart(
      cart.map((item) =>
        item.producto.id === productoId
          ? {
              ...item,
              cantidad,
              subtotal: cantidad * item.producto.precio,
            }
          : item,
      ),
    )
    setError("")
  }

  const removeFromCart = (productoId: number) => {
    setCart(cart.filter((item) => item.producto.id !== productoId))
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = async () => {
    if (!nombreCliente.trim()) {
      setError("El nombre del cliente es obligatorio")
      return
    }

    if (cart.length === 0) {
      setError("Agrega al menos un producto a la venta")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const productos = cart.map((item) => ({
        id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
      }))

      const ventaData = {
        nombre_cliente: nombreCliente,
        email_cliente: emailCliente || undefined,
        telefono_cliente: telefonoCliente || undefined,
        productos,
      }

      console.log("[v0] Submitting venta:", ventaData)

      const response = await api.createVenta(ventaData)

      if (response.success) {
        router.push("/ventas")
      } else {
        setError(response.message || "Error al procesar la venta")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la venta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Venta</h1>
            <p className="text-muted-foreground">Procesa una nueva transacción</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/ventas")}>
            Cancelar
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>Datos del comprador</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre_cliente">
                      Nombre del Cliente <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nombre_cliente"
                      placeholder="Nombre completo"
                      value={nombreCliente}
                      onChange={(e) => setNombreCliente(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email_cliente">Email (opcional)</Label>
                    <Input
                      id="email_cliente"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={emailCliente}
                      onChange={(e) => setEmailCliente(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefono_cliente">Teléfono (opcional)</Label>
                    <Input
                      id="telefono_cliente"
                      type="tel"
                      placeholder="1234567890"
                      value={telefonoCliente}
                      onChange={(e) => setTelefonoCliente(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Agrega productos a la venta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Search className="mr-2 h-4 w-4" />
                        Buscar producto...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar producto..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron productos.</CommandEmpty>
                          <CommandGroup>
                            {productos.map((producto) => (
                              <CommandItem key={producto.id} onSelect={() => addToCart(producto)}>
                                <div className="flex items-center justify-between w-full">
                                  <div>
                                    <p className="font-medium">{producto.nombre}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {producto.codigo_sku || producto.codigo || "Sin código"} • Stock: {producto.stock}
                                    </p>
                                  </div>
                                  <p className="font-medium">${producto.precio.toLocaleString()}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {cart.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay productos en el carrito</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cart.map((item) => (
                            <TableRow key={item.producto.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.producto.nombre}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.producto.codigo_sku || item.producto.codigo || "Sin código"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">${item.producto.precio.toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 bg-transparent"
                                    onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                                  >
                                    -
                                  </Button>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={item.producto.stock}
                                    value={item.cantidad}
                                    onChange={(e) => updateQuantity(item.producto.id, Number.parseInt(e.target.value))}
                                    className="w-16 text-center"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 bg-transparent"
                                    onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${item.subtotal.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFromCart(item.producto.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Productos</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unidades</span>
                    <span>{cart.reduce((sum, item) => sum + item.cantidad, 0)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold">${getTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={handleSubmit} disabled={isLoading || cart.length === 0}>
                  {isLoading ? "Procesando..." : "Procesar Venta"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
