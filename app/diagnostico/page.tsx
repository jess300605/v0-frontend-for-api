"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function DiagnosticoPage() {
  const [results, setResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)

  const addResult = (test: string, success: boolean, message: string, details?: any) => {
    setResults((prev) => [...prev, { test, success, message, details, timestamp: new Date() }])
  }

  const runDiagnostics = async () => {
    setResults([])
    setTesting(true)

    try {
      // Test 1: Check environment variables
      addResult(
        "Variables de entorno",
        true,
        `API URL configurada: ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}`,
        {
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          windowLocation: typeof window !== "undefined" ? window.location.href : "N/A",
        },
      )

      // Test 2: Check if token exists
      const token = localStorage.getItem("auth_token")
      addResult(
        "Token de autenticación",
        !!token,
        token ? `Token encontrado: ${token.substring(0, 30)}...` : "No hay token (no estás autenticado)",
        { hasToken: !!token, tokenLength: token?.length },
      )

      // Test 3: Try to connect to backend (simple GET without auth)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        console.log("[v0] Testing connection to:", `${apiUrl}/productos`)

        const response = await fetch(`${apiUrl}/productos`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        console.log("[v0] Response status:", response.status)
        const data = await response.json()
        console.log("[v0] Response data:", data)

        addResult(
          "Conexión al backend (GET /productos)",
          response.ok,
          response.ok
            ? `✓ Conectado exitosamente (${response.status})`
            : `✗ Error: ${response.status} ${response.statusText}`,
          { status: response.status, data },
        )
      } catch (error: any) {
        console.error("[v0] Connection test failed:", error)
        addResult("Conexión al backend (GET /productos)", false, `✗ Error de conexión: ${error.message}`, {
          error: error.message,
          type: error.constructor.name,
        })
      }

      // Test 4: Try authenticated request if token exists
      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
          const response = await fetch(`${apiUrl}/productos`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          const data = await response.json()

          addResult(
            "Request autenticado (GET con token)",
            response.ok,
            response.ok
              ? `✓ Autenticación funciona (${response.status})`
              : `✗ Error: ${response.status} ${response.statusText}`,
            { status: response.status, data },
          )
        } catch (error: any) {
          addResult("Request autenticado (GET con token)", false, `✗ Error de conexión: ${error.message}`, {
            error: error.message,
          })
        }
      }

      // Test 5: Try POST request (the problematic one)
      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
          const testData = {
            codigo_sku: "TEST-001",
            nombre: "Producto de Prueba",
            descripcion: "Test",
            categoria: "Test",
            precio: 100,
            stock: 10,
            stock_minimo: 2,
            activo: true,
          }

          console.log("[v0] Testing POST with data:", testData)

          const response = await fetch(`${apiUrl}/productos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(testData),
          })

          console.log("[v0] POST Response status:", response.status)
          const data = await response.json()
          console.log("[v0] POST Response data:", data)

          addResult(
            "POST /productos (crear producto)",
            response.ok,
            response.ok
              ? `✓ POST funciona correctamente (${response.status})`
              : `✗ Error: ${response.status} ${response.statusText}`,
            { status: response.status, data },
          )
        } catch (error: any) {
          console.error("[v0] POST test failed:", error)
          addResult("POST /productos (crear producto)", false, `✗ Error de conexión: ${error.message}`, {
            error: error.message,
            type: error.constructor.name,
            stack: error.stack,
          })
        }
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico de Conexión API</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información del Sistema</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>URL del Frontend:</strong> {typeof window !== "undefined" ? window.location.href : "N/A"}
          </p>
          <p>
            <strong>API URL Configurada:</strong>{" "}
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api (default)"}
          </p>
          <p>
            <strong>Token presente:</strong>{" "}
            {typeof window !== "undefined" && localStorage.getItem("auth_token") ? "Sí ✓" : "No ✗"}
          </p>
        </div>
      </Card>

      <Button onClick={runDiagnostics} disabled={testing} className="mb-6">
        {testing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Ejecutando pruebas...
          </>
        ) : (
          "Ejecutar Diagnóstico Completo"
        )}
      </Button>

      <div className="space-y-4">
        {results.map((result, index) => (
          <Alert key={index} variant={result.success ? "default" : "destructive"}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{result.test}</h3>
                <AlertDescription className="text-sm">{result.message}</AlertDescription>
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      Ver detalles técnicos
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </div>

      {results.length > 0 && !testing && (
        <Card className="mt-6 p-6 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold mb-2">Interpretación de Resultados:</h3>
          <ul className="text-sm space-y-2 list-disc list-inside">
            <li>
              Si <strong>GET /productos</strong> falla: El backend no está corriendo o la URL es incorrecta
            </li>
            <li>
              Si <strong>GET funciona pero POST falla</strong>: Problema de CORS en el backend Laravel
            </li>
            <li>
              Si <strong>no hay token</strong>: Necesitas iniciar sesión primero
            </li>
            <li>
              Si <strong>request autenticado falla con 401</strong>: Token inválido o expirado
            </li>
          </ul>
        </Card>
      )}
    </div>
  )
}
