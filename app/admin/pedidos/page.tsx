"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Search, Filter, Eye, Clock, CheckCircle, Truck, Package, XCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/auth-store"
import { ordersService } from "@/lib/api/services"
import type { Order } from "@/lib/api/types"

const statusConfig = {
  recibido: { label: "Recibido", color: "bg-blue-100 text-blue-800", icon: Clock },
  en_preparacion: { label: "En Preparación", color: "bg-yellow-100 text-yellow-800", icon: Package },
  listo: { label: "Listo", color: "bg-green-100 text-green-800", icon: CheckCircle },
  en_camino: { label: "En Camino", color: "bg-purple-100 text-purple-800", icon: Truck },
  entregado: { label: "Entregado", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function AdminPedidosPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login")
      return
    }
    loadOrders()
  }, [isAuthenticated, user, router])

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

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await ordersService.updateStatus(orderId, newStatus)
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Gestión de Pedidos</h1>
            </div>
            <Badge variant="outline" className="text-rose-600 border-rose-200">
              {filteredOrders.length} pedidos
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="recibido">Recibido</SelectItem>
                  <SelectItem value="en_preparacion">En Preparación</SelectItem>
                  <SelectItem value="listo">Listo</SelectItem>
                  <SelectItem value="en_camino">En Camino</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron pedidos</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock
              const isExpanded = expandedOrder === order.id

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${statusConfig[order.status]?.color}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                          <p className="text-sm text-gray-500">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-rose-600">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge className={statusConfig[order.status]?.color}>{statusConfig[order.status]?.label}</Badge>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-6 py-4">
                        {/* Detalles del cliente */}
                        <div>
                          <h4 className="font-semibold mb-2">Información del Cliente</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-gray-500">Email:</span> {order.customerEmail}
                            </p>
                            <p>
                              <span className="text-gray-500">Teléfono:</span> {order.customerPhone}
                            </p>
                            <p>
                              <span className="text-gray-500">Tipo:</span>{" "}
                              {order.deliveryType === "delivery" ? "Delivery" : "Retiro"}
                            </p>
                            {order.deliveryAddress && (
                              <p>
                                <span className="text-gray-500">Dirección:</span> {order.deliveryAddress}
                              </p>
                            )}
                            {order.pickupTime && (
                              <p>
                                <span className="text-gray-500">Hora retiro:</span> {order.pickupTime}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Items del pedido */}
                        <div>
                          <h4 className="font-semibold mb-2">Productos</h4>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 text-sm">
                                <Image
                                  src={item.productImage || "/placeholder.svg?height=40&width=40"}
                                  alt={item.productName}
                                  width={40}
                                  height={40}
                                  className="rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-gray-500">
                                    x{item.quantity} - ${item.totalPrice.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Link href={`/pedidos/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Cambiar estado:</span>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recibido">Recibido</SelectItem>
                              <SelectItem value="en_preparacion">En Preparación</SelectItem>
                              <SelectItem value="listo">Listo</SelectItem>
                              <SelectItem value="en_camino">En Camino</SelectItem>
                              <SelectItem value="entregado">Entregado</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
