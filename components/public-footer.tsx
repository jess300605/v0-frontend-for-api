import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t bg-emerald-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">PALERMO</h3>
            <p className="text-sm text-emerald-100">Tu tienda de muebles y decoración de confianza</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-emerald-100 hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-emerald-100 hover:text-white">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-emerald-100 hover:text-white">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Información</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre-nosotros" className="text-emerald-100 hover:text-white">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/sucursales" className="text-emerald-100 hover:text-white">
                  Sucursales
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-emerald-100 hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Contacto</h4>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li>Tel: (123) 456-7890</li>
              <li>Email: info@palermo.com</li>
              <li>Horario: Lun-Sab 9:00-18:00</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-emerald-600 pt-4 text-center text-sm text-emerald-100">
          <p>&copy; 2025 PALERMO. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
