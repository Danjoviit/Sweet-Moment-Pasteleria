# Documentación de API - Momentos Dulces

Este documento describe todos los endpoints de la API que necesitas implementar en Django para conectar con el frontend.

---

## Configuración Base

### 1. URL Base de la API

El frontend busca la URL de la API en la variable de entorno:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

### 2. Archivo de Configuración

La configuración de la API está en: `lib/api/config.ts`

\`\`\`typescript
// Cambia esta URL cuando conectes tu backend Django
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

// Flag para usar datos mock o API real
// Cuando NEXT_PUBLIC_API_URL está definida, usa la API real
export const USE_MOCK_DATA = !process.env.NEXT_PUBLIC_API_URL
\`\`\`

### 3. Dónde están los Fetch

Todos los fetch están centralizados en: `lib/api/services.ts`

La función principal que hace las peticiones HTTP es:

\`\`\`typescript
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(endpoint), {
    headers: {
      "Content-Type": "application/json",
      // Aquí puedes agregar headers de autenticación
      // "Authorization": `Bearer ${getToken()}`,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}
\`\`\`

---

## Endpoints Requeridos

### Autenticación

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/login/` | Iniciar sesión | `{ email, password }` |
| POST | `/api/auth/register/` | Registrar usuario | `{ name, email, password, phone }` |
| POST | `/api/auth/logout/` | Cerrar sesión | - |
| GET | `/api/auth/me/` | Obtener usuario actual | - |
| POST | `/api/auth/password-reset/` | Solicitar reset de contraseña | `{ email }` |
| POST | `/api/auth/password-reset/confirm/` | Confirmar reset | `{ token, new_password }` |
| POST | `/api/auth/verify-email/` | Verificar email | `{ token }` |

### Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories/` | Listar categorías |
| GET | `/api/categories/{id}/` | Obtener categoría |
| POST | `/api/categories/` | Crear categoría |
| PATCH | `/api/categories/{id}/` | Actualizar categoría |
| DELETE | `/api/categories/{id}/` | Eliminar categoría |

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products/` | Listar productos |
| GET | `/api/products/?category={id}` | Filtrar por categoría |
| GET | `/api/products/{id}/` | Obtener producto por ID |
| GET | `/api/products/slug/{slug}/` | Obtener producto por slug |
| POST | `/api/products/` | Crear producto |
| PATCH | `/api/products/{id}/` | Actualizar producto |
| DELETE | `/api/products/{id}/` | Eliminar producto |

### Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/orders/` | Listar pedidos |
| GET | `/api/orders/?status={status}` | Filtrar por estado |
| GET | `/api/orders/?user={userId}` | Filtrar por usuario |
| GET | `/api/orders/{id}/` | Obtener pedido |
| POST | `/api/orders/` | Crear pedido |
| PATCH | `/api/orders/{id}/status/` | Actualizar estado |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/` | Listar usuarios |
| GET | `/api/users/{id}/` | Obtener usuario |
| GET | `/api/users/email/{email}/` | Buscar por email |
| POST | `/api/users/` | Crear usuario |
| PATCH | `/api/users/{id}/` | Actualizar usuario |

### Zonas de Delivery

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/delivery-zones/` | Listar zonas |
| GET | `/api/delivery-zones/{id}/` | Obtener zona |
| POST | `/api/delivery-zones/` | Crear zona |
| PATCH | `/api/delivery-zones/{id}/` | Actualizar zona |
| DELETE | `/api/delivery-zones/{id}/` | Eliminar zona |

### Promociones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/promotions/` | Listar promociones |
| GET | `/api/promotions/code/{code}/` | Buscar por código |
| POST | `/api/promotions/` | Crear promoción |
| PATCH | `/api/promotions/{id}/` | Actualizar promoción |
| DELETE | `/api/promotions/{id}/` | Eliminar promoción |

### Reseñas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reviews/` | Listar reseñas |
| GET | `/api/reviews/?product={id}` | Filtrar por producto |
| GET | `/api/reviews/?user={id}` | Filtrar por usuario |
| POST | `/api/reviews/` | Crear reseña |
| PATCH | `/api/reviews/{id}/` | Actualizar reseña |
| DELETE | `/api/reviews/{id}/` | Eliminar reseña |

### Favoritos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/favorites/?user={id}` | Obtener favoritos del usuario |
| POST | `/api/favorites/` | Agregar favorito |
| DELETE | `/api/favorites/{productId}/` | Eliminar favorito |

### Dashboard (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/stats/` | Obtener estadísticas |

### Notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications/?user={id}` | Obtener notificaciones |
| PATCH | `/api/notifications/{id}/read/` | Marcar como leída |
| POST | `/api/notifications/mark-all-read/` | Marcar todas como leídas |

---

## Formato de Respuestas

### Respuesta Exitosa

\`\`\`json
{
  "id": 1,
  "name": "Torta de Chocolate",
  "price": 100,
  // ... otros campos
}
\`\`\`

### Lista de Elementos

\`\`\`json
[
  { "id": 1, "name": "Torta de Chocolate" },
  { "id": 2, "name": "Brownie" }
]
\`\`\`

### Error

\`\`\`json
{
  "error": "Mensaje de error",
  "code": "ERROR_CODE"
}
\`\`\`

---

## Ejemplo de ViewSet en Django

\`\`\`python
# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset

    @action(detail=False, methods=['get'], url_path='slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        try:
            product = Product.objects.get(slug=slug)
            serializer = self.get_serializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
\`\`\`

\`\`\`python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
\`\`\`

---

## CORS Configuration

Agrega en tu Django:

\`\`\`python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... otros middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://tu-dominio.vercel.app",
]

# O para desarrollo:
CORS_ALLOW_ALL_ORIGINS = True
\`\`\`

---

## Pasos para Conectar

1. **Configura la variable de entorno**:
   \`\`\`env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   \`\`\`

2. **Implementa los endpoints** según esta documentación

3. **El frontend automáticamente** dejará de usar datos mock y usará tu API

4. **Para autenticación**, modifica el header en `lib/api/services.ts`:
   \`\`\`typescript
   headers: {
     "Content-Type": "application/json",
     "Authorization": `Bearer ${getToken()}`,
   },
