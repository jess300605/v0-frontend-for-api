const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  error_code?: string
}

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: "admin" | "empleado" | "usuario"
  activo: boolean
}

export interface AuthData {
  usuario: Usuario
  token: string
  tipo_token: string
  expira_en: number
}

export interface DashboardData {
  metricas_principales: {
    ventas_hoy: number
    monto_hoy: number
    productos_activos: number
    productos_stock_bajo: number
  }
  fecha_actualizacion: string
}

export interface Producto {
  id: number
  codigo_sku: string
  nombre: string
  descripcion: string | null
  categoria: string
  precio: number
  stock: number
  stock_minimo: number
  activo: boolean
  url_imagen?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProductoInput {
  codigo_sku: string
  nombre: string
  descripcion?: string
  categoria: string
  precio: number
  stock: number
  stock_minimo: number
  url_imagen?: string
  activo?: boolean
}

export interface Venta {
  id: number
  fecha: string
  created_at: string
  total: number
  usuario_nombre: string
  nombre_cliente?: string
  email_cliente?: string
  telefono_cliente?: string
  estado: string
  detalles?: VentaDetalle[]
}

export interface VentaDetalle {
  id: number
  venta_id: number
  producto_id: number
  producto_nombre: string
  producto_codigo: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface VentaInput {
  nombre_cliente: string
  email_cliente?: string
  telefono_cliente?: string
  productos: Array<{
    id_producto: number
    cantidad: number
    precio_unitario: number
  }>
}

export interface ReporteVentas {
  periodo: {
    fecha_inicio: string
    fecha_fin: string
    dias: number
  }
  resumen: {
    total_ventas: number
    monto_total: number
    promedio_venta: number
    crecimiento_ventas: number
    crecimiento_monto: number
  }
  grafico_ventas: Array<{
    periodo: string
    fecha: string
    cantidad: number
    monto: number
  }>
  top_productos: Array<{
    id_producto: number
    total_vendido: number
    ingresos: number
    producto: {
      nombre: string
      precio: number
    }
  }>
}

export interface ReporteProductos {
  periodo: {
    tipo: string
    fecha_inicio: string
    fecha_fin: string
  }
  productos: Array<{
    producto: {
      id: number
      nombre: string
      categoria: string
      stock: number
      precio: number
    }
    estadisticas: {
      total_vendido: number
      veces_comprado: number
      ingresos_generados: number
      precio_promedio: number
      porcentaje_ingresos: number
      porcentaje_cantidad: number
    }
  }>
  totales: {
    productos_analizados: number
    ingresos_totales: number
    unidades_totales: number
  }
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem("auth_token")
    console.log(
      "[v0] Getting token from localStorage:",
      token ? `Token exists (${token.substring(0, 20)}...)` : "No token found",
    )
    return token
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    const token = this.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
      console.log("[v0] Authorization header added to request")
    } else {
      console.warn("[v0] ⚠️ NO TOKEN FOUND - Request will be sent without authentication!")
    }

    console.log("[v0] Request headers:", headers)
    return headers
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      console.log("[v0] ========== API REQUEST ==========")
      console.log(`[v0] URL: ${url}`)
      console.log(`[v0] Method: ${options.method || "GET"}`)
      console.log(`[v0] Has token: ${this.getToken() ? "YES ✓" : "NO ✗"}`)

      const headers = {
        ...this.getHeaders(),
        ...options.headers,
      }

      console.log(`[v0] Final headers:`, headers)
      console.log(`[v0] Body:`, options.body)
      console.log("[v0] ===================================")

      let response: Response
      try {
        response = await fetch(url, {
          ...options,
          headers,
        })
        console.log(`[v0] ✓ Fetch successful - Response received`)
      } catch (fetchError) {
        console.error("[v0] ❌ FETCH FAILED - Network error:", fetchError)
        console.error("[v0] Error type:", fetchError instanceof TypeError ? "TypeError" : typeof fetchError)
        console.error("[v0] Error message:", (fetchError as Error).message)

        throw new Error(
          `No se pudo conectar con el servidor API.\n\n` +
            `URL intentada: ${url}\n\n` +
            `Error: ${(fetchError as Error).message}\n\n` +
            `Posibles causas:\n` +
            `1. El servidor Laravel no está corriendo (ejecuta: php artisan serve --host=0.0.0.0 --port=8000)\n` +
            `2. La URL de la API es incorrecta (verifica NEXT_PUBLIC_API_URL en .env.local)\n` +
            `3. Problema de CORS en el servidor Laravel\n` +
            `4. El puerto 8000 está bloqueado o en uso\n\n` +
            `Diagnóstico:\n` +
            `- Página actual: ${typeof window !== "undefined" ? window.location.href : "N/A"}\n` +
            `- API configurada: ${API_BASE_URL}\n\n` +
            `¿Estás accediendo desde localhost:3000?`,
        )
      }

