"use client"

import Link from "next/link"
import { User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { CartSheet } from "@/components/cart-sheet"

export function PublicHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-emerald-700 text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <span className="text-lg font-bold text-emerald-700">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">PALERMO</span>
            <span className="text-xs">Muebles y más</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-emerald-600 hover:text-white">
              Inicio
            </Button>
          </Link>
          <Link href="/catalogo">
            <Button variant="ghost" className="text-white hover:bg-emerald-600 hover:text-white">
              Catálogo de Productos
            </Button>
          </Link>
          <Link href="/ofertas">
            <Button variant="ghost" className="text-white hover:bg-emerald-600 hover:text-white">
              Ofertas
            </Button>
          </Link>
          <Link href="/sobre-nosotros">
            <Button variant="ghost" className="text-white hover:bg-emerald-600 hover:text-white">
              Sobre Nosotros
            </Button>
          </Link>
          <Link href="/sucursales">
            <Button variant="ghost" className="text-white hover:bg-emerald-600 hover:text-white">
              Sucursal y Más
            </Button>
          </Link>
        </nav>

        {/* Search and User Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 lg:flex">
            <Input type="search" placeholder="Buscar productos..." className="w-64 bg-white text-gray-900" />
            <Button size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <CartSheet />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="text-white hover:bg-emerald-600">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.nombre}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.rol === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Panel de Administración</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/mis-pedidos">Mis Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil">Mi Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Iniciar Sesión</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/registro">Registrarse</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
