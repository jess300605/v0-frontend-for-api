"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function TestAuthPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const checkToken = () => {
    const token = localStorage.getItem("auth_token")
    console.log("[v0] Token in localStorage:", token)
    console.log("[v0] Token length:", token?.length)
    console.log("[v0] Is authenticated:", isAuthenticated)
    console.log("[v0] User:", user)
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
          <CardDescription>Verifica si estás autenticado correctamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Estado:</p>
            <p className={`text-lg font-bold ${isAuthenticated ? "text-green-600" : "text-red-600"}`}>
              {isAuthenticated ? "✓ AUTENTICADO" : "✗ NO AUTENTICADO"}
            </p>
          </div>

          {user && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Usuario:</p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={checkToken}>Ver Token en Consola</Button>

            {!isAuthenticated && (
              <Button onClick={() => router.push("/login")} variant="default">
                Ir a Login
              </Button>
            )}

            {isAuthenticated && (
              <Button onClick={logout} variant="destructive">
                Cerrar Sesión
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">Instrucciones:</p>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Si dice "NO AUTENTICADO", haz clic en "Ir a Login" e inicia sesión</li>
              <li>Después de iniciar sesión, regresa a esta página para verificar</li>
              <li>Si dice "AUTENTICADO", entonces el problema está en el backend</li>
              <li>Haz clic en "Ver Token en Consola" y comparte el resultado</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