      console.log(`[v0] Response status: ${response.status} ${response.statusText}`)
      console.log(`[v0] Response headers:`, Object.fromEntries(response.headers.entries()))

      if (response.type === "opaque" || response.type === "opaqueredirect") {
        console.error("[v0] ❌ CORS ERROR - Response is opaque, CORS is blocking the response")
        throw new Error(
          `Error de CORS detectado.\n\n` +
            `El servidor Laravel está bloqueando las peticiones desde el frontend.\n\n` +
            `Solución:\n` +
            `1. Verifica que config/cors.php en Laravel tenga:\n` +
            `   'allowed_origins' => ['http://localhost:3000']\n` +
            `   'allowed_methods' => ['*']\n` +
            `   'allowed_headers' => ['*']\n` +
            `2. Asegúrate de que el middleware CORS esté habilitado en Laravel`,
        )
      }

      if (response.status === 401) {
        console.error("[v0] ❌ 401 UNAUTHORIZED - Token inválido o expirado")
        throw new Error("No estás autenticado. Por favor inicia sesión nuevamente.")
      }

      if (response.status === 403) {
        console.error("[v0] ❌ 403 FORBIDDEN - No tienes permisos para esta acción")
        throw new Error("No tienes permisos para realizar esta acción.")
      }

      if (response.status === 404) {
        console.error("[v0] ❌ 404 NOT FOUND - El endpoint no existe en el backend")
        throw new Error(
          `Endpoint no encontrado: ${endpoint}\n\n` +
            `El backend Laravel no tiene configurada esta ruta.\n\n` +
            `Verifica que en routes/api.php existan las rutas para productos:\n` +
            `Route::apiResource('productos', ProductoController::class);`,
        )
      }

      if (response.status === 500) {
        console.error("[v0] ❌ 500 INTERNAL SERVER ERROR - Error en el servidor Laravel")
        const text = await response.text()
        console.error("[v0] Server error response:", text)
        throw new Error(
          `Error interno del servidor Laravel.\n\n` +
            `Revisa los logs del servidor Laravel para más detalles.\n` +
            `El error puede estar en el ProductoController o en la base de datos.`,
        )
      }

      const contentType = response.headers.get("content-type")
      const hasJsonContent = contentType && contentType.includes("application/json")

      console.log(`[v0] Content-Type: ${contentType}`)
      console.log(`[v0] Has JSON content: ${hasJsonContent}`)

      let data: any = {}

      if (hasJsonContent) {
        const text = await response.text()
        console.log(`[v0] Response text (first 500 chars):`, text.substring(0, 500))

        if (text) {
          try {
            data = JSON.parse(text)
            console.log(`[v0] ✓ JSON parsed successfully`)
          } catch (e) {
            console.error("[v0] ❌ Failed to parse JSON:", e)
            console.error("[v0] Raw response:", text)
            data = { success: false, message: "Invalid JSON response from server" }
          }
        }
      } else {
        console.log("[v0] ⚠️ Response is not JSON, content-type:", contentType)
        const text = await response.text()
        console.log("[v0] Non-JSON response:", text)
        data = { success: false, message: `Non-JSON response: ${text}` }
      }

      console.log(`[v0] Parsed data:`, data)

