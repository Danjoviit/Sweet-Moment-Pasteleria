# Documentación de API - Momentos Dulces

Este documento describe la estructura de las APIs necesarias para conectar el frontend con el backend Django.

## Configuración

### Variables de Entorno

Configura la siguiente variable de entorno para conectar con tu backend Django:

\`\`\`env
NEXT_PUBLIC_API_URL=http://tu-servidor-django.com
\`\`\`

### Archivo de Configuración

El archivo `lib/api/config.ts` controla la conexión con el backend:

\`\`\`typescript
// Cambia esta URL cuando conectes tu backend Django
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

// Flag para usar datos mock o API real
// Automáticamente usa datos reales cuando NEXT_PUBLIC_API_URL está configurado
export const USE_MOCK_DATA = !process.env.NEXT_PUBLIC_API_URL
\`\`\`

---

## Archivos a Modificar para Conectar con Django

### 1. `lib/api/services.ts`
Este es el archivo principal donde se realizan todas las peticiones HTTP. Cada servicio tiene la estructura:

\`\`\`typescript
if (USE_MOCK_DATA) {
  // Retorna datos de prueba
  return mockData
}
// Realiza petición real al backend
return fetchApi<TipoDeRetorno>("/api/endpoint/")
\`\`\`

### 2. `lib/auth-store.ts`
Contiene las funciones de autenticación que deben conectarse con Django:
- `login()` - POST `/api/auth/login/`
- `register()` - POST `/api/auth/register/`
- `logout()` - POST `/api/auth/logout/`
- `verifySession()` - GET `/api/auth/verify/`
- `recoverPassword()` - POST `/api/auth/recover-password/`
- `resetPassword()` - POST `/api/auth/reset-password/`
- `verifyEmail()` - POST `/api/auth/verify-email/`

---

## Endpoints de la API

### Autenticación (`/api/auth/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| POST | `/api/auth/login/` | Iniciar sesión | `{ email, password }` | `{ user, token }` |
| POST | `/api/auth/register/` | Registrar usuario | `{ name, email, password, phone? }` | `{ user, token }` |
| POST | `/api/auth/logout/` | Cerrar sesión | - | `{ success: true }` |
| GET | `/api/auth/verify/` | Verificar sesión | Header: `Authorization: Bearer {token}` | `{ user }` |
| POST | `/api/auth/recover-password/` | Recuperar contraseña | `{ email }` | `{ success: true }` |
| POST | `/api/auth/reset-password/` | Restablecer contraseña | `{ token, password }` | `{ success: true }` |
| POST | `/api/auth/verify-email/` | Verificar email | `{ token }` | `{ success: true }` |

---

### Categorías (`/api/categories/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/categories/` | Listar todas | - | `Category[]` |
| GET | `/api/categories/{id}/` | Obtener una | - | `Category` |
| POST | `/api/categories/` | Crear | `{ name, slug, description?, image?, isActive }` | `Category` |
| PATCH | `/api/categories/{id}/` | Actualizar | `Partial<Category>` | `Category` |
| DELETE | `/api/categories/{id}/` | Eliminar | - | `204 No Content` |

