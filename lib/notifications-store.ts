import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NotificationType = "order_status" | "promotion" | "system" | "review"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: {
    orderId?: string
    orderStatus?: string
    productId?: number
    promotionCode?: string
  }
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "order_status",
    title: "Pedido en Preparación",
    message: "Tu pedido #ORD-001 está siendo preparado con mucho cariño.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    data: { orderId: "ORD-001", orderStatus: "en_preparacion" },
  },
  {
    id: "notif-2",
    type: "promotion",
    title: "Nueva Promoción Disponible",
    message: "¡5 Cupcakes por solo $20! Usa el código DULCE5.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    data: { promotionCode: "DULCE5" },
  },
  {
    id: "notif-3",
    type: "order_status",
    title: "Pedido Listo",
    message: "Tu pedido #ORD-002 está listo para entrega.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    data: { orderId: "ORD-002", orderStatus: "listo" },
  },
]

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,
      unreadCount: initialNotifications.filter((n) => !n.read).length,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (!notification || notification.read) return state

          return {
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },
    }),
    {
      name: "notifications-storage",
    },
  ),
)

export const createOrderStatusNotification = (
  orderId: string,
  status: string,
): Omit<Notification, "id" | "read" | "createdAt"> => {
  const statusMessages: Record<string, { title: string; message: string }> = {
    recibido: {
      title: "Pedido Recibido",
      message: `Tu pedido #${orderId} ha sido recibido y será procesado pronto.`,
    },
    en_preparacion: {
      title: "Pedido en Preparación",
      message: `Tu pedido #${orderId} está siendo preparado con mucho cariño.`,
    },
    listo: {
      title: "Pedido Listo",
      message: `Tu pedido #${orderId} está listo para entrega o retiro.`,
    },
    en_camino: {
      title: "Pedido en Camino",
      message: `Tu pedido #${orderId} va en camino. ¡Pronto llegará!`,
    },
    entregado: {
      title: "Pedido Entregado",
      message: `Tu pedido #${orderId} ha sido entregado. ¡Gracias por tu compra!`,
    },
    cancelado: {
      title: "Pedido Cancelado",
      message: `Tu pedido #${orderId} ha sido cancelado.`,
    },
  }

  const { title, message } = statusMessages[status] || {
    title: "Actualización de Pedido",
    message: `Tu pedido #${orderId} ha sido actualizado.`,
  }

  return {
    type: "order_status",
    title,
    message,
    data: { orderId, orderStatus: status },
  }
}
