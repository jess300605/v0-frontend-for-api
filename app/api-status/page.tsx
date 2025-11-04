"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"

export default function ApiStatusPage() {
  const [status, setStatus] = useState<{
    checking: boolean
    connected: boolean | null
    message: string
    details?: any
  }>({
    checking: false,
    connected: null,
    message: "Haz clic en 'Verificar Conexión' para probar la API",
  })

  const checkApiConnection = async () => {
    setStatus({ checking: true, connected: null, message: "Verificando conexión..." })

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

    try {
      console.log("[v0] Testing API connection to:", apiUrl)

      // Test 1: Try to fetch productos (GET request, should work without auth)
      const response = await fetch(`${apiUrl}/productos`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        setStatus({
          checking: false,
          connected: true,
          message: "✅ Conexión exitosa con el backend Laravel",
          details: {
            status: response.status,
            url: `${apiUrl}/productos`,
            productCount: data.data?.length || 0,
          },
        })
      } else {
        setStatus({
          checking: false,
          connected: false,
          message: `❌ El servidor respondió con error ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            url: `${apiUrl}/productos`,
          },
        })
      }
    } catch (error) {
      console.error("[v0] Connection test failed:", error)

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setStatus({
          checking: false,
          connected: false,
          message: "❌ No se pudo conectar con el servidor",
          details: {
            error: "Failed to fetch",
            url: `${apiUrl}/productos`,
            possibleCauses: [
              "El servidor Laravel no está corriendo",
              "CORS no está configurado correctamente",
              "La URL de la API es incorrecta",
              "El puerto está bloqueado",
            ],
          },
        })
      } else {
        setStatus({
          checking: false,
          connected: false,
          message: `❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
        })
      }
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Estado de la API</CardTitle>
          <CardDescription>Verifica la conexión con el backend Laravel y diagnostica problemas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">URL de la API</p>
                <p className="text-sm text-muted-foreground">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}
                </p>
              </div>
              {status.connected === true && <CheckCircle2 className="h-6 w-6 text-green-500" />}
              {status.connected === false && <XCircle className="h-6 w-6 text-red-500" />}
              {status.connected === null && !status.checking && <AlertCircle className="h-6 w-6 text-gray-400" />}
              {status.checking && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
            </div>

            <Button onClick={checkApiConnection} disabled={status.checking} className="w-full">
              {status.checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar Conexión"
              )}
            </Button>

            {status.message && (
              <Alert
                variant={status.connected === true ? "default" : status.connected === false ? "destructive" : "default"}
                className={status.connected === true ? "border-green-500 bg-green-50" : ""}
              >
                <AlertDescription className="whitespace-pre-wrap">{status.message}</AlertDescription>
              </Alert>
            )}

            {status.details && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-auto rounded bg-muted p-4 text-sm">
                    {JSON.stringify(status.details, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Solución de Problemas</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Si la conexión falla, verifica:</p>
              <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
                <li>El servidor Laravel está corriendo (ejecuta: php artisan serve)</li>
                <li>La URL de la API es correcta en las variables de entorno</li>
                <li>CORS está configurado en Laravel (ver BACKEND_CORS_FIX.md)</li>
                <li>El firewall no está bloqueando el puerto 8000</li>
              </ol>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h3 className="font-semibold text-orange-900">Configuración de CORS Requerida</h3>
            <p className="text-sm text-orange-800">
              El backend Laravel DEBE tener CORS configurado para permitir peticiones desde{" "}
              <code className="rounded bg-orange-100 px-1 py-0.5">http://172.20.176.1:3000</code>
            </p>
            <p className="text-sm text-orange-800">
              Consulta el archivo <code className="rounded bg-orange-100 px-1 py-0.5">BACKEND_CORS_FIX.md</code> para
              instrucciones completas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
