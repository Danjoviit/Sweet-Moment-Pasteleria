
# API Payloads (Momentos Dulces)

Este documento lista los endpoints usados por el frontend y ejemplos de payloads esperados, inferidos desde `lib/api/services.ts` y `lib/api/types.ts`. Úsalos como referencia para implementar las APIs en Django.

## Formato del documento

- `Path`: ruta del endpoint.
- `Methods`: métodos HTTP soportados.
- `Request (ejemplo)`: cuerpo esperado para ese método (si aplica).
- `Response (shape breve)`: campos principales que devuelve (basado en `lib/api/types.ts`).

---

## Categorías

- Path: `/api/categories/`
  - Methods: GET, POST
  - GET Request: ninguno
  - GET Response: `Category[]` (cada Category: `id, name, slug, description?, image?, isActive`)
  - POST Request (ejemplo):

```json
{
  "name": "Pasteles",
  "slug": "pasteles",
  "description": "Tortas y pasteles",
  "image": "https://.../pastel.jpg",
  "isActive": true
}
```
  - POST Response: `Category` (objeto creado)

- Path: `/api/categories/{id}/`
  - Methods: GET, PATCH, DELETE
  - GET Request: ninguno
  - GET Response: `Category`
  - PATCH Request (ejemplo): `{ "name": "Nuevo nombre" }` (Partial<Category>)
  - PATCH Response: `Category` (actualizado)
  - DELETE Request: ninguno
  - DELETE Response: 204 No Content

---

## Productos

- Path: `/api/products/`
  - Methods: GET, POST
  - GET Request: ninguno (opcional: query `?category=...` o filtros)
  - GET Response: `Product[]` (ver `lib/api/types.ts`)
  - POST Request (ejemplo Partial<Product>):

```json
{
  "name": "Torta de Chocolate",
  "slug": "torta-chocolate",
  "description": "Torta grande de chocolate",
  "category": "pasteles",
  "image": "https://.../torta.jpg",
  "basePrice": 25.0,
  "price": 25.0,
  "stock": 10,
  "isActive": true,
  "variants": [{ "id": 1, "type": "grande", "price": 40, "unit": "unidad" }]
}
```
  - POST Response: `Product` (creado)

- Path: `/api/products/{id}/`
  - Methods: GET, PATCH, DELETE
  - GET Response: `Product`
  - PATCH Request (ej.): `{ "stock": 5 }` (Partial<Product>)
  - DELETE Response: 204 No Content

- Path: `/api/products/slug/{slug}/`
  - Methods: GET
  - GET Response: `Product`

---

## Pedidos (Orders)

- Path: `/api/orders/`
  - Methods: GET, POST
  - GET Request: ninguno (opcional: `?status=...`, `?user=...`)
  - GET Response: `Order[]` (ver `lib/api/types.ts`)
  - POST Request (ejemplo Partial<Order>):

```json
{
  "userId": 123,
  "customerName": "María Pérez",
  "customerEmail": "maria@example.com",
  "customerPhone": "+58 412-000-0000",
  "items": [
    {
      "productId": 1,
      "productName": "Torta de Chocolate",
      "productImage": "https://.../torta.jpg",
      "quantity": 1,
      "unitPrice": 25.0,
      "totalPrice": 25.0,
      "customizations": { "size": "grande" }
    }
  ],
  "subtotal": 25.0,
  "deliveryCost": 5.0,
  "total": 30.0,
  "deliveryType": "delivery",
  "deliveryAddress": "Calle Falsa 123",
  "deliveryZone": "zona-1",
  "paymentMethod": "efectivo",
  "notes": "Por favor dejar en portería"
}
```
  - POST Response: `Order` (creado)

- Path: `/api/orders/{id}/`
  - Methods: GET
  - GET Response: `Order`

- Path: `/api/orders/{id}/status/`
  - Methods: PATCH
  - PATCH Request (ejemplo): `{ "status": "en_preparacion" }`
  - PATCH Response: `Order` (con nuevo `status`)

---

## Usuarios / Autenticación

- Path: `/auth/login/`
  - Methods: POST
  - POST Request:

```json
{ "email": "user@example.com", "password": "password123" }
```
  - POST Response: `{ "token": "...", "user": User }` (según `auth-store` espera `data.token` y `data.user`)

- Path: `/auth/register/`
  - Methods: POST
  - POST Request (RegisterData):

```json
{ "name": "Usuario", "email": "u@example.com", "password": "pass123", "phone": "+58...", "role": "usuario" }
```
  - POST Response: 201 Created (datos de usuario o mensaje)

- Path: `/auth/me/`
  - Methods: GET
  - GET Response: `{ "user": User }` (si hay sesión)

- Path: `/auth/logout/`
  - Methods: POST
  - POST Request: ninguno

- Path: `/auth/profile/`
  - Methods: PATCH
  - PATCH Request (ejemplo parcial): `{ "name": "Nuevo Nombre", "phone": "+58..." }`
  - PATCH Response: `User` (actualizado)

- Path: `/auth/password-reset/`
  - Methods: POST
  - POST Request: `{ "email": "user@example.com" }`

