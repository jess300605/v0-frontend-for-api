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
}

export interface Venta {
  id: number
  fecha: string
  total: number
  usuario_nombre: string
  estado: string
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
  detalles: Array<{
    producto_id: number
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()
      console.log(`[v0] API ${endpoint}:`, data)

      if (!response.ok) {
        console.error("[v0] Error en respuesta:", data)
        throw new Error(data.message || "Error en la petición")
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
    return this.request<Venta>(`/ventas/${id}`)
  }

  async createVenta(data: VentaInput): Promise<ApiResponse<Venta>> {
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
