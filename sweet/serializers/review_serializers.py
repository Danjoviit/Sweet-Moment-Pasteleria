from rest_framework import serializers
from ..models import Review, Product


class ReviewSerializer(serializers.ModelSerializer):

    productId = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product'
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
        return Review.objects.create(user=user, **validated_data)
