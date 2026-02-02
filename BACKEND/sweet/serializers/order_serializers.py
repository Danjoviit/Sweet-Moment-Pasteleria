from rest_framework import serializers
from ..models import Order, OrderItem, Product, User, DeliveryZone
from django.db import transaction
import uuid


class OrderItemSerializer(serializers.ModelSerializer):

    productId = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product')
    productName = serializers.CharField(source='product_name')
    productImage = serializers.CharField(source='product_image')
    unitPrice = serializers.DecimalField(source='unit_price', max_digits=10, decimal_places=2)
    totalPrice = serializers.DecimalField(source='total_price', max_digits=10, decimal_places=2)

    class Meta:
        model = OrderItem
        fields = ['productId', 'productName', 'productImage', 'quantity', 'unitPrice', 'totalPrice', 'customizations']


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

    # Mapeo para el payload del frontend

    customerName = serializers.CharField(source='customer_name')
    customerEmail = serializers.EmailField(source='customer_email')
    customerPhone = serializers.CharField(source='customer_phone')
    deliveryCost = serializers.DecimalField(source='delivery_cost', max_digits=10, decimal_places=2)
    deliveryType = serializers.CharField(source='delivery_type')
    deliveryAddress = serializers.CharField(source='delivery_address', required=False, allow_blank=True)
    paymentMethod = serializers.CharField(source='payment_method')

    # Campos solamente de lectura
    orderNumber = serializers.CharField(source='order_number', read_only=True)
    status = serializers.CharField(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'orderNumber', 'userId', 'customerName', 'customerEmail', 'customerPhone',
            'items', 'subtotal', 'deliveryCost', 'total', 'deliveryType',
            'deliveryAddress', 'DeliveryZone', 'paymentMethod', 'notes', 
            'status', 'createdAt'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        # Generar número de orden automático si no existe
        validated_data['order_number'] = str(uuid.uuid4())[:8].upper()

        with transaction.atomic():
            order = Order.objects.create(**validated_data)

            for item_data in items_data:
                product = item_data.get('product')
                quantity = item_data.get('quantity', 1)
                
                # Verificar y reducir el stock del producto
                if product:
                    # Bloquear el producto para evitar race conditions
                    product_to_update = Product.objects.select_for_update().get(pk=product.pk)
                    
                    if product_to_update.stock < quantity:
                        raise serializers.ValidationError(
                            f"Stock insuficiente para {product_to_update.name}. "
                            f"Disponible: {product_to_update.stock}, Solicitado: {quantity}"
                        )
                    
                    # Reducir el stock
                    product_to_update.stock -= quantity
                    product_to_update.save()
                
                OrderItem.objects.create(order=order, **item_data)

        return order

class OrderStatusSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)

    class Meta:
        model = Order
        fields = ['status']
