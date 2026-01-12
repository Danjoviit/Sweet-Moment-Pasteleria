"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Check, CheckCheck, Trash2, Package, Tag, Info, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { useNotificationsStore, type NotificationType } from "@/lib/notifications-store"
import { cn } from "@/lib/utils"

const notificationIcons = {
  order_status: Package,
  promotion: Tag,
  system: Info,
  review: Check,
}

const notificationColors = {
  order_status: "bg-blue-100 text-blue-600",
  promotion: "bg-green-100 text-green-600",
  system: "bg-gray-100 text-gray-600",
  review: "bg-amber-100 text-amber-600",
}

const notificationLabels: Record<NotificationType, string> = {
  order_status: "Pedidos",
  promotion: "Promociones",
  system: "Sistema",
  review: "Reseñas",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function NotificacionesPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotificationsStore()
  const [activeTab, setActiveTab] = useState("all")

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.type === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
              <p className="text-sm text-gray-600">{unreadCount > 0 ? `${unreadCount} sin leer` : "Todas leídas"}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => clearAll()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar todo
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">
              Sin leer
              {unreadCount > 0 && <Badge className="ml-2 bg-rose-500 text-white text-xs">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="order_status">Pedidos</TabsTrigger>
            <TabsTrigger value="promotion">Promociones</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredNotifications.length === 0 ? (
              <Card className="border-rose-100">
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No hay notificaciones</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type]
                  const colorClass = notificationColors[notification.type]

                  return (
                    <Card
                      key={notification.id}
                      className={cn(
                        "border-rose-100 transition-colors",
                        !notification.read && "bg-rose-50/50 border-rose-200",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                              colorClass,
                            )}
                          >
                            <Icon className="h-6 w-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={cn(
                                      "font-semibold",
                                      !notification.read ? "text-gray-900" : "text-gray-700",
                                    )}
                                  >
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <Badge className="bg-rose-500 text-white text-xs">Nueva</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-gray-400">{formatDate(notification.createdAt)}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {notificationLabels[notification.type]}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-rose-600"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-500 hover:text-red-600"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {notification.data?.orderId && (
                              <Link href={`/pedidos/${notification.data.orderId}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                                >
                                  Ver Pedido
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
