import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Clock, Mail } from "lucide-react"

export default function SucursalesPage() {
  const sucursales = [
    {
      nombre: "Sucursal Centro",
      direccion: "Av. Principal 123, Centro Histórico",
      telefono: "(123) 456-7890",
      email: "centro@palermo.com",
      horario: "Lun-Sab: 9:00 - 20:00, Dom: 10:00 - 18:00",
    },
    {
      nombre: "Sucursal Norte",
      direccion: "Blvd. Norte 456, Plaza Comercial",
      telefono: "(123) 456-7891",
      email: "norte@palermo.com",
      horario: "Lun-Sab: 10:00 - 21:00, Dom: 11:00 - 19:00",
    },
    {
      nombre: "Sucursal Sur",
      direccion: "Calle Sur 789, Col. Residencial",
      telefono: "(123) 456-7892",
      email: "sur@palermo.com",
      horario: "Lun-Sab: 9:00 - 20:00, Dom: 10:00 - 18:00",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">Nuestras Sucursales</h1>
        <p className="mb-12 text-lg text-muted-foreground">
          Visítanos en cualquiera de nuestras sucursales. Nuestro equipo estará encantado de atenderte y ayudarte a
          encontrar los muebles perfectos para tu hogar.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sucursales.map((sucursal, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-emerald-600">{sucursal.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm">{sucursal.direccion}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm">{sucursal.telefono}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm">{sucursal.email}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm">{sucursal.horario}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-emerald-50 p-8">
          <h2 className="mb-4 text-2xl font-bold">Servicios Adicionales</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              <div>
                <strong>Entrega a Domicilio:</strong> Servicio de entrega en toda la ciudad
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              <div>
                <strong>Armado de Muebles:</strong> Instalación profesional incluida
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              <div>
                <strong>Asesoría Personalizada:</strong> Expertos en decoración a tu servicio
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              <div>
                <strong>Financiamiento:</strong> Planes de pago flexibles disponibles
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
