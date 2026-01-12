from rest_framework import serializers
from ..models import Category


class CategoriaSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)
    isActive = serializers.BooleanField(source='is_active', required=False)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'isActive']

