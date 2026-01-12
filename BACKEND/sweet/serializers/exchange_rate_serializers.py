from rest_framework import serializers
from ..models import ExchangeRate


class ExchangeRateSerializer(serializers.ModelSerializer):
    usdToBs = serializers.DecimalField(source='usd_to_bs', max_digits=10, decimal_places=2, read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    updatedBy = serializers.SerializerMethodField()

    class Meta:
        model = ExchangeRate
        fields = ['id', 'usdToBs', 'updatedAt', 'updatedBy']

    def get_updatedBy(self, obj):
        if obj.updated_by:
            return {
                'id': obj.updated_by.id,
                'name': obj.updated_by.name or obj.updated_by.username,
                'email': obj.updated_by.email
            }
        return None

    def validate_usdToBs(self, value):
        """Ensure exchange rate is positive"""
        if value <= 0:
            raise serializers.ValidationError("La tasa de cambio debe ser mayor a 0")
        return value


class ExchangeRateUpdateSerializer(serializers.Serializer):
    usdToBs = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2,
        min_value=0.01,
        error_messages={
            'min_value': 'La tasa de cambio debe ser mayor a 0'
        }
    )
