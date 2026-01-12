"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, Clock, CheckCircle, Truck, MapPin, Calendar, ChevronRight, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { useAuthStore } from "@/lib/auth-store"
import { ordersService } from "@/lib/api"
import type { Order } from "@/lib/api"
import { cn } from "@/lib/utils"

const statusConfig = {
  recibido: {
    label: "Recibido",
    icon: Package,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Tu pedido ha sido recibido",
  },
  en_preparacion: {
    label: "En Preparación",
    icon: Clock,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    description: "Estamos preparando tu pedido",
  },
  listo: {
    label: "Listo",
    icon: CheckCircle,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Tu pedido está listo",
  },
  en_camino: {
    label: "En Camino",
    icon: Truck,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Tu pedido va en camino",
  },
  entregado: {
    label: "Entregado",
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    description: "Pedido entregado",
  },
  cancelado: {
    label: "Cancelado",
    icon: Package,
    color: "bg-red-100 text-red-700 border-red-200",
    description: "Pedido cancelado",
  },
}

export default function PedidosPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    loadOrders()
  }, [isAuthenticated, router])

  const loadOrders = async () => {
    try {
      const data = await ordersService.getAll()
      setOrders(data)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "todos" || order.status === activeTab
    return matchesSearch && matchesTab
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">Revisa el estado de tus pedidos</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por número de pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="recibido">Recibidos</TabsTrigger>
            <TabsTrigger value="en_preparacion">En Preparación</TabsTrigger>
            <TabsTrigger value="listo">Listos</TabsTrigger>
            <TabsTrigger value="entregado">Entregados</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
                <p className="text-gray-500 mb-4">No tienes pedidos en esta categoría</p>
                <Button onClick={() => router.push("/menu")} className="bg-rose-500 hover:bg-rose-600 text-white">
                  Ir al Menú
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status]
              const StatusIcon = status.icon

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-xl", status.color.split(" ")[0])}>
                          <StatusIcon className={cn("h-6 w-6", status.color.split(" ")[1])} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                            <Badge className={cn("border", status.color)}>{status.label}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{status.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.createdAt).toLocaleDateString("es-ES")}
                            </span>
                            {order.deliveryType === "delivery" ? (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {order.deliveryZone}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Retiro: {order.pickupTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-xl font-bold text-gray-900">${Number(order.total).toFixed(2)}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex-shrink-0">
                            <img
                              src={item.productImage || "/placeholder.svg"}
                              alt={item.productName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          </div>
                        ))}
                        <span className="text-sm text-gray-500 ml-2">
                          {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
