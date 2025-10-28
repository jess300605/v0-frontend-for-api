"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Shield, Calendar } from "lucide-react"

export default function PerfilPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
      })
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="h-8 w-48 animate-pulse rounded bg-muted mb-8" />
          <Card>
            <CardHeader>
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("La funcionalidad de actualización de perfil estará disponible próximamente.")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Mi Perfil</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Administra tu información de cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={user.rol === "admin" ? "Administrador" : user.rol === "empleado" ? "Empleado" : "Usuario"}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Miembro desde</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={user.created_at ? new Date(user.created_at).toLocaleDateString("es-ES") : "N/A"}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <Button type="submit" disabled className="w-full">
                  Guardar Cambios (Próximamente)
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