      if (!response.ok) {
        console.error("[v0] ❌ Response not OK - Status:", response.status)
        console.error("[v0] Error data:", data)

        if (data.errors) {
          console.error("[v0] Validation errors:", data.errors)
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
            .join("\n")
          throw new Error(`Errores de validación:\n${errorMessages}`)
        }
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`)
      }

      console.log("[v0] ✓ Request successful")
      return data
    } catch (error) {
      console.error("[v0] ========== API ERROR ==========")
      console.error("[v0] Error caught:", error)
      console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
      console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
      console.error("[v0] ==================================")
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, contraseña: string): Promise<ApiResponse<AuthData>> {
    return this.request<AuthData>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, contraseña }),
    })
  }

  async register(data: {
    nombre: string
    email: string
    contraseña: string
    contraseña_confirmation: string
  }): Promise<ApiResponse<AuthData>> {
    return this.request<AuthData>("/usuarios", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        rol: "usuario", // Default role for public registration
      }),
    })
  }

  async logout(): Promise<ApiResponse> {
    return this.request("/logout", { method: "POST" })
  }

  async me(): Promise<ApiResponse<{ usuario: Usuario }>> {
    return this.request("/me")
  }

  async refreshToken(): Promise<ApiResponse<AuthData>> {
    return this.request("/refresh", { method: "POST" })
  }

  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.request<DashboardData>("/dashboard")
  }

  async getProductos(): Promise<ApiResponse<Producto[]>> {
    const response = await this.request<any>("/productos")
    console.log("[v0] getProductos raw response:", response)

    // Backend returns: { success: true, data: { productos: [...], paginacion: {...} } }
    if (response.success && response.data && response.data.productos) {
      return {
        ...response,
        data: response.data.productos,
      }
    }

    return response
  }

  async getProducto(id: number): Promise<ApiResponse<Producto>> {
    const response = await this.request<any>(`/productos/${id}`)
    console.log("[v0] getProducto raw response:", response)

    // Backend returns: { success: true, data: { producto: {...}, estado_stock: {...} } }
    if (response.success && response.data && response.data.producto) {
      return {
        ...response,
        data: response.data.producto,
      }
    }

    return response
  }

  async createProducto(data: ProductoInput): Promise<ApiResponse<Producto>> {
    console.log("[v0] Creating product with data:", JSON.stringify(data, null, 2))
    console.log("[v0] Data types:", {
      codigo_sku: typeof data.codigo_sku,
      nombre: typeof data.nombre,
      categoria: typeof data.categoria,
      precio: typeof data.precio,
      stock: typeof data.stock,
      stock_minimo: typeof data.stock_minimo,
      url_imagen: typeof data.url_imagen,
      activo: typeof data.activo,
    })
    console.log("[v0] POST URL:", `${API_BASE_URL}/productos`)

    const response = await this.request<any>("/productos", {
      method: "POST",
      body: JSON.stringify(data),
    })

    console.log("[v0] Create product raw response:", response)

    // Backend returns: { success: true, message: "...", data: { producto: {...}, id: ... } }
    if (response.success && response.data && response.data.producto) {
      return {
        ...response,
        data: response.data.producto,
      }
    }

    return response
  }

  async updateProducto(id: number, data: ProductoInput): Promise<ApiResponse<Producto>> {
    console.log("[v0] Updating product ID:", id)
    console.log("[v0] Update payload:", JSON.stringify(data, null, 2))
    console.log("[v0] Field types:", {
      codigo_sku: typeof data.codigo_sku,
      nombre: typeof data.nombre,
      categoria: typeof data.categoria,
      precio: typeof data.precio,
      stock: typeof data.stock,
      stock_minimo: typeof data.stock_minimo,
      url_imagen: typeof data.url_imagen,
      activo: typeof data.activo,
    })

    const response = await this.request<any>(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })

    console.log("[v0] Update product raw response:", response)

    // Backend returns: { success: true, message: "...", data: { producto: {...} } }
    if (response.success && response.data && response.data.producto) {
      return {
        ...response,
        data: response.data.producto,
      }
    }

    return response
  }

  async deleteProducto(id: number): Promise<ApiResponse> {
    return this.request(`/productos/${id}`, {
      method: "DELETE",
    })
  }

  // Venta endpoints
  async getVentas(): Promise<ApiResponse<Venta[]>> {
    return this.request<Venta[]>("/ventas")
  }

  async getVenta(id: number): Promise<ApiResponse<Venta>> {
    console.log(`[v0] Fetching venta details for ID: ${id}`)
    const response = await this.request<any>(`/ventas/${id}`)
    console.log(`[v0] Venta detail response:`, response)

    // Handle nested structure: { success: true, data: { venta: {...} } }
    if (response.success && response.data) {
      const ventaData = response.data.venta || response.data
      console.log(`[v0] Extracted venta data:`, ventaData)
      return {
        ...response,
        data: ventaData,
      }
    }

    return response
  }

  async createVenta(data: VentaInput): Promise<ApiResponse<Venta>> {
    console.log("[v0] Creating venta with data:", JSON.stringify(data, null, 2))
    return this.request<Venta>("/ventas", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async cancelVenta(id: number): Promise<ApiResponse> {
    return this.request(`/ventas/${id}/cancelar`, {
      method: "POST",
    })
  }

  // Reporte endpoints
  async getReporteVentas(): Promise<ApiResponse<ReporteVentas>> {
    return this.request<ReporteVentas>("/reportes/ventas")
  }

  async getReporteProductos(): Promise<ApiResponse<ReporteProductos>> {
    return this.request<ReporteProductos>("/reportes/productos")
  }
}

export const api = new ApiClient()
