"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, Clock, CheckCircle, XCircle, Phone, MapPin, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { ordersService } from "@/lib/api/services"
import type { Order } from "@/lib/api/types"

const statusConfig = {
  recibido: { label: "Recibido", color: "bg-blue-500", icon: Package },
  en_preparacion: { label: "En Preparación", color: "bg-amber-500", icon: Clock },
  listo: { label: "Listo", color: "bg-green-500", icon: CheckCircle },
  en_camino: { label: "En Camino", color: "bg-purple-500", icon: Package },
  entregado: { label: "Entregado", color: "bg-green-600", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-500", icon: XCircle },
}

export default function RecepcionistaPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [selectedTab, setSelectedTab] = useState("active")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   if (!isAuthenticated || user?.role !== "recepcionista") {
  //     router.push("/login")
  //   }
  // }, [isAuthenticated, user, router])

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await ordersService.getAll()
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.role === "recepcionista") {
      fetchOrders()
      // Refresh orders every 30 seconds
      const interval = setInterval(fetchOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || user?.role !== "recepcionista") {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersService.updateStatus(orderId, newStatus as Order["status"])
      // Refresh orders after update
      const data = await ordersService.getAll()
      setOrders(data)
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error)
    }
  }

  const activeOrders = orders.filter((o) => !["entregado", "cancelado"].includes(o.status))
  const completedOrders = orders.filter((o) => ["entregado", "cancelado"].includes(o.status))

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="sticky top-0 z-50">
        <Header />
        <div className="bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-rose-600">Panel de Recepción</h1>
              <span className="text-xs text-gray-600">Atención al Cliente</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">Recepcionista</p>
              </div>
              <Button
                variant="outline"
                className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="bg-gradient-to-r from-rose-100 to-pink-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Recepción</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pedidos Activos</p>
                    <p className="text-3xl font-bold text-gray-900">{activeOrders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">En Preparación</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.filter((o) => o.status === "en_preparacion").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Listos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.filter((o) => o.status === "listo").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completados Hoy</p>
                    <p className="text-3xl font-bold text-gray-900">{completedOrders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">Pedidos Activos ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completados ({completedOrders.length})</TabsTrigger>
          </TabsList>

          {/* Active Orders */}
          <TabsContent value="active">
            <div className="space-y-4">
              {activeOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig]
                const StatusIcon = status.icon

                return (
                  <Card key={order.id} className="border-rose-100">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">Pedido #{order.orderNumber}</h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  <span className="font-medium">{order.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{order.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{new Date(order.createdAt).toLocaleString('es-VE')}</span>
                                </div>
                                {order.deliveryType === "delivery" ? (
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium">{order.deliveryZone || 'N/A'}</p>
                                      <p className="text-xs">{order.deliveryAddress || 'N/A'}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium">Retiro en tienda - Listo en: {order.pickupTime}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{order.paymentMethod}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-rose-600">${Number(order.total).toFixed(2)}</p>
                              <Badge
                                className={cn(
                                  order.deliveryType === "delivery"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-green-100 text-green-700 border-green-200",
                                )}
                              >
                                {order.deliveryType === "delivery" ? "Delivery" : "Retiro"}
                              </Badge>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <p className="font-semibold text-gray-900 mb-2">Items del pedido:</p>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-700">
                                    {item.quantity}x {item.productName}
                                  </span>
                                  <span className="font-medium text-gray-900">${Number(item.totalPrice).toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span className="text-gray-900">${Number(order.subtotal).toFixed(2)}</span>
                                </div>
                                {order.deliveryCost > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Envío:</span>
                                    <span className="text-gray-900">${Number(order.deliveryCost).toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-base mt-1">
                                  <span className="text-gray-900">Total:</span>
                                  <span className="text-rose-600">${Number(order.total).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Control */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <StatusIcon className="h-5 w-5 text-gray-600" />
                              <Select
                                defaultValue={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-full sm:w-64 border-rose-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="recibido">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                                      Recibido
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="en_preparacion">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                                      En Preparación
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="listo">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500" />
                                      Listo
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="en_camino">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                                      En Camino
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="entregado">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-600" />
                                      Entregado
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cancelado">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-red-500" />
                                      Cancelado
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Badge className={cn(status.color, "text-white whitespace-nowrap")}>{status.label}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {activeOrders.length === 0 && (
                <Card className="border-rose-100">
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pedidos activos</h3>
                    <p className="text-gray-600">Los nuevos pedidos aparecerán aquí automáticamente</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Completed Orders */}
          <TabsContent value="completed">
            <div className="space-y-4">
              {completedOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig]

                return (
                  <Card key={order.id} className="border-rose-100 opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Pedido #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString('es-VE')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-rose-600">${Number(order.total).toFixed(2)}</p>
                          <Badge className={cn(status.color, "text-white mt-2")}>{status.label}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {completedOrders.length === 0 && (
                <Card className="border-rose-100">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pedidos completados</h3>
                    <p className="text-gray-600">Los pedidos completados aparecerán aquí</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
