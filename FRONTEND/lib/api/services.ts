import { USE_MOCK_DATA, apiUrl } from "./config"
import {
  mockCategories,
  mockProducts,
  mockOrders,
  mockUsers,
  mockDeliveryZones,
  mockPromotions,
  mockDashboardStats,
} from "./mock-data"
import type { Category, Product, Order, User, DeliveryZone, Promotion, DashboardStats, Review } from "./types"

// Helper para hacer peticiones HTTP
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Obtener token desde localStorage (si está en el cliente)
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(apiUrl(endpoint), {
    headers: {
      ...defaultHeaders,
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  // Check if response has content before parsing JSON
  const contentType = response.headers.get("content-type")
  const contentLength = response.headers.get("content-length")

  // If no content or empty response (like 204 No Content), return null
  if (!contentType || contentLength === "0" || response.status === 204) {
    return null as T
  }

  return response.json()
}

// ==================== CATEGORÍAS ====================
export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    if (USE_MOCK_DATA) return mockCategories
    return fetchApi<Category[]>("/categories/")
  },

  getById: async (id: string): Promise<Category | undefined> => {
    if (USE_MOCK_DATA) return mockCategories.find((c) => c.id === id)
    return fetchApi<Category>(`/categories/${id}/`)
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    if (USE_MOCK_DATA) {
      const newCategory = { ...data, id: Date.now().toString() } as Category
      mockCategories.push(newCategory)
      return newCategory
    }
    return fetchApi<Category>("/categories/", { method: "POST", body: JSON.stringify(data) })
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    if (USE_MOCK_DATA) {
      const index = mockCategories.findIndex((c) => c.id === id)
      if (index !== -1) mockCategories[index] = { ...mockCategories[index], ...data }
      return mockCategories[index]
    }
    return fetchApi<Category>(`/categories/${id}/`, { method: "PATCH", body: JSON.stringify(data) })
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      const index = mockCategories.findIndex((c) => c.id === id)
      if (index !== -1) mockCategories.splice(index, 1)
      return
    }
    await fetchApi(`/categories/${id}/`, { method: "DELETE" })
  },
}

