"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Header from "@/components/header"
import { useAuthStore } from "@/lib/auth-store"
import { ordersService } from "@/lib/api/services"
import type { Order } from "@/lib/api/types"

const statusConfig = {
  recibido: { label: "Recibido", color: "bg-blue-100 text-blue-800", icon: Clock, step: 1 },
  en_preparacion: { label: "En Preparación", color: "bg-yellow-100 text-yellow-800", icon: Package, step: 2 },
  listo: { label: "Listo para Entrega", color: "bg-green-100 text-green-800", icon: CheckCircle, step: 3 },
  en_camino: { label: "En Camino", color: "bg-purple-100 text-purple-800", icon: Truck, step: 4 },
  entregado: { label: "Entregado", color: "bg-gray-100 text-gray-800", icon: CheckCircle, step: 5 },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle, step: 0 },
}

const paymentMethodLabels = {
  tarjeta: "Tarjeta de Crédito/Débito",
  pago_movil: "Pago Móvil",
  efectivo: "Efectivo",
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/pedidos/" + resolvedParams.orderId)
      return
    }
    loadOrder()
  }, [isAuthenticated, resolvedParams.orderId, router])

  const loadOrder = async () => {
    try {
      const data = await ordersService.getById(resolvedParams.orderId)
      if (data) {
        setOrder(data)
      } else {
        router.push("/pedidos")
      }
    } catch (error) {
      console.error("Error loading order:", error)
      router.push("/pedidos")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus?.icon || Clock

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/pedidos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedido {order.orderNumber}</h1>
            <p className="text-gray-500">
              Realizado el{" "}
              {new Date(order.createdAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Estado del Pedido */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado del Pedido</span>
              <Badge className={currentStatus?.color}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {currentStatus?.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.status !== "cancelado" ? (
              <div className="flex items-center justify-between">
                {["recibido", "en_preparacion", "listo", "en_camino", "entregado"].map((status, index) => {
                  const config = statusConfig[status as keyof typeof statusConfig]
                  const Icon = config.icon
                  const isActive = config.step <= currentStatus.step
                  const isCurrent = status === order.status

                  return (
                    <div key={status} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-rose-200" : ""}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p
                        className={`text-xs mt-2 text-center ${isActive ? "text-rose-600 font-medium" : "text-gray-400"}`}
                      >
                        {config.label}
                      </p>
                      {index < 4 && (
                        <div
                          className={`absolute h-1 w-full ${isActive ? "bg-rose-500" : "bg-gray-200"}`}
                          style={{ top: "20px", left: "50%" }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Este pedido ha sido cancelado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Image
                      src={item.productImage || "/placeholder.svg?height=60&width=60"}
                      alt={item.productName}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <div className="mt-1">
                          {Object.entries(item.customizations).map(([key, value]) => (
                            <p key={key} className="text-xs text-gray-400">
                              {key}: {Array.isArray(value) ? value.join(", ") : value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="font-medium">${Number(item.totalPrice).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span>{Number(order.deliveryCost) > 0 ? `$${Number(order.deliveryCost).toFixed(2)}` : "Gratis"}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-rose-600">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Entrega */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {order.deliveryType === "delivery" ? (
                    <>
                      <Truck className="h-5 w-5" />
                      Información de Entrega
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5" />
                      Retiro en Tienda
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{order.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{order.customerPhone}</p>
                  </div>
                </div>
                {order.deliveryType === "delivery" && order.deliveryAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">{order.deliveryAddress}</p>
                      {order.deliveryZone && <p className="text-sm text-gray-500">Zona: {order.deliveryZone}</p>}
                    </div>
                  </div>
                )}
                {order.deliveryType === "pickup" && order.pickupTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Hora de Retiro</p>
                      <p className="font-medium">{order.pickupTime}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>{paymentMethodLabels[order.paymentMethod]}</span>
                  <Badge
                    className={
                      order.paymentStatus === "pagado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.paymentStatus === "pagado" ? "Pagado" : "Pendiente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas del Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/pedidos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Pedidos
            </Button>
          </Link>
          <Link href="/menu">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white">Hacer Otro Pedido</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
