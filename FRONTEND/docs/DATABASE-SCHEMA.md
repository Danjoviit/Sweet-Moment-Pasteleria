# Esquema de Base de Datos - Momentos Dulces

Este documento describe la estructura de la base de datos que necesitas crear en Django para el sistema Sweet Moment

---

## Modelos de Django

### 1. Category (Categoría)

\`\`\`python
# models.py
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name
\`\`\`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | AutoField | ID único (generado automáticamente) |
| name | CharField(100) | Nombre de la categoría |
| slug | SlugField | Slug para URLs (único) |
| description | TextField | Descripción (opcional) |
| image | ImageField | Imagen de la categoría |
| is_active | BooleanField | Si está activa |
| created_at | DateTimeField | Fecha de creación |
| updated_at | DateTimeField | Última actualización |

---

### 2. Product (Producto)

\`\`\`python
class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    image = models.ImageField(upload_to='products/')
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    discount = models.IntegerField(default=0, help_text="Porcentaje de descuento")
    is_combo = models.BooleanField(default=False)
    unit = models.CharField(max_length=50, blank=True, null=True, help_text="Ej: porción, unidad")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'

    def __str__(self):
        return self.name
\`\`\`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | AutoField | ID único |
| name | CharField(200) | Nombre del producto |
| slug | SlugField | Slug para URLs |
| description | TextField | Descripción |
| category | ForeignKey | Relación con Category |
| image | ImageField | Imagen del producto |
| base_price | DecimalField | Precio base |
| stock | IntegerField | Cantidad en inventario |
| is_active | BooleanField | Si está activo |
| discount | IntegerField | Porcentaje de descuento |
| is_combo | BooleanField | Si es un combo |
| unit | CharField | Unidad de medida |

---

### 3. ProductVariant (Variante de Producto)

\`\`\`python
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100, help_text="Ej: Torta Completa, Por Porción")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'product_variants'

    def __str__(self):
        return f"{self.product.name} - {self.name}"
\`\`\`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | AutoField | ID único |
| product | ForeignKey | Relación con Product |
| name | CharField(100) | Nombre de la variante (ej: "Torta Completa") |
| price | DecimalField | Precio de esta variante |
| unit | CharField | Unidad (ej: "porción") |

---

### 4. ProductCustomization (Personalización de Producto)

\`\`\`python
class ProductCustomization(models.Model):
    CUSTOMIZATION_TYPES = [
        ('size', 'Tamaño'),
        ('topping', 'Topping'),
        ('filling', 'Relleno'),
        ('glaze', 'Glaseado'),
        ('doughType', 'Tipo de Masa'),
        ('portion', 'Porción'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='customizations')
    name = models.CharField(max_length=100)
    customization_type = models.CharField(max_length=20, choices=CUSTOMIZATION_TYPES)

    class Meta:
        db_table = 'product_customizations'

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class CustomizationOption(models.Model):
    customization = models.ForeignKey(ProductCustomization, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=100)
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'customization_options'

    def __str__(self):
        return self.name
\`\`\`

---

### 5. User (Usuario)

\`\`\`python
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('usuario', 'Usuario'),
        ('recepcionista', 'Recepcionista'),
        ('admin', 'Administrador'),
    ]

    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='usuario')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email
\`\`\`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | AutoField | ID único |
| username | CharField | Nombre de usuario |
| email | EmailField | Correo electrónico |
| password | CharField | Contraseña (hasheada) |
| first_name | CharField | Nombre |
| last_name | CharField | Apellido |
| phone | CharField | Teléfono |
| role | CharField | Rol: usuario, recepcionista, admin |
| avatar | ImageField | Foto de perfil |
| is_active | BooleanField | Si está activo |
| date_joined | DateTimeField | Fecha de registro |

---

### 6. Address (Dirección)

\`\`\`python
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=100, help_text="Ej: Casa, Oficina")
    address = models.TextField()
    zone = models.ForeignKey('DeliveryZone', on_delete=models.SET_NULL, null=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'addresses'

    def __str__(self):
        return f"{self.user.email} - {self.label}"
\`\`\`

---

### 7. DeliveryZone (Zona de Delivery)

\`\`\`python
class DeliveryZone(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_time = models.CharField(max_length=50, help_text="Ej: 20-30 min")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'delivery_zones'

    def __str__(self):
        return self.name
\`\`\`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | AutoField | ID único |
| name | CharField(100) | Nombre de la zona |
| price | DecimalField | Costo de envío |
| estimated_time | CharField | Tiempo estimado |
| is_active | BooleanField | Si está activa |

---

### 8. Order (Pedido)

\`\`\`python
class Order(models.Model):
    STATUS_CHOICES = [
        ('recibido', 'Recibido'),
        ('en_preparacion', 'En Preparación'),
        ('listo', 'Listo'),
        ('en_camino', 'En Camino'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]

    DELIVERY_TYPE_CHOICES = [
        ('delivery', 'Delivery'),
        ('pickup', 'Retiro en Tienda'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('tarjeta', 'Tarjeta'),
        ('pago_movil', 'Pago Móvil'),
        ('efectivo', 'Efectivo'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('fallido', 'Fallido'),
    ]

    order_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='recibido')
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPE_CHOICES)
    delivery_address = models.TextField(blank=True, null=True)
    delivery_zone = models.ForeignKey(DeliveryZone, on_delete=models.SET_NULL, null=True, blank=True)
    pickup_time = models.CharField(max_length=50, blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pendiente')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return self.order_number
\`\`\`

---

### 9. OrderItem (Item de Pedido)

\`\`\`python
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    product_image = models.CharField(max_length=500)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    customizations = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.order.order_number} - {self.product_name}"
\`\`\`

---

### 10. Promotion (Promoción)

\`\`\`python
class Promotion(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Porcentaje'),
        ('fixed', 'Monto Fijo'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    code = models.CharField(max_length=50, blank=True, null=True, unique=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'promotions'

    def __str__(self):
        return self.name
\`\`\`

---

### 11. Review (Reseña)

\`\`\`python
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(help_text="1-5 estrellas")
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"
\`\`\`

---

### 12. Favorite (Favorito)

\`\`\`python
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorites'
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"
\`\`\`

---

### 13. Notification (Notificación)

\`\`\`python
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('order_status', 'Estado de Pedido'),
        ('promotion', 'Promoción'),
        ('system', 'Sistema'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"
\`\`\`

---

## Diagrama de Relaciones

\`\`\`
User (1) ──────< (N) Address
User (1) ──────< (N) Order
User (1) ──────< (N) Review
User (1) ──────< (N) Favorite
User (1) ──────< (N) Notification

Category (1) ──────< (N) Product

Product (1) ──────< (N) ProductVariant
Product (1) ──────< (N) ProductCustomization
Product (1) ──────< (N) Review
Product (1) ──────< (N) Favorite
Product (1) ──────< (N) OrderItem

ProductCustomization (1) ──────< (N) CustomizationOption

Order (1) ──────< (N) OrderItem
Order (N) >────── (1) DeliveryZone
Order (1) ──────< (N) Notification
\`\`\`

---

## Migraciones

Después de crear los modelos, ejecuta:

\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

## Datos Iniciales (Fixtures)

Puedes crear un archivo `fixtures/initial_data.json` para cargar datos de prueba:

\`\`\`bash
python manage.py loaddata initial_data