// ==================== PRODUCTOS ====================
export const productsService = {
  getAll: async (): Promise<Product[]> => {
    if (USE_MOCK_DATA) return mockProducts.filter((p) => p.isActive)
    const response = await fetchApi<any>("/products/")
    if (response && response.results && Array.isArray(response.results)) {
      return response.results
    }
    return Array.isArray(response) ? response : []
  },

  getByCategory: async (categoryId: string): Promise<Product[]> => {
    if (USE_MOCK_DATA) return mockProducts.filter((p) => p.category === categoryId && p.isActive)
    return fetchApi<Product[]>(`/products/?category=${categoryId}`)
  },

  getById: async (id: number): Promise<Product | undefined> => {
    if (USE_MOCK_DATA) return mockProducts.find((p) => p.id === id)
    return fetchApi<Product>(`/products/${id}/`)
  },

  getBySlug: async (slug: string): Promise<Product | undefined> => {
    if (USE_MOCK_DATA) return mockProducts.find((p) => p.slug === slug)
    return fetchApi<Product>(`/products/slug/${slug}/`)
  },

  create: async (data: Partial<Product> | FormData): Promise<Product> => {
    if (USE_MOCK_DATA) {
      const newProduct = { ...data, id: Date.now(), isActive: true } as Product
      mockProducts.push(newProduct)
      return newProduct
    }

    // Si es FormData, no agregar Content-Type (el browser lo hace automáticamente con boundary)
    const isFormData = data instanceof FormData
    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null

    const headers: Record<string, string> = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    if (!isFormData) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(apiUrl("/products/"), {
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  },

  update: async (id: number, data: Partial<Product> | FormData): Promise<Product> => {
    if (USE_MOCK_DATA) {
      const index = mockProducts.findIndex((p) => p.id === id)
      if (index !== -1) mockProducts[index] = { ...mockProducts[index], ...data }
      return mockProducts[index]
    }

    // Si es FormData, no agregar Content-Type
    const isFormData = data instanceof FormData
    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null

    const headers: Record<string, string> = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    if (!isFormData) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(apiUrl(`/products/${id}/`), {
      method: "PATCH",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  },

  updateStock: async (id: number, stock: number): Promise<Product> => {
    return productsService.update(id, { stock })
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      const index = mockProducts.findIndex((p) => p.id === id)
      if (index !== -1) mockProducts.splice(index, 1)
      return
    }
    await fetchApi(`/products/${id}/`, { method: "DELETE" })
  },
}

// ==================== PEDIDOS ====================
export const ordersService = {
  getAll: async (): Promise<Order[]> => {
    if (USE_MOCK_DATA) return mockOrders
    const response = await fetchApi<any>("/orders/")
    if (response && response.results && Array.isArray(response.results)) {
      return response.results
    }
    return Array.isArray(response) ? response : []
  },

  getByStatus: async (status: Order["status"]): Promise<Order[]> => {
    if (USE_MOCK_DATA) return mockOrders.filter((o) => o.status === status)
    return fetchApi<Order[]>(`/orders/?status=${status}`)
  },

  getByUser: async (userId: number): Promise<Order[]> => {
    if (USE_MOCK_DATA) return mockOrders.filter((o) => o.userId === userId)
    return fetchApi<Order[]>(`/orders/?user=${userId}`)
  },

  getById: async (id: string): Promise<Order | undefined> => {
    if (USE_MOCK_DATA) return mockOrders.find((o) => o.id === id)
    return fetchApi<Order>(`/orders/${id}/`)
  },

  create: async (data: Partial<Order>): Promise<Order> => {
    if (USE_MOCK_DATA) {
      const newOrder = {
        ...data,
        id: Date.now().toString(),
        orderNumber: `ORD-${String(mockOrders.length + 1).padStart(3, "0")}`,
        status: "recibido",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Order
      mockOrders.push(newOrder)
      return newOrder
    }
    return fetchApi<Order>("/orders/", { method: "POST", body: JSON.stringify(data) })
  },

  updateStatus: async (id: string, status: Order["status"]): Promise<Order> => {
    if (USE_MOCK_DATA) {
      const index = mockOrders.findIndex((o) => o.id === id)
      if (index !== -1) {
        mockOrders[index] = { ...mockOrders[index], status, updatedAt: new Date().toISOString() }
      }
      return mockOrders[index]
    }
    return fetchApi<Order>(`/orders/${id}/status/`, { method: "PATCH", body: JSON.stringify({ status }) })
  },

  cancel: async (id: string): Promise<Order> => {
    return ordersService.updateStatus(id, "cancelado")
  },
}

// ==================== USUARIOS ====================
export const usersService = {
  getAll: async (): Promise<User[]> => {
    if (USE_MOCK_DATA) return mockUsers
    const response = await fetchApi<any>("/users/")
    // Handle paginated response structure from Django Rest Framework
    if (response && response.results && Array.isArray(response.results)) {
      return response.results
    }
    // Handle direct array response (if pagination is disabled)
    return Array.isArray(response) ? response : []
  },

  getById: async (id: number): Promise<User | undefined> => {
    if (USE_MOCK_DATA) return mockUsers.find((u) => u.id === id)
    return fetchApi<User>(`/users/${id}/`)
  },

  getByEmail: async (email: string): Promise<User | undefined> => {
    if (USE_MOCK_DATA) return mockUsers.find((u) => u.email === email)
    return fetchApi<User>(`/users/email/${email}/`)
  },

  create: async (data: Partial<User>): Promise<User> => {
    if (USE_MOCK_DATA) {
      const newUser = { ...data, id: Date.now(), createdAt: new Date().toISOString() } as User
      mockUsers.push(newUser)
      return newUser
    }
    return fetchApi<User>("/users/", { method: "POST", body: JSON.stringify(data) })
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    if (USE_MOCK_DATA) {
      const index = mockUsers.findIndex((u) => u.id === id)
      if (index !== -1) mockUsers[index] = { ...mockUsers[index], ...data }
      return mockUsers[index]
    }
    return fetchApi<User>(`/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) })
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      const index = mockUsers.findIndex((u) => u.id === id)
      if (index !== -1) mockUsers.splice(index, 1)
      return
    }
    await fetchApi(`/users/${id}/`, { method: "DELETE" })
  },
}

// ==================== ZONAS DE DELIVERY ====================
export const deliveryZonesService = {
  getAll: async (): Promise<DeliveryZone[]> => {
    if (USE_MOCK_DATA) return mockDeliveryZones.filter((z) => z.isActive)
    const response = await fetchApi<any>("/delivery-zones/")
    if (response && response.results && Array.isArray(response.results)) {
      return response.results
    }
    return Array.isArray(response) ? response : []
  },

  getById: async (id: string): Promise<DeliveryZone | undefined> => {
    if (USE_MOCK_DATA) return mockDeliveryZones.find((z) => z.id === id)
    return fetchApi<DeliveryZone>(`/delivery-zones/${id}/`)
  },

  create: async (data: Partial<DeliveryZone>): Promise<DeliveryZone> => {
    if (USE_MOCK_DATA) {
      const newZone = { ...data, id: Date.now().toString(), isActive: true } as DeliveryZone
      mockDeliveryZones.push(newZone)
      return newZone
    }
    return fetchApi<DeliveryZone>("/delivery-zones/", { method: "POST", body: JSON.stringify(data) })
  },

  update: async (id: number, data: Partial<DeliveryZone>): Promise<DeliveryZone> => {
    if (USE_MOCK_DATA) {
      const index = mockDeliveryZones.findIndex((z) => z.id === id.toString())
      if (index !== -1) mockDeliveryZones[index] = { ...mockDeliveryZones[index], ...data }
      return mockDeliveryZones[index]
    }
    return fetchApi<DeliveryZone>(`/delivery-zones/${id}/`, { method: "PATCH", body: JSON.stringify(data) })
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      const index = mockDeliveryZones.findIndex((z) => z.id === id.toString())
      if (index !== -1) mockDeliveryZones.splice(index, 1)
      return
    }
    await fetchApi(`/delivery-zones/${id}/`, { method: "DELETE" })
  },
}

// ==================== PROMOCIONES ====================
export const promotionsService = {
  getAll: async (): Promise<Promotion[]> => {
    if (USE_MOCK_DATA) return mockPromotions.filter((p) => p.isActive)
    const response = await fetchApi<any>("/promotions/")
    if (response && response.results && Array.isArray(response.results)) {
      return response.results
    }
    return Array.isArray(response) ? response : []
  },

  getByCode: async (code: string): Promise<Promotion | undefined> => {
    if (USE_MOCK_DATA) return mockPromotions.find((p) => p.code === code && p.isActive)
    return fetchApi<Promotion>(`/promotions/code/${code}/`)
  },

  create: async (data: Partial<Promotion>): Promise<Promotion> => {
    if (USE_MOCK_DATA) {
      const newPromo = { ...data, id: Date.now(), isActive: true } as Promotion
      mockPromotions.push(newPromo)
      return newPromo
    }
    return fetchApi<Promotion>("/promotions/", { method: "POST", body: JSON.stringify(data) })
  },

  update: async (id: number, data: Partial<Promotion>): Promise<Promotion> => {
    if (USE_MOCK_DATA) {
      const index = mockPromotions.findIndex((p) => p.id === id)
      if (index !== -1) mockPromotions[index] = { ...mockPromotions[index], ...data }
      return mockPromotions[index]
    }
    return fetchApi<Promotion>(`/promotions/${id}/`, { method: "PATCH", body: JSON.stringify(data) })
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      const index = mockPromotions.findIndex((p) => p.id === id)
      if (index !== -1) mockPromotions.splice(index, 1)
      return
    }
    await fetchApi(`/promotions/${id}/`, { method: "DELETE" })
  },
}

// ==================== DASHBOARD/STATS ====================
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK_DATA) return mockDashboardStats
    const response = await fetchApi<DashboardStats>("/dashboard/stats/")
    return response
  },
}

const mockReviews: Review[] = [
  {
    id: 1,
    userId: 1,
    userName: "Juan Pérez",
    productId: 1,
    productName: "Torta de Chocolate",
    rating: 5,
    comment: "Excelente torta, muy fresca y deliciosa. La recomiendo totalmente.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isVerifiedPurchase: true,
  },
  {
    id: 2,
    userId: 1,
    userName: "Juan Pérez",
    productId: 3,
    productName: "Cupcakes de Vainilla",
    rating: 4,
    comment: "Muy buenos cupcakes, aunque podrían tener un poco más de decoración.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isVerifiedPurchase: true,
  },
]

// ==================== RESEÑAS ====================
export const reviewsService = {
  getAll: async (): Promise<Review[]> => {
    if (USE_MOCK_DATA) return mockReviews
    return fetchApi<Review[]>("/reviews/")
  },

  getByProduct: async (productId: number): Promise<Review[]> => {
    if (USE_MOCK_DATA) return mockReviews.filter((r) => r.productId === productId)
    return fetchApi<Review[]>(`/reviews/?product=${productId}`)
  },

  getByUser: async (userId: number): Promise<Review[]> => {
    if (USE_MOCK_DATA) return mockReviews.filter((r) => r.userId === userId)
    return fetchApi<Review[]>(`/reviews/?user=${userId}`)
  },

  create: async (data: Partial<Review>): Promise<Review> => {
    if (USE_MOCK_DATA) {
      const newReview = {
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        isVerifiedPurchase: true,
      } as Review
      mockReviews.push(newReview)
      return newReview
    }
    return fetchApi<Review>("/reviews/", { method: "POST", body: JSON.stringify(data) })
  },

  update: async (id: number, data: Partial<Review>): Promise<Review> => {
    if (USE_MOCK_DATA) {
      const index = mockReviews.findIndex((r) => r.id === id)
      if (index !== -1) mockReviews[index] = { ...mockReviews[index], ...data }
      return mockReviews[index]
    }
    return fetchApi<Review>(`/reviews/${id}/`, { method: "PATCH", body: JSON.stringify(data) })
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      const index = mockReviews.findIndex((r) => r.id === id)
      if (index !== -1) mockReviews.splice(index, 1)
      return
    }
    await fetchApi(`/reviews/${id}/`, { method: "DELETE" })
  },
}

// ==================== FAVORITOS ====================
export const favoritesService = {
  getByUser: async (userId: number): Promise<number[]> => {
    if (USE_MOCK_DATA) {
      // Retorna IDs de productos favoritos del usuario mock
      return [1, 3, 5]
    }
    return fetchApi<number[]>(`/favorites/?user=${userId}`)
  },

  add: async (userId: number, productId: number): Promise<void> => {
    if (USE_MOCK_DATA) return
    await fetchApi("/favorites/", { method: "POST", body: JSON.stringify({ userId, productId }) })
  },

  remove: async (userId: number, productId: number): Promise<void> => {
    if (USE_MOCK_DATA) return
    await fetchApi(`/favorites/${productId}/`, { method: "DELETE" })
  },
}

// ==================== EXCHANGE RATE ====================
export const exchangeRateService = {
  get: async (): Promise<import("./types").ExchangeRate> => {
    return fetchApi<import("./types").ExchangeRate>("/exchange-rate/")
  },

  update: async (usdToBs: number): Promise<import("./types").ExchangeRate> => {
    return fetchApi<import("./types").ExchangeRate>("/exchange-rate/update/", {
      method: "PATCH",
      body: JSON.stringify({ usdToBs }),
    })
  },
}

