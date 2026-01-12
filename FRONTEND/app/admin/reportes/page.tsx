"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, ShoppingBag, Users, Package, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/auth-store"
import { dashboardService } from "@/lib/api/services"
import type { DashboardStats } from "@/lib/api/types"
import { Price } from "@/components/ui/price"

export default function ReportsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, user, router, isHydrated])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.role === "admin") {
      fetchStats()
    }
  }, [isAuthenticated, user])

  if (!isHydrated) return null

  return (
    <div className="min-h-screen bg-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
              <p className="text-gray-600">Resumen general del negocio</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            Exportar / Imprimir
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        ) : !stats ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error al cargar datos</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-rose-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        <Price value={stats.totalRevenue} />
                      </h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pedidos Totales</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Usuarios</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Prod. Bajo Stock</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1 text-amber-600">{stats.lowStocProducts}</h3>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-full">
                      <Package className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Status Breakdown */}
            <Card className="border-rose-100">
              <CardHeader>
                <CardTitle>Estado de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-blue-600 font-medium mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-blue-800">{stats.pendingOrders}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg text-center">
                    <p className="text-amber-600 font-medium mb-1">En Preparación</p>
                    <p className="text-3xl font-bold text-amber-800">{stats.preparingOrders}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-green-600 font-medium mb-1">Completados</p>
                    <p className="text-3xl font-bold text-green-800">{stats.completedOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
