"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type Usuario } from "./api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await api.me()
      if (response.success && response.data) {
        setUser(response.data.usuario)
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      localStorage.removeItem("auth_token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    if (response.success && response.data) {
      localStorage.setItem("auth_token", response.data.token)
      setUser(response.data.usuario)
      router.push("/dashboard")
    } else {
      throw new Error(response.message || "Error al iniciar sesión")
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      localStorage.removeItem("auth_token")
      setUser(null)
      router.push("/login")
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    const permissions: Record<string, string[]> = {
      admin: [
        "usuarios.crear",
        "usuarios.editar",
        "usuarios.eliminar",
        "usuarios.ver",
        "productos.crear",
        "productos.editar",
        "productos.eliminar",
        "productos.ver",
        "ventas.crear",
        "ventas.ver",
        "ventas.cancelar",
        "reportes.ventas",
        "reportes.productos",
        "reportes.usuarios",
        "dashboard.completo",
      ],
      empleado: [
        "productos.crear",
        "productos.editar",
        "productos.ver",
        "ventas.crear",
        "ventas.ver",
        "reportes.ventas",
        "reportes.productos",
        "dashboard.basico",
      ],
      usuario: ["productos.ver", "catalogo.buscar"],
    }

    return permissions[user.rol]?.includes(permission) || false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