- Path: `/auth/password-reset/confirm/`
  - Methods: POST
  - POST Request: `{ "token": "...", "new_password": "nuevaPass123" }`

- Path: `/auth/verify-email/`
  - Methods: POST
  - POST Request: `{ "token": "..." }`

- Path: `/auth/resend-verification/`
  - Methods: POST
  - POST Request: ninguno

---

## Direcciones (Auth Addresses)

- Path: `/auth/addresses/`
  - Methods: POST
  - POST Request (ejemplo):

```json
{ "label": "Casa", "address": "Calle Falsa 123", "zone": "zona-1", "isDefault": true }
```
  - POST Response: Address (creada)

- Path: `/auth/addresses/{id}/`
  - Methods: PATCH, DELETE
  - PATCH Request: campos parciales de dirección
  - DELETE Request: ninguno

---

## Favoritos

- Path: `/api/favorites/`
  - Methods: GET (por query `?user=`), POST
  - GET Response: `number[]` (IDs de productos favoritos)
  - POST Request (desde `services` ejemplo): `{ "userId": 123, "productId": 45 }`
  - POST Request (desde `auth-store` ejemplo para auth-favorites): `{ "product_id": 45 }` (nota: claves distintas)

- Path: `/api/favorites/{productId}/`
  - Methods: DELETE
  - DELETE Request: ninguno

---

## Zonas de delivery

- Path: `/api/delivery-zones/`
  - Methods: GET
  - GET Response: `DeliveryZone[]` (`id, name, price, estimatedTime, isActive`)

- Path: `/api/delivery-zones/{id}/`
  - Methods: GET

---

## Promociones

- Path: `/api/promotions/`
  - Methods: GET
  - GET Response: `Promotion[]`

- Path: `/api/promotions/code/{code}/`
  - Methods: GET

---

## Dashboard / Stats

- Path: `/api/dashboard/stats/`
  - Methods: GET
  - GET Response: `DashboardStats` (`totalOrders, pendingOrders, totalRevenue, ...`)

---

## Reseñas (Reviews)

- Path: `/api/reviews/`
  - Methods: GET, POST
  - GET Response: `Review[]`
  - POST Request (ejemplo):

```json
{
  "userId": 1,
  "userName": "Juan Pérez",
  "productId": 1,
  "rating": 5,
  "comment": "Excelente producto"
}
```

- Path: `/api/reviews/{id}/`
  - Methods: PATCH, DELETE
  - PATCH Request: Partial<Review>

---

## Email (servicio externo: EmailJS)

- Endpoint: `https://api.emailjs.com/api/v1.0/email/send`
  - Methods: POST
  - POST Request (según `app/actions/email.ts`):

```json
{
  "service_id": "service_momentos",
  "template_id": "template_reset",
  "user_id": "PUBLIC_KEY",
  "accessToken": "PRIVATE_KEY",
  "template_params": {
    "to_email": "destino@example.com",
    "to_name": "Nombre",
    "reset_link": "https://...",
    "app_name": "Momentos Dulces"
  }
}
```

---

## Observaciones y ambigüedades detectadas

- En `favorites` hay dos formatos: `/api/favorites/` espera `{ userId, productId }` según `services`, mientras que `/auth/favorites/` usa `{ product_id }` en `auth-store`. Hay que unificar en backend.
- Verificar si `POST /api/favorites/` requiere autenticación o `userId` en el cuerpo.
- Confirmar respuesta exacta de `/auth/register/` (si devuelve `user` y/o `token`). El frontend asume `await apiRequest("/auth/register/", { method: 'POST', body: JSON.stringify(data) })` sin usar el retorno; sin embargo `login` sí espera `data.token` y `data.user`.

---

Referencias:
- `lib/api/services.ts` — implementación centralizada de llamadas a API.
- `lib/api/types.ts` — definiciones de tipos / shape de los objetos.

Si quieres, puedo:
- generar serializers o modelos Django (DRF) basados en estos tipos, o
- exportar este archivo a otro formato (OpenAPI/JSON Schema) para scaffolding.

---

## Request JSON por endpoint (detallado)

Aquí se muestra, para cada endpoint y cada método HTTP soportado, el JSON exacto (o ejemplo) que acepta el backend según el frontend. Para los GET se indican parámetros de query cuando aplican; por convención los GET no envían body.

1) `/api/categories/`
  - GET: no acepta body. Ejemplo query: ninguno.
  - POST: body (JSON):

```json
{
  "name": "Pasteles",
  "slug": "pasteles",
  "description": "Tortas y pasteles",
  "image": "https://.../pastel.jpg",
  "isActive": true
}
```

2) `/api/categories/{id}/`
  - GET: no acepta body.
  - PATCH: body (JSON parcial):

```json
{ "name": "Nuevo nombre" }
```
  - DELETE: no acepta body.

3) `/api/products/`
  - GET: no acepta body. Query example: `?category={categoryId}`
  - POST: body (JSON parcial):

