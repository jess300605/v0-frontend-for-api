"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TopProductsChartProps {
  data: Array<{
    id_producto: number
    total_vendido: number
    ingresos: number
    producto: {
      nombre: string
      precio: number
    }
  }>
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = data.slice(0, 5).map((item) => ({
    name: item.producto.nombre.length > 20 ? item.producto.nombre.substring(0, 20) + "..." : item.producto.nombre,
    cantidad: item.total_vendido,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Productos</CardTitle>
        <CardDescription>Más vendidos por unidades</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            cantidad: {
              label: "Unidades",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" width={120} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="cantidad" fill="var(--color-cantidad)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