**Modelo Category:**
\`\`\`typescript
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
}
\`\`\`

---

### Productos (`/api/products/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/products/` | Listar todos | - | `Product[]` |
| GET | `/api/products/?category={id}` | Filtrar por categoría | - | `Product[]` |
| GET | `/api/products/{id}/` | Obtener uno | - | `Product` |
| GET | `/api/products/slug/{slug}/` | Obtener por slug | - | `Product` |
| POST | `/api/products/` | Crear | `Partial<Product>` | `Product` |
| PATCH | `/api/products/{id}/` | Actualizar | `Partial<Product>` | `Product` |
| DELETE | `/api/products/{id}/` | Eliminar | - | `204 No Content` |

**Modelo Product:**
\`\`\`typescript
interface Product {
  id: number
  name: string
  slug: string
  description?: string
  category: string // ID de categoría
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

interface ProductVariant {
  id: number
  type: string
  price: number
  unit?: string
}

interface ProductCustomization {
  id: string
  name: string
  type: "size" | "topping" | "filling" | "glaze" | "doughType" | "portion"
  options: {
    id: string
    name: string
    priceModifier: number
  }[]
}
\`\`\`

---

### Pedidos (`/api/orders/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/orders/` | Listar todos | - | `Order[]` |
| GET | `/api/orders/?status={status}` | Filtrar por estado | - | `Order[]` |
| GET | `/api/orders/?user={userId}` | Filtrar por usuario | - | `Order[]` |
| GET | `/api/orders/{id}/` | Obtener uno | - | `Order` |
| POST | `/api/orders/` | Crear | `Partial<Order>` | `Order` |
| PATCH | `/api/orders/{id}/status/` | Actualizar estado | `{ status }` | `Order` |

**Modelo Order:**
\`\`\`typescript
interface Order {
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

interface OrderItem {
  id: number
  productId: number
  productName: string
  productImage: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: Record<string, string | string[]>
}
\`\`\`

---

### Usuarios (`/api/users/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/users/` | Listar todos | - | `User[]` |
| GET | `/api/users/{id}/` | Obtener uno | - | `User` |
| GET | `/api/users/email/{email}/` | Buscar por email | - | `User` |
| POST | `/api/users/` | Crear | `Partial<User>` | `User` |
| PATCH | `/api/users/{id}/` | Actualizar | `Partial<User>` | `User` |

**Modelo User:**
\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: "usuario" | "recepcionista" | "admin"
  avatar?: string
  addresses?: Address[]
  createdAt: string
}

interface Address {
  id: number
  label: string
  address: string
  zone: string
  isDefault: boolean
}
\`\`\`

---

### Zonas de Delivery (`/api/delivery-zones/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/delivery-zones/` | Listar todas | - | `DeliveryZone[]` |
| GET | `/api/delivery-zones/{id}/` | Obtener una | - | `DeliveryZone` |
| POST | `/api/delivery-zones/` | Crear | `Partial<DeliveryZone>` | `DeliveryZone` |
| PATCH | `/api/delivery-zones/{id}/` | Actualizar | `Partial<DeliveryZone>` | `DeliveryZone` |
| DELETE | `/api/delivery-zones/{id}/` | Eliminar | - | `204 No Content` |

**Modelo DeliveryZone:**
\`\`\`typescript
interface DeliveryZone {
  id: string
  name: string
  price: number
  estimatedTime: string
  isActive: boolean
}
\`\`\`

---

### Promociones (`/api/promotions/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/promotions/` | Listar todas | - | `Promotion[]` |
| GET | `/api/promotions/code/{code}/` | Buscar por código | - | `Promotion` |
| POST | `/api/promotions/` | Crear | `Partial<Promotion>` | `Promotion` |
| PATCH | `/api/promotions/{id}/` | Actualizar | `Partial<Promotion>` | `Promotion` |
| DELETE | `/api/promotions/{id}/` | Eliminar | - | `204 No Content` |

**Modelo Promotion:**
\`\`\`typescript
interface Promotion {
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
\`\`\`

---

### Reseñas (`/api/reviews/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/reviews/` | Listar todas | - | `Review[]` |
| GET | `/api/reviews/?product={id}` | Filtrar por producto | - | `Review[]` |
| GET | `/api/reviews/?user={id}` | Filtrar por usuario | - | `Review[]` |
| POST | `/api/reviews/` | Crear | `Partial<Review>` | `Review` |
| PATCH | `/api/reviews/{id}/` | Actualizar | `Partial<Review>` | `Review` |
| DELETE | `/api/reviews/{id}/` | Eliminar | - | `204 No Content` |

**Modelo Review:**
\`\`\`typescript
interface Review {
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
\`\`\`

---

### Favoritos (`/api/favorites/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/favorites/?user={userId}` | Listar favoritos | - | `number[]` (IDs de productos) |
| POST | `/api/favorites/` | Agregar | `{ userId, productId }` | `201 Created` |
| DELETE | `/api/favorites/{productId}/` | Eliminar | - | `204 No Content` |

---

### Dashboard/Estadísticas (`/api/dashboard/`)

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/api/dashboard/stats/` | Obtener estadísticas | - | `DashboardStats` |

**Modelo DashboardStats:**
\`\`\`typescript
interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  todayRevenue: number
  totalProducts: number
  lowStockProducts: number
  totalUsers: number
  newUsersToday: number
}
\`\`\`

---

## Autenticación

Todas las peticiones autenticadas deben incluir el header:

\`\`\`
Authorization: Bearer {token}
\`\`\`

El token se obtiene al hacer login y debe guardarse en localStorage o cookies.

---

## Ejemplo de Implementación en Django

### `settings.py`
\`\`\`python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://tu-dominio.vercel.app",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
\`\`\`

### `urls.py`
\`\`\`python
from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('authentication.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/users/', include('users.urls')),
    path('api/delivery-zones/', include('delivery_zones.urls')),
    path('api/promotions/', include('promotions.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/favorites/', include('favorites.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
\`\`\`

---

## Cómo Migrar de Mock a API Real

1. Configura la variable de entorno `NEXT_PUBLIC_API_URL`
2. El sistema automáticamente detectará la URL y desactivará los datos mock
3. Asegúrate de que tu backend Django responda en los endpoints documentados
4. Implementa CORS correctamente en Django
5. Configura autenticación JWT

---

## Notas Importantes

- Todos los endpoints deben terminar con `/` (convención de Django REST Framework)
- Las respuestas deben ser en formato JSON
- Los errores deben retornar códigos HTTP apropiados (400, 401, 403, 404, 500)
- Las fechas deben estar en formato ISO 8601 (ej: `2024-01-15T10:30:00Z`)
