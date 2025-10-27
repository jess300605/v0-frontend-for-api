"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SalesChartProps {
  data: Array<{
    fecha: string
    total: number
    cantidad: number
  }>
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
    ventas: item.total,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Diarias</CardTitle>
        <CardDescription>Últimos 30 días</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            ventas: {
              label: "Ventas",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="ventas" fill="var(--color-ventas)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
