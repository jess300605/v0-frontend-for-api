"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, DollarSign } from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { RecentSales } from "@/components/recent-sales"
import { LowStockAlert } from "@/components/low-stock-alert"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Welcome to your admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <MetricCard icon={Package} title="Total Products" value={100} />
          <MetricCard icon={ShoppingCart} title="Total Sales" value={200} />
          <MetricCard icon={DollarSign} title="Total Revenue" value={5000} />
          <LowStockAlert />
          <RecentSales />
        </CardContent>
      </Card>
    </div>
  )
}
