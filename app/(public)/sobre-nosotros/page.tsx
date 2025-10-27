import { Card, CardContent } from "@/components/ui/card"
import { Users, Award, Heart, TrendingUp } from "lucide-react"

export default function SobreNosotrosPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">Sobre Nosotros</h1>

        <div className="mb-12 space-y-6 text-lg">
          <p>
            PALERMO es una empresa familiar dedicada a ofrecer los mejores muebles y artículos de decoración para tu
            hogar. Con más de 20 años de experiencia en el mercado, nos hemos consolidado como una de las tiendas de
            muebles más confiables de la región.
          </p>
          <p>
            Nuestra misión es proporcionar productos de alta calidad a precios accesibles, siempre con un servicio al
            cliente excepcional. Trabajamos con los mejores fabricantes y diseñadores para traerte las últimas
            tendencias en decoración y mobiliario.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Users className="mb-4 h-12 w-12 text-emerald-600" />
              <h3 className="mb-2 text-2xl font-bold">500+</h3>
              <p className="text-muted-foreground">Clientes Satisfechos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Award className="mb-4 h-12 w-12 text-emerald-600" />
              <h3 className="mb-2 text-2xl font-bold">20+</h3>
              <p className="text-muted-foreground">Años de Experiencia</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Heart className="mb-4 h-12 w-12 text-emerald-600" />
              <h3 className="mb-2 text-2xl font-bold">100%</h3>
              <p className="text-muted-foreground">Garantía de Calidad</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <TrendingUp className="mb-4 h-12 w-12 text-emerald-600" />
              <h3 className="mb-2 text-2xl font-bold">1000+</h3>
              <p className="text-muted-foreground">Productos Disponibles</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg bg-emerald-50 p-8">
          <h2 className="mb-4 text-2xl font-bold">Nuestros Valores</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              <div>
                <strong>Calidad:</strong> Seleccionamos cuidadosamente cada producto para garantizar la mejor calidad.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              <div>
                <strong>Servicio:</strong> Nuestro equipo está siempre dispuesto a ayudarte a encontrar lo que
                necesitas.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              <div>
                <strong>Innovación:</strong> Constantemente actualizamos nuestro catálogo con las últimas tendencias.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
