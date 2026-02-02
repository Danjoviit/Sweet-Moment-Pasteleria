
from rest_framework import serializers
from ..models import Product, ProductVariant, Category
import json


class ProductoVarianteSerializer(serializers.ModelSerializer):

    type = serializers.CharField(source='name')

    class Meta:
        model = ProductVariant
        fields = ['id', 'type', 'price', 'unit']


class ProductoSerializer(serializers.ModelSerializer):

    variants = ProductoVarianteSerializer(many=True, required=False)

    slug = serializers.SlugField(read_only=True)

    category = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Category.objects.all()
    )

    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    isActive = serializers.BooleanField(source='is_active')
    isCombo = serializers.BooleanField(source='is_combo', required=False)

    price = serializers.DecimalField(source='base_price', read_only=True, max_digits=10, decimal_places=2)
    
    # ImageField allows both reading and writing
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'category', 'image', 'basePrice', 'price', 'stock', 'isActive', 'discount', 'isCombo', 'variants']

    def to_internal_value(self, data):
        """Handle FormData string values"""
        # Make a mutable copy
        if hasattr(data, 'dict'):
            # It's a QueryDict from FormData
            mutable_data = data.dict()
        else:
            mutable_data = dict(data)
        
        # Convert string 'true'/'false' to boolean
        if 'isActive' in mutable_data and isinstance(mutable_data['isActive'], str):
            mutable_data['isActive'] = mutable_data['isActive'].lower() == 'true'
        
        # Parse variants if it's a JSON string
        if 'variants' in mutable_data and isinstance(mutable_data['variants'], str):
            try:
                mutable_data['variants'] = json.loads(mutable_data['variants'])
            except json.JSONDecodeError:
                pass  # Let the serializer handle the error
        
        return super().to_internal_value(mutable_data)

    def to_representation(self, instance):
        """Custom method to return absolute URL for image in responses"""
        representation = super().to_representation(instance)
        
        # Convert image path to absolute URL
        if instance.image:
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
            else:
                representation['image'] = instance.image.url
        else:
            representation['image'] = None
            
        return representation

    def create(self, validated_data):

        variants_data = validated_data.pop('variants', [])

        product = Product.objects.create(**validated_data)

        for variant in variants_data:
            ProductVariant.objects.create(product=product, **variant)

        return product
