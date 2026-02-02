"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, User, Package, Clock, CheckCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCartStore } from "@/lib/cart-store"
import { useAuthStore } from "@/lib/auth-store"
import { CartSidebar } from "@/components/cart-sidebar"
import { cn } from "@/lib/utils"
import { ordersService } from "@/lib/api/services"
import type { Order } from "@/lib/api/types"

// Mapeo de estados del backend a estados del frontend
const statusMapping = {
  recibido: "received",
  en_preparacion: "preparing",
  en_camino: "in-transit",
  entregado: "delivered",
  listo: "preparing",
  cancelado: "cancelled",
} as const

const statusConfig = {
  received: {
    label: "Recibido",
    icon: Package,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Tu pedido ha sido recibido",
  },
  preparing: {
    label: "En Preparación",
    icon: Clock,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    description: "Estamos preparando tu pedido",
  },
  "in-transit": {
    label: "En Camino",
    icon: Truck,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Tu pedido está en camino",
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Pedido entregado exitosamente",
  },
  cancelled: {
    label: "Cancelado",
    icon: Package,
    color: "bg-red-100 text-red-700 border-red-200",
    description: "Pedido cancelado",
  },
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [cartOpen, setCartOpen] = useState(false)
  const { getTotalItems } = useCartStore()
  const [activeTab, setActiveTab] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar pedidos del usuario
  useEffect(() => {
    const loadOrders = async () => {
      if (user?.id) {
        try {
          setIsLoading(true)
          const userOrders = await ordersService.getByUser(Number(user.id))
          setOrders(userOrders)
        } catch (error) {
          console.error("Error al cargar pedidos:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (isAuthenticated && user) {
      loadOrders()
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "usuario") {
      return
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "usuario") {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Mapear pedidos al formato esperado por la UI
  const mappedOrders = orders.map((order) => ({
    ...order,
    status: statusMapping[order.status as keyof typeof statusMapping] || "received",
  }))

  const filteredOrders =
    activeTab === "all" ? mappedOrders : mappedOrders.filter((order) => order.status === activeTab)


  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/momentos-dulces-logo.png" alt="Momentos Dulces" className="h-24 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/menu" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
                Menú
              </Link>
              <Link href="/nosotros" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
                Nosotros
              </Link>
              <Link href="/contacto" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">
                Contacto
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-rose-50"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-rose-500 text-white text-xs">
                  {getTotalItems()}
                </Badge>
              </Button>
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
      </header>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-rose-100 to-pink-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
              <p className="text-lg text-gray-700">Gestiona tus pedidos y preferencias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* User Info Card */}
          <Card className="border-rose-100 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  {user.phone && <p className="text-gray-600">{user.phone}</p>}
                </div>
                <Button variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent">
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders Section */}
          <Card className="border-rose-100">
            <CardHeader>
              <CardTitle className="text-2xl">Mis Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="received">Recibidos</TabsTrigger>
                  <TabsTrigger value="preparing">Preparando</TabsTrigger>
                  <TabsTrigger value="in-transit">En Camino</TabsTrigger>
                  <TabsTrigger value="delivered">Entregados</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
                      <p className="text-gray-500 text-lg">Cargando pedidos...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {activeTab === "all" ? "No tienes pedidos aún" : "No hay pedidos en esta categoría"}
                      </p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const status = statusConfig[order.status as keyof typeof statusConfig]
                      const StatusIcon = status.icon

                      return (
                        <Card key={order.id} className="border-rose-100 hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-6">
                              {/* Order Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Pedido #{order.orderNumber}</h3>
                                    <p className="text-sm text-gray-600">
                                      Fecha: {new Date(order.createdAt).toLocaleDateString("es-ES")}
                                    </p>
                                  </div>
                                  <Badge className={cn("flex items-center gap-1 border", status.color)}>
                                    <StatusIcon className="h-3 w-3" />
                                    {status.label}
                                  </Badge>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-2 mb-4">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span className="text-gray-700">
                                        {item.quantity}x {item.productName}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        ${Number(item.totalPrice).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Delivery Info */}
                                <div className="text-sm text-gray-600 mb-4">
                                  {order.deliveryZone && (
                                    <p>
                                      <span className="font-medium">Zona de entrega:</span> {order.deliveryZone}
                                    </p>
                                  )}
                                  <p>
                                    <span className="font-medium">Costo de envío:</span> $
                                    {Number(order.deliveryCost).toFixed(2)}
                                  </p>
                                </div>

                                {/* Status Description */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  <StatusIcon className="h-4 w-4" />
                                  <span>{status.description}</span>
                                </div>
                              </div>

                              {/* Order Total */}
                              <div className="lg:border-l lg:border-rose-100 lg:pl-6 flex flex-col justify-between">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Total del Pedido</p>
                                  <p className="text-3xl font-bold text-rose-600">${Number(order.total).toFixed(2)}</p>
                                </div>
                                <div className="space-y-2 mt-4">
                                  <Button
                                    variant="outline"
                                    className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                                  >
                                    Ver Detalles
                                  </Button>
                                  {order.status === "delivered" && (
                                    <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">
                                      Volver a Pedir
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-rose-400">Sweet Moments</h3>
              <p className="text-gray-400">
                Los mejores postres artesanales, hechos con amor y entregados en tu puerta.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/menu" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Menú
                  </Link>
                </li>
                <li>
                  <Link href="/nosotros" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-gray-400 hover:text-rose-400 transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400">Email: info@sweetmoments.com</p>
              <p className="text-gray-400">Tel: +58 424-123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Sweet Moments. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
