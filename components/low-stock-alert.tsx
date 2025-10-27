import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface Product {
  id: number
  nombre: string
  stock_actual: number
  stock_minimo: number
}

interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  return (
    <Card className={products.length > 0 ? "border-orange-500" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className={products.length > 0 ? "text-orange-500" : ""} />
          Alertas de Stock
        </CardTitle>
        <CardDescription>Productos que requieren reabastecimiento</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            ✓ Todos los productos tienen stock suficiente
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{product.nombre}</p>
                    <p className="text-xs text-muted-foreground">Stock mínimo: {product.stock_minimo}</p>
                  </div>
                  <Badge variant="destructive">{product.stock_actual} unidades</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
