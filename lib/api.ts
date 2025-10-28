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
    return localStorage.getItem("auth_token")
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    const token = this.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      console.log(`[v0] Making request to: ${url}`)
      console.log(`[v0] Method: ${options.method || "GET"}`)

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      console.log(`[v0] Response status: ${response.status} ${response.statusText}`)
      console.log(`[v0] Response headers:`, Object.fromEntries(response.headers.entries()))

      const contentType = response.headers.get("content-type")
      const hasJsonContent = contentType && contentType.includes("application/json")

      let data: any = {}

      if (hasJsonContent) {
        const text = await response.text()
        console.log(`[v0] Response text:`, text)

        if (text) {
          try {
            data = JSON.parse(text)
          } catch (e) {
            console.error("[v0] Failed to parse JSON:", e)
            data = { success: false, message: "Invalid JSON response" }
          }
        }
      } else {
        console.log("[v0] Response is not JSON, content-type:", contentType)
        const text = await response.text()
        console.log("[v0] Response text:", text)
        data = { success: false, message: `Non-JSON response: ${text}` }
      }

      console.log(`[v0] API ${endpoint}:`, data)

      if (!response.ok) {
        console.error("[v0] Error en respuesta:", data)
        if (data.errors) {
          console.error("[v0] Validation errors:", data.errors)
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
            .join("\n")
          throw new Error(`Errores de validación:\n${errorMessages}`)
        }
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error("[v0] API Error:", error)
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
    return this.request<AuthData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
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
    return this.request<Producto[]>("/productos")
  }

  async getProducto(id: number): Promise<ApiResponse<Producto>> {
    return this.request<Producto>(`/productos/${id}`)
  }

  async createProducto(data: ProductoInput): Promise<ApiResponse<Producto>> {
    return this.request<Producto>("/productos", {
      method: "POST",
      body: JSON.stringify(data),
    })
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
    })

    const response = await this.request<Producto>(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })

    console.log("[v0] Update response:", response)
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
