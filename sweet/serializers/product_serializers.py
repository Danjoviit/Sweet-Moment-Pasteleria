from rest_framework import serializers
from ..models import Product, ProductVariant, Category


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
