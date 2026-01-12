from rest_framework import serializers
from ..models import User, Address, DeliveryZone, Promotion


class UserSerializers(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'role', 'avatar', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.get('email')
        
        # Ensure username is set to email
        validated_data['username'] = email
        
        # Create user instance but don't save yet if using create_user? 
        # Actually create_user handles hashing, but we need to pass extra fields.
        # Let's use standard create logic extended.
        
        user = User.objects.create(**validated_data)
        
        if password:
            user.set_password(password)
            user.save()
            
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        # Sync username with email if email changed
        if 'email' in validated_data:
            instance.username = validated_data['email']

        if password:
            instance.set_password(password)
            
        instance.save()
        return instance


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
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'usuario'),
            name=validated_data['name']
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
    estimatedTime = serializers.CharField(source='estimated_time')
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