```json
{
  "name": "Torta de Chocolate",
  "slug": "torta-chocolate",
  "description": "Torta grande de chocolate",
  "category": "pasteles",
  "image": "https://.../torta.jpg",
  "basePrice": 25.0,
  "price": 25.0,
  "stock": 10,
  "isActive": true,
  "variants": [ { "id": 1, "type": "grande", "price": 40, "unit": "unidad" } ]
}
```

4) `/api/products/{id}/`
  - GET: no acepta body.
  - PATCH: body (JSON parcial):

```json
{ "stock": 5 }
```
  - DELETE: no acepta body.

5) `/api/products/slug/{slug}/`
  - GET: no acepta body.

6) `/api/orders/`
  - GET: no acepta body. Query examples: `?status=en_preparacion`, `?user=123`.
  - POST: body (JSON parcial):

```json
{
  "userId": 123,
  "customerName": "María Pérez",
  "customerEmail": "maria@example.com",
  "customerPhone": "+58 412-000-0000",
  "items": [
    {
      "productId": 1,
      "productName": "Torta de Chocolate",
      "productImage": "https://.../torta.jpg",
      "quantity": 1,
      "unitPrice": 25.0,
      "totalPrice": 25.0,
      "customizations": { "size": "grande" }
    }
  ],
  "subtotal": 25.0,
  "deliveryCost": 5.0,
  "total": 30.0,
  "deliveryType": "delivery",
  "deliveryAddress": "Calle Falsa 123",
  "deliveryZone": "zona-1",
  "paymentMethod": "efectivo",
  "notes": "Por favor dejar en portería"
}
```

7) `/api/orders/{id}/`
  - GET: no acepta body.

8) `/api/orders/{id}/status/`
  - PATCH: body (JSON):

```json
{ "status": "en_preparacion" }
```

9) `/auth/login/`
  - POST: body (JSON):

```json
{ "email": "user@example.com", "password": "password123" }
```

10) `/auth/register/`
  - POST: body (JSON):

```json
{ "name": "Usuario", "email": "u@example.com", "password": "pass123", "phone": "+58...", "role": "usuario" }
```

11) `/auth/me/`
  - GET: no acepta body.

12) `/auth/logout/`
  - POST: no acepta body.

13) `/auth/profile/`
  - PATCH: body (JSON parcial):

```json
{ "name": "Nuevo Nombre", "phone": "+58 412-000-0000" }
```

14) `/auth/password-reset/`
  - POST: body (JSON):

```json
{ "email": "user@example.com" }
```

15) `/auth/password-reset/confirm/`
  - POST: body (JSON):

```json
{ "token": "TOKEN_GENERADO", "new_password": "nuevaPass123" }
```

16) `/auth/verify-email/`
  - POST: body (JSON):

```json
{ "token": "TOKEN_DE_VERIFICACION" }
```

17) `/auth/resend-verification/`
  - POST: no acepta body.

18) `/auth/addresses/`
  - POST: body (JSON):

```json
{ "label": "Casa", "address": "Calle Falsa 123", "zone": "zona-1", "isDefault": true }
```

19) `/auth/addresses/{id}/`
  - PATCH: body (JSON parcial):

```json
{ "label": "Trabajo", "isDefault": false }
```
  - DELETE: no acepta body.

20) `/api/favorites/`
  - GET: no acepta body. Query example: `?user=123` (devuelve array de IDs)
  - POST: body (dos formatos observados en frontend):

Formato A (desde `services`):
```json
{ "userId": 123, "productId": 45 }
```

Formato B (desde `auth-store` / auth endpoints):
```json
{ "product_id": 45 }
```

21) `/api/favorites/{productId}/`
  - DELETE: no acepta body.

22) `/api/delivery-zones/`
  - GET: no acepta body.

23) `/api/delivery-zones/{id}/`
  - GET: no acepta body.

24) `/api/promotions/`
  - GET: no acepta body.

25) `/api/promotions/code/{code}/`
  - GET: no acepta body.

26) `/api/dashboard/stats/`
  - GET: no acepta body.

27) `/api/reviews/`
  - GET: no acepta body. Query examples: `?product=1`, `?user=1`.
  - POST: body (JSON):

```json
{
  "userId": 1,
  "userName": "Juan Pérez",
  "productId": 1,
  "rating": 5,
  "comment": "Excelente producto"
}
```

28) `/api/reviews/{id}/`
  - PATCH: body (JSON parcial): `{ "rating": 4, "comment": "Actualizado" }`
  - DELETE: no acepta body.

29) EmailJS externo `https://api.emailjs.com/api/v1.0/email/send`
  - POST: body (JSON):

```json
{
  "service_id": "service_momentos",
  "template_id": "template_reset",
  "user_id": "PUBLIC_KEY",
  "accessToken": "PRIVATE_KEY",
  "template_params": {
    "to_email": "destino@example.com",
    "to_name": "Nombre",
    "reset_link": "https://...",
    "app_name": "Momentos Dulces"
  }
}
```

---

Si quieres que además genere un archivo JSON con todos estos bodies (por ejemplo `docs/api-request-examples.json`) o que convierta esto a un esquema OpenAPI/JSON Schema para cada endpoint, lo puedo generar ahora.
