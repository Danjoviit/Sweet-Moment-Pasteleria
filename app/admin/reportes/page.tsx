"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, ShoppingBag, DollarSign, Package, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"

// Mock data para reportes
const salesData = {
  today: 520,
  yesterday: 480,
  week: 3250,
  month: 15780,
  ordersToday: 12,
  ordersWeek: 78,
  avgOrderValue: 43.33,
}

const topProducts = [
  { name: "Torta de Chocolate", sales: 45, revenue: 4500 },
  { name: "Fresas con Crema", sales: 38, revenue: 1520 },
  { name: "Brownie de Chocolate", sales: 32, revenue: 320 },
  { name: "Cupcakes", sales: 28, revenue: 560 },
  { name: "Donas", sales: 25, revenue: 500 },
]

const salesByCategory = [
  { category: "Tortas", percentage: 35, revenue: 5523 },
  { category: "Fresas con Crema", percentage: 20, revenue: 3156 },
  { category: "Brownies", percentage: 15, revenue: 2367 },
  { category: "Cupcakes", percentage: 12, revenue: 1894 },
  { category: "Donas", percentage: 10, revenue: 1578 },
  { category: "Otros", percentage: 8, revenue: 1262 },
]

const recentOrders = [
  { date: "27/01/2025", orders: 12, revenue: 520 },
  { date: "26/01/2025", orders: 15, revenue: 680 },
  { date: "25/01/2025", orders: 10, revenue: 420 },
  { date: "24/01/2025", orders: 18, revenue: 750 },
  { date: "23/01/2025", orders: 14, revenue: 590 },
  { date: "22/01/2025", orders: 9, revenue: 380 },
  { date: "21/01/2025", orders: 11, revenue: 470 },
]

export default function AdminReportesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [period, setPeriod] = useState("week")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "administrador") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "administrador") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <div className="bg-white border-b border-rose-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                <p className="text-sm text-gray-600">Análisis de ventas y rendimiento</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40 border-rose-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="year">Este Año</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-rose-300 text-rose-600 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-rose-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ventas Hoy</p>
                  <p className="text-3xl font-bold text-gray-900">${salesData.today}</p>
                  <p className="text-sm text-green-600 mt-1">+8.3% vs ayer</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pedidos Hoy</p>
                  <p className="text-3xl font-bold text-gray-900">{salesData.ordersToday}</p>
                  <p className="text-sm text-gray-500 mt-1">{salesData.ordersWeek} esta semana</p>
                </div>
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
                  <p className="text-3xl font-bold text-gray-900">${salesData.avgOrderValue}</p>
                  <p className="text-sm text-green-600 mt-1">+5.2% vs semana pasada</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ventas del Mes</p>
                  <p className="text-3xl font-bold text-gray-900">${salesData.month.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">+12.5% vs mes pasado</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <Card className="border-rose-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-rose-600" />
                Productos Más Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} vendidos</p>
                    </div>
                    <p className="font-semibold text-rose-600">${product.revenue}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card className="border-rose-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-600" />
                Ventas por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      <span className="text-sm text-gray-600">
                        ${item.revenue} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-rose-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales History */}
        <Card className="border-rose-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rose-600" />
              Historial de Ventas (Últimos 7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rose-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Pedidos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Ingresos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((day) => (
                    <tr key={day.date} className="border-b border-rose-50 hover:bg-rose-50/50">
                      <td className="py-3 px-4 text-gray-900">{day.date}</td>
                      <td className="py-3 px-4 text-gray-600">{day.orders} pedidos</td>
                      <td className="py-3 px-4 font-semibold text-rose-600">${day.revenue}</td>
                      <td className="py-3 px-4 text-gray-600">${(day.revenue / day.orders).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
