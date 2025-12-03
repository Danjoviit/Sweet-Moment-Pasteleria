from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
# Create your models here.



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
    
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100, help_text="Ej: Torta Completa, Por Porción")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'product_variants'

    def __str__(self):
        return f"{self.product.name} - {self.name}"
    
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


class User(AbstractUser):
    ROLE_CHOICES = [
        ('usuario', 'Usuario'),
        ('recepcionista', 'Recepcionista'),
        ('admin', 'Administrador'),
    ]

    # Override `groups` and `user_permissions` to avoid reverse accessor name clashes
    groups = models.ManyToManyField(
        Group,
        related_name='sweet_users',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name='sweet_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='usuario')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email
    
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
    
class DeliveryZone(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_time = models.CharField(max_length=50, help_text="Ej: 20-30 min")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'delivery_zones'

    def __str__(self):
        return self.name
    
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
    
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorites'
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"
    
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