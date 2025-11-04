"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, type Producto } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface ProductDialogProps {
  open: boolean
  onClose: (refresh: boolean) => void
  product?: Producto | null
}

export function ProductDialog({ open, onClose, product }: ProductDialogProps) {
  const { isAuthenticated, user } = useAuth()

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    stock_actual: "",
    stock_minimo: "",
    url_imagen: "",
    activo: true,
  })
  const [originalCodigo, setOriginalCodigo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [connectionMessage, setConnectionMessage] = useState("")

  useEffect(() => {
    if (product) {
      const codigoValue = product.codigo_sku || ""
      setFormData({
        codigo: codigoValue,
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        categoria: product.categoria || "",
        precio: product.precio?.toString() || "0",
        stock_actual: product.stock?.toString() || "0",
        stock_minimo: product.stock_minimo?.toString() || "0",
        url_imagen: product.url_imagen || "",
        activo: product.activo ?? true,
      })
      setOriginalCodigo(codigoValue)
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: "",
        stock_actual: "",
        stock_minimo: "",
        url_imagen: "",
        activo: true,
      })
      setOriginalCodigo("")
    }
    setError("")
    setFieldErrors({})
    setConnectionStatus("idle")
    setConnectionMessage("")
  }, [product, open])

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("idle")
    setConnectionMessage("")

    try {
      const response = await api.getProductos()
      if (response.success) {
        setConnectionStatus("success")
        setConnectionMessage(`Conexión exitosa! Backend respondiendo correctamente.`)
        setError("")
        setFieldErrors({})
      } else {
        setConnectionStatus("error")
        setConnectionMessage("El backend respondió pero con un error")
      }
    } catch (err) {
      setConnectionStatus("error")
      const errorMsg = err instanceof Error ? err.message : "Error desconocido"
      setConnectionMessage(`No se pudo conectar: ${errorMsg}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] === PRODUCT SUBMIT STARTED ===")
    console.log("[v0] Form data:", formData)
    console.log("[v0] Is authenticated:", isAuthenticated)
    console.log("[v0] User:", user)
    console.log("[v0] Product (editing):", product)

    setError("")
    setFieldErrors({})

    if (!isAuthenticated) {
      const authError = "Debes iniciar sesión para crear o editar productos"
      console.error("[v0] Authentication error:", authError)
      setError(authError)
      return
    }

    setIsLoading(true)
    console.log("[v0] Loading state set to true")

    try {
      console.log("[v0] Parsing form values...")
      const precio = Number.parseFloat(formData.precio)
      const stock = Number.parseInt(formData.stock_actual)
      const stock_minimo = Number.parseInt(formData.stock_minimo)

      console.log("[v0] Parsed values:", { precio, stock, stock_minimo })

      if (isNaN(precio) || precio < 0) {
        const priceError = "El precio debe ser un número válido mayor o igual a 0"
        console.error("[v0] Price validation error:", priceError)
        setError(priceError)
        setIsLoading(false)
        return
      }

      if (isNaN(stock) || stock < 0) {
        const stockError = "El stock debe ser un número válido mayor o igual a 0"
        console.error("[v0] Stock validation error:", stockError)
        setError(stockError)
        setIsLoading(false)
        return
      }

      if (isNaN(stock_minimo) || stock_minimo < 0) {
        const minStockError = "El stock mínimo debe ser un número válido mayor o igual a 0"
        console.error("[v0] Min stock validation error:", minStockError)
        setError(minStockError)
        setIsLoading(false)
        return
      }

      console.log("[v0] Building request data...")
      const data: any = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        categoria: formData.categoria.trim(),
        precio: precio,
        stock: stock,
        stock_minimo: stock_minimo,
        url_imagen: formData.url_imagen.trim() || undefined,
        activo: formData.activo,
      }

      const codigoTrimmed = formData.codigo.trim()
      if (!product || codigoTrimmed !== originalCodigo) {
        data.codigo_sku = codigoTrimmed
      }

      console.log("[v0] Request data prepared:", data)
      console.log("[v0] Making API call...")

      const response = product ? await api.updateProducto(product.id, data) : await api.createProducto(data)

      console.log("[v0] API response received:", response)

      if (response.success) {
        console.log("[v0] ✓ Product saved successfully!")
        console.log("[v0] Closing dialog and refreshing list...")
        onClose(true)
      } else {
        const errorMsg = response.message || "Error al guardar el producto"
        console.error("[v0] ✗ API returned error:", errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error("[v0] ✗✗✗ EXCEPTION CAUGHT ✗✗✗")
      console.error("[v0] Error object:", err)
      console.error("[v0] Error type:", typeof err)
      console.error("[v0] Error constructor:", err?.constructor?.name)

      if (err instanceof Error) {
        console.error("[v0] Error message:", err.message)
        console.error("[v0] Error stack:", err.stack)
      }

      const errorMessage = err instanceof Error ? err.message : "Error desconocido al guardar el producto"
      console.error("[v0] Final error message:", errorMessage)

      if (errorMessage.includes("Errores de validación:")) {
        console.log("[v0] Parsing validation errors...")
        const lines = errorMessage.split("\n")
        const errors: Record<string, string> = {}

        lines.forEach((line) => {
          if (line.includes("codigo_sku:")) {
            errors.codigo = line.replace("codigo_sku:", "").trim()
          } else if (line.includes("nombre:")) {
            errors.nombre = line.replace("nombre:", "").trim()
          } else if (line.includes("precio:")) {
            errors.precio = line.replace("precio:", "").trim()
          } else if (line.includes("categoria:")) {
            errors.categoria = line.replace("categoria:", "").trim()
          } else if (line.includes("stock:")) {
            errors.stock_actual = line.replace("stock:", "").trim()
          }
        })

        console.log("[v0] Parsed field errors:", errors)

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          setError("Por favor corrige los errores en los campos marcados")
        } else {
          setError(errorMessage)
        }
      } else {
        setError(errorMessage)
      }

      console.log("[v0] Error state updated")
    } finally {
      setIsLoading(false)
      console.log("[v0] Loading state set to false")
      console.log("[v0] === PRODUCT SUBMIT ENDED ===")
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {product ? "Actualiza la información del producto" : "Agrega un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Autenticación Requerida</AlertTitle>
            <AlertDescription>
              Debes iniciar sesión para crear o editar productos.{" "}
              <Link href="/login" className="underline font-medium">
                Ir a Login
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Estado de Conexión</h4>
              <p className="text-xs text-muted-foreground">Verifica que el backend Laravel esté corriendo</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={isTestingConnection}
              className="gap-2 bg-transparent"
            >
              {isTestingConnection ? (
                <>Probando...</>
              ) : connectionStatus === "success" ? (
                <>
                  <Wifi className="h-4 w-4" />
                  Conectado
                </>
              ) : connectionStatus === "error" ? (
                <>
                  <WifiOff className="h-4 w-4" />
                  Probar de Nuevo
                </>
              ) : (
                <>Probar Conexión</>
              )}
            </Button>
          </div>

          {connectionStatus === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <Wifi className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{connectionMessage}</AlertDescription>
            </Alert>
          )}

          {connectionStatus === "error" && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {connectionMessage}
                <br />
                <span className="text-xs mt-1 block">
                  Ejecuta:{" "}
                  <code className="bg-destructive/10 px-1 py-0.5 rounded">
                    php artisan serve --host=0.0.0.0 --port=8000
                  </code>
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="whitespace-pre-line text-sm mt-2">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo" className={fieldErrors.codigo ? "text-destructive" : ""}>
                Código SKU *
              </Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => {
                  setFormData({ ...formData, codigo: e.target.value })
                  if (fieldErrors.codigo) {
                    setFieldErrors({ ...fieldErrors, codigo: "" })
                  }
                }}
                required
                disabled={isLoading}
                placeholder="SKU-001"
                className={fieldErrors.codigo ? "border-destructive" : ""}
              />
              {fieldErrors.codigo && <p className="text-sm text-destructive font-medium">{fieldErrors.codigo}</p>}
              {!fieldErrors.codigo && product && (
                <p className="text-xs text-muted-foreground">Solo modifica el código si necesitas cambiarlo</p>
              )}
              {!fieldErrors.codigo && !product && (
                <p className="text-xs text-muted-foreground">Usa un código único para identificar el producto</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria" className={fieldErrors.categoria ? "text-destructive" : ""}>
                Categoría *
              </Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => {
                  setFormData({ ...formData, categoria: e.target.value })
                  if (fieldErrors.categoria) {
                    setFieldErrors({ ...fieldErrors, categoria: "" })
                  }
                }}
                required
                disabled={isLoading}
                placeholder="Electrónica"
                className={fieldErrors.categoria ? "border-destructive" : ""}
              />
              {fieldErrors.categoria && <p className="text-sm text-destructive font-medium">{fieldErrors.categoria}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre" className={fieldErrors.nombre ? "text-destructive" : ""}>
              Nombre *
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value })
                if (fieldErrors.nombre) {
                  setFieldErrors({ ...fieldErrors, nombre: "" })
                }
              }}
              required
              disabled={isLoading}
              placeholder="Nombre del producto"
              className={fieldErrors.nombre ? "border-destructive" : ""}
            />
            {fieldErrors.nombre && <p className="text-sm text-destructive font-medium">{fieldErrors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              disabled={isLoading}
              placeholder="Descripción detallada del producto"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_imagen">URL de Imagen (Google)</Label>
            <Input
              id="url_imagen"
              type="url"
              value={formData.url_imagen}
              onChange={(e) => setFormData({ ...formData, url_imagen: e.target.value })}
              disabled={isLoading}
              placeholder="https://example.com/imagen.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Pega aquí la URL de una imagen de Google para personalizar la imagen del producto
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio" className={fieldErrors.precio ? "text-destructive" : ""}>
                Precio *
              </Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) => {
                  setFormData({ ...formData, precio: e.target.value })
                  if (fieldErrors.precio) {
                    setFieldErrors({ ...fieldErrors, precio: "" })
                  }
                }}
                required
                disabled={isLoading}
                placeholder="0.00"
                className={fieldErrors.precio ? "border-destructive" : ""}
              />
              {fieldErrors.precio && <p className="text-sm text-destructive font-medium">{fieldErrors.precio}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_actual" className={fieldErrors.stock_actual ? "text-destructive" : ""}>
                Stock Actual *
              </Label>
              <Input
                id="stock_actual"
                type="number"
                min="0"
                value={formData.stock_actual}
                onChange={(e) => {
                  setFormData({ ...formData, stock_actual: e.target.value })
                  if (fieldErrors.stock_actual) {
                    setFieldErrors({ ...fieldErrors, stock_actual: "" })
                  }
                }}
                required
                disabled={isLoading}
                placeholder="0"
                className={fieldErrors.stock_actual ? "border-destructive" : ""}
              />
              {fieldErrors.stock_actual && (
                <p className="text-sm text-destructive font-medium">{fieldErrors.stock_actual}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
              <Input
                id="stock_minimo"
                type="number"
                min="0"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                required
                disabled={isLoading}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="activo" className="text-base">
                Producto Activo
              </Label>
              <p className="text-sm text-muted-foreground">Los productos activos se muestran en el catálogo público</p>
            </div>
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : product ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
