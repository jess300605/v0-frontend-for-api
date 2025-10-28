"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Phone } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold">¡Pedido Confirmado!</h1>
            <p className="text-muted-foreground mb-4">Tu pedido ha sido procesado exitosamente.</p>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-4 text-emerald-700">
              <Phone className="h-5 w-5" />
              <p className="text-sm font-medium">
                Uno de nuestros agentes se comunicará contigo pronto para coordinar la entrega.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button>Volver al Inicio</Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="outline">Seguir Comprando</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
