export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
}

export interface ProductVariant {
  id: number
  type: string
  price: number
  unit?: string
}

export interface ProductCustomization {
  id: string
  name: string
  type: "size" | "topping" | "filling" | "glaze" | "doughType" | "portion"
  options: {
    id: string
    name: string
    priceModifier: number
  }[]
}

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  category: string
  categoryName?: string
  image: string
  price?: number
  basePrice: number
  variants?: ProductVariant[]
  customizations?: ProductCustomization[]
  stock: number
  isActive: boolean
  discount?: number
  isCombo?: boolean
  unit?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  productImage: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: Record<string, string | string[]>
}

export interface Order {
  id: string
  orderNumber: string
  userId?: number
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  deliveryCost: number
  total: number
  status: "recibido" | "en_preparacion" | "listo" | "en_camino" | "entregado" | "cancelado"
  deliveryType: "delivery" | "pickup"
  deliveryAddress?: string
  deliveryZone?: string
  pickupTime?: string
  paymentMethod: "tarjeta" | "pago_movil" | "efectivo"
  paymentStatus: "pendiente" | "pagado" | "fallido"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: "usuario" | "recepcionista" | "admin"
  avatar?: string
  addresses?: Address[]
  createdAt: string
}

export interface Address {
  id: number
  label: string
  address: string
  zone: string
  isDefault: boolean
}

export interface DeliveryZone {
  id: string
  name: string
  price: number
  estimatedTime: string
  isActive: boolean
}

export interface Promotion {
  id: number
  name: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  code?: string
  validFrom: string
  validUntil: string
  minPurchase?: number
  isActive: boolean
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  todayRevenue: number
  totalProducts: number
  lowStockProducts: number
  totalUsers: number
  newUsersToday: number
}

export interface Review {
  id: number
  userId: number
  userName: string
  userAvatar?: string
  productId: number
  productName: string
  rating: number
  comment: string
  createdAt: string
  isVerifiedPurchase: boolean
}

export interface ExchangeRate {
  id: number
  usdToBs: number
  updatedAt: string
  updatedBy?: {
    id: number
    name: string
    email: string
  }
}

