from rest_framework import serializers
from .models import *
from django.db import transaction
import uuid
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

class CategoriaSerializer(serializers.ModelSerializer):

    slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active']





class ProductoVarianteSerializer(serializers.ModelSerializer):

    type = serializers.CharField(source='name')

    class Meta:
        model = ProductVariant
        fields = ['id', 'type', 'price', 'unit']

class ProductoSerializer(serializers.ModelSerializer):

    variants = ProductoVarianteSerializer(many=True)


    slug = serializers.SlugField(read_only=True)

    category = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Category.objects.all()
    )

    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    isActive = serializers.BooleanField(source='is_active')

    price = serializers.DecimalField(source='base_price', read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'category', 'image', 'basePrice', 'price', 'stock', 'isActive', 'variants']


    def create(self, validated_data):

        variants_data = validated_data.pop('variants')

        product = Product.objects.create(**validated_data)

        for variant in variants_data:
            ProductVariant.objects.create(product=product, **variant)

        return product
    



class OrderItemSerializer(serializers.ModelSerializer):

    productID = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product')
    productName = serializers.CharField(source='product_name')
    productImage = serializers.CharField(source='product_image')
    unitPrice = serializers.DecimalField(source='unit_price', max_digits=10, decimal_places=2)
    totalPrice = serializers.DecimalField(source='total_price', max_digits=10, decimal_places=2)

    class Meta:
        model = OrderItem
        fields = ['productID', 'productName', 'productImage', 'quantity', 'unitPrice', 'totalPrice', 'customizations']


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True)

    userId = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        required=False,
        allow_null=True
    )

    DeliveryZone = serializers.SlugRelatedField(
        slug_field='name',
        queryset=DeliveryZone.objects.all(),
        source='delivery_zone',
        required=False,
        allow_null=True
    )

    #mapeo para el payload del fronted

    customerName = serializers.CharField(source='customer_name')
    customerEmail = serializers.EmailField(source='customer_email')
    customerPhone = serializers.CharField(source='customer_phone')
    deliveryCost = serializers.DecimalField(source='delivery_cost', max_digits=10, decimal_places=2)
    deliveryType = serializers.CharField(source='delivery_type')
    deliveryAddress = serializers.CharField(source='delivery_address', required=False, allow_blank=True)
    paymentMethod = serializers.CharField(source='payment_method')

    #Campos solamente de lectura
    orderNumber = serializers.CharField(source='order_number', read_only=True)
    status = serializers.CharField(read_only=True)
    createAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'orderNumber', 'userId', 'customerName', 'customerEmail', 'customerPhone',
            'items', 'subtotal', 'deliveryCost', 'total', 'deliveryType',
            'deliveryAddress', 'deliveryZone', 'paymentMethod', 'notes', 
            'status', 'createdAt'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        #generar numero de ordern automatico si no existe
        validated_data['order_number']= str(uuid.uuid4())[:8].upper()

        with transaction.atomic():
            order = Order.objects.create(**validated_data)

            for item_data in items_data:
                OrderItem.objects.create(order=order, **item_data)

        return order

class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'role', 'avatar']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'phone', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone = validated_data.get('phone', ''),
            role=validated_data.get('role', 'usuario'),
            name= validated_data['name']

        )
        return user
        
class CustomLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)



class AddressSerializer(serializers.ModelSerializer):
    zone = serializers.SlugRelatedField(
        slug_field='name',
        queryset=DeliveryZone.objects.all()
    )

    IsDefault = serializers.BooleanField(source='is_default', required=False)

    class Meta:
        model = Address
        fields = ['id', 'label', 'address', 'zone', 'isDefault']

    def create(self, validated_data):
        user = self.context['request'].user

        if validated_data.get('is_default', False):
            Address.objects.filter(user=user, is_default=True).update(is_default=False)
        return Address.objects.create(user=user, **validated_data)
    def update(self, instance, validated_data):
        if validated_data.get('is_default', False):
            Address.objects.filter(user=instance.user, is_default=True).exclude(id=instance.id).update(is_default=False)
        return super().update(instance, validated_data)


class DeliveryZoneSerializer(serializers.ModelSerializer):
    estimatedTime = serializers.CharField(source= 'estimated_time')
    isActive = serializers.BooleanField(source='is_active')

    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'price', 'estimatedTime', 'isActive']


class PromotionSerializer(serializers.ModelSerializer):
    discountType = serializers.CharField(source='discount_type')
    discountValue = serializers.DecimalField(source='discount_value', max_digits=10, decimal_places=2)
    minPurchase = serializers.DecimalField(source='min_purchase', max_digits=10, decimal_places=2)
    validFrom = serializers.DateTimeField(source='valid_from')
    validUntil = serializers.DateTimeField(source='valid_until')
    isActive = serializers.BooleanField(source='is_active')

    class Meta:
        model = Promotion
        fields = [
            'id', 'name', 'description', 'code', 
            'discountType', 'discountValue', 'minPurchase', 
            'validFrom', 'validUntil', 'isActive'
            ]
        
class ReviewSerializer(serializers.ModelSerializer):

    productId = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source = 'product'
    )

    userId = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    userName = serializers.CharField(source='user.name', read_only=True)

    createAt = serializers.DateTimeField(source='created_at', read_only=True)


    class Meta:
        model = Review
        fields = ['id', 'userId', 'userName', 'productId', 'rating', 'comment', 'createdAt']


    def create(self, validated_data):

        user = self.context['request'].user

        product = validated_data['product']

        if Review.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError({"error": "ya has reseñado este producto anteriormente"})
        return Review.obhects.create(user=user, **validated_data)
    
