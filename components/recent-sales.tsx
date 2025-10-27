import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Sale {
  id: number
  fecha: string
  total: number
  usuario: string
  items: number
}

interface RecentSalesProps {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
        <CardDescription>Últimas transacciones realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay ventas recientes</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Venta #{sale.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.items} {sale.items === 1 ? "producto" : "productos"} • {sale.usuario}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(sale.fecha), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${sale.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
