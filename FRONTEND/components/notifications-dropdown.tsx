"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Check, CheckCheck, Package, Tag, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationsStore, type Notification } from "@/lib/notifications-store"
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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Hace un momento"
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`
  return `Hace ${Math.floor(seconds / 86400)} días`
}

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationsStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-rose-500 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-rose-600 hover:text-rose-700 h-auto p-0"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hay notificaciones</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.slice(0, 10).map((notification) => {
              const Icon = notificationIcons[notification.type]
              const colorClass = notificationColors[notification.type]

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0",
                    !notification.read && "bg-rose-50/50",
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn("text-sm", !notification.read ? "font-semibold text-gray-900" : "text-gray-700")}
                      >
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                  </div>

                  {!notification.read && <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0 mt-2" />}
                </div>
              )
            })}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />

        <div className="p-2">
          <Link href="/notificaciones" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50">
              Ver todas las notificaciones
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
