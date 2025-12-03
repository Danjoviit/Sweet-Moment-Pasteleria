from rest_framework import serializers
from .models import *

class CategoriaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = 'name', 'slug', 'description', 'image', 'is_active'





