"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, DollarSign } from "lucide-react"
import { api, type Venta } from "@/lib/api"
import { formatPrice } from "@/lib/utils"

export default function MisPedidosPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      loadVentas()
    }
  }, [user, isLoading, router])

  const loadVentas = async () => {
    try {
      const response = await api.getVentas()
      if (response.success && response.data) {
        let ventasArray: Venta[] = []

        if (Array.isArray(response.data)) {
          ventasArray = response.data
        } else if (typeof response.data === "object" && "data" in response.data) {
          ventasArray = Array.isArray(response.data.data) ? response.data.data : []
        } else if (typeof response.data === "object" && "ventas" in response.data) {
          ventasArray = Array.isArray(response.data.ventas) ? response.data.ventas : []
        }

        // Filter sales for current user
        const userVentas = ventasArray.filter((v) => v.cliente_nombre === user?.nombre)
        setVentas(userVentas)
      }
    } catch (error) {
      console.error("Error loading ventas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Mis Pedidos</h1>

      {ventas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No tienes pedidos aún</p>
            <p className="text-sm text-muted-foreground mt-2">Cuando realices una compra, aparecerá aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ventas.map((venta) => (
            <Card key={venta.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Pedido #{venta.id}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(venta.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                    Procesando
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{formatPrice(venta.total)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Uno de nuestros agentes se comunicará contigo pronto</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
