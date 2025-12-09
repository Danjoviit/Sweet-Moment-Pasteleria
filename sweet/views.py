from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from .serializers import CategoriaSerializer, ProductoSerializer, OrderSerializer, UserSerializers, RegisterSerializer, CustomLoginSerializer, AddressSerializer, DeliveryZoneSerializer, PromotionSerializer, ReviewSerializer
from .models import *
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import IsAdmin, IsOwnerOrStaff, IsReceptionist
from django.utils import timezone
from django.db.models import Sum, Count, Q



@api_view(['GET', 'POST'])
def Categoria_list(request):
    if request.method == 'GET':
        categoria = Category.objects.all()
        serializer = CategoriaSerializer(categoria, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CategoriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
def Categoria_detail(request, pk):

    categoria = get_object_or_404(Category, pk=pk)

    if request.method == 'GET':
        serializer = CategoriaSerializer(categoria)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = CategoriaSerializer(categoria, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        categoria.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'PATCH':
        serializer = CategoriaSerializer(categoria, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def Product_list(request):
    if request.method == 'GET':
        products = Product.objects.prefetch_related('variants').all()
        category_slug = request.query_params.get('category')
        if category_slug:
            products = products.filter(category__slug=category_slug)
            
        serializer = ProductoSerializer(products, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':

        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"error": "solo el administrador puede crear productos"})


        serializer = ProductoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
def Product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)

    if request.method == 'GET':
        serializer = ProductoSerializer(product) 
        return Response(serializer.data)

        
    
    elif request.method == 'PUT':

        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"error": "solo el administrador puede crear productos"})

        serializer = ProductoSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':

        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"error": "solo el administrador puede crear productos"})
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'PATCH':
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"error": "solo el administrador puede crear productos"})        
        serializer = ProductoSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
def Product_detail_by_slug(request, slug):
    product = get_object_or_404(Product, slug=slug)
    if request.method == 'GET':
        serializer = ProductoSerializer(product)
        return Response(serializer.data)
    

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_list(request):
    user = request.user

    if request.method == 'GET':

        if user.role in ['admin', 'recepcionista']:
        
            orders = Order.objects.prefetch_related('items').all().order_by('-created_at')
        else:
            orders = Order.objects.prefetch_related('items').filter(user=user).order_by('-created_at')


        status_param = request.query_params.get('status')
        user_param = request.query_params.get('user')


        if status_param:
            orders = orders.filter(status=status_param)
        if user_param:
            orders = orders.filter(user__id=user_param)
        
        serializer = OrderSerializer(orders, many=True)

        return Response(serializer.data)
    elif request.method == 'POST':
        serializers = OrderSerializer(data=request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data, status=status.HTTP_201_CREATED)
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def order_detail(request, pk):
    order = get_object_or_404(Order, pk=pk)

    if request.method == 'GET':
        serializers = OrderSerializer(order)
        return Response(serializers.data)

 
@api_view(['PATCH'])
@permission_classes([IsReceptionist])
def order_status_update(request, pk):
    order = get_object_or_404(Order, pk=pk)

    if request.method == 'PATCH':
        serializers = OrderSerializer(order, data=request.data, partial=True)

        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):

    serializers = RegisterSerializer(data=request.data)
    if serializers.is_valid():
        user = serializers.save()
        return Response({
            "mesagge": "Usuario creado existosamente",
            "user": UserSerializers(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):

    serializer = CustomLoginSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        #AUTENTICACION MANUAL

        try:
            user_exists = User.objects.get(email=email)
            print(f"Usuario encontrado en BD: {user_exists}")
            print(f"¿Es activo?: {user_exists.is_active}")
            print(f"¿La contraseña coincide?: {user_exists.check_password(password)}")
            print(f"Username real en BD: {user_exists.username}")
        except User.DoesNotExist:
            print("ERROR: El usuario NO existe en la base de datos.")

        user = authenticate(request=request, username=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)

            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializers(user).data
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Credenciales invalidas'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_current_user(request):
    permission_classes = [IsAuthenticated]
    serializer = UserSerializers(request.user)
    return Response({'user': serializer.data})

@api_view(['PATCH'])
def update_profile(request):
    permission_classes = [IsAuthenticated]
    user = request.user
    serializer = UserSerializers(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_user(request):
    try:
        refresh_token = request.data.get("refresh_token")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({"message": "logout exitoso"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response ({"error": 'Token invalido'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def address_list_create(request):
    if request.method == 'GET':
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AddressSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def address_detail(request, pk):
    address = get_object_or_404(Address, pk=pk, user=request.user)

    if request.method == 'PATCH':
        serializer = AddressSerializer(address, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favorite_list(request):
    user = request.user

    if request.method == 'GET':

        favorite_ids = Favorite.objects.filter(user=user).values_list('product_id', flat=True)
        return Response(list(favorite_ids))
    elif request.method == 'POST':
        data = request.data

        product_id = data.get('productId') or data.get('product_id')

        if not product_id:
            return Response(
                {"error": "se requiere 'productId' o 'product_id' en el cuerpo de la solicitud"},
                status=status.HTTP_400_BAD_REQUEST
            
            )
        
        product = get_object_or_404(Product, pk=product_id)

        Favorite.objects.get_or_create(user=user, product=product)

        return Response({"message": "Producto agregado a favoritos"}, status=status.HTTP_201_CREATED)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def favorite_detail(request, product_id):

    user = request.user

    favorite = Favorite.objects.filter(user=user, product_id=product_id)

    if favorite.exists():
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(
        {"error": "el producto no estaba en favorito"},
        status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def delivery_zone_detail(request, pk):
    zone = get_object_or_404(DeliveryZone, pk=pk)

    if request.method == 'GET':
        serializer = DeliveryZoneSerializer(zone)
        return Response(serializer.data)
    
@api_view(['GET', 'POST'])
@permission_classes([AllowAny]) 
def delivery_zone_list(request):
    if request.method == 'GET':
        zones = DeliveryZone.objects.filter(is_active=True)
        serializer = DeliveryZoneSerializer(zones, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':

        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response(
                {"error": "Solo administradores pueden crear zonas"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = DeliveryZoneSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def promotion_list(request):

    if request.method == 'GET':
        now = timezone.now()

        promotions = Promotion.objects.filter(
            is_active=True,
            valid_until__gte=now,
            valid_from__lte=now
        )

        serializer = PromotionSerializer(promotions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':

        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response(
                {"error": "solo administradores pueden crear promociones"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PromotionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def promotion_detail_by_code(request, pk):

    promo = get_object_or_404(Promotion, code=pk)

    now = timezone.now()

    if not promo.is_active or promo.valid_until < now:
        return Response(
            {"error": "Esta promocion ha expirado o no esta activa"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if request.method == 'GET':
        serializer = PromotionSerializer(promo)
        return Response(serializer.data)
    

@api_view(['GET'])
@permission_classes([IsAdmin])
def dashboard_stats(request):
    revenue_data = Order.objects.exclude(status='cancelado').aggregate(total=Sum('total'))
    total_revenue = revenue_data['total'] or 0.00

    total_orders = Order.objects.Count()

    pending_orders = Order.objects.filter(status='recibido').Count()

    preparing_orders = Order.objects.filter(status='en_preparacion').Count()

    completed_orders = Order.objects.filter(status='entregado').Count()

    total_users = User.objects.filter(role='usuario').Count()

    low_stock_products = Product.objects.filter(stock__lt=5, is_active=True).Count()

    data = {
        "totalRevenue": total_revenue,
        "totalOrders": total_orders,
        "pendingOrders": pending_orders,
        "completedOrders": completed_orders,
        "totalUsers": total_users,
        "lowStocProducts": low_stock_products,
        "preparingOrders": preparing_orders
    }

    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def review_list(request):

    if request.method == 'GET':
        reviews = Review.objects.all().order_by('-created_at')

        product_id = request.query_params.get('product')
        if product_id:
            reviews = reviews.filter(product_id=product_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({"error": "debes iniciar sesion para reseñar"}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = ReviewSerializer(data=request.data, context={'request': request})


        if serializer.is_valid:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated, IsOwnerOrStaff])
def review_detail(request, pk):
    review = get_object_or_404(Review, pk=pk)

    if request.user != review.user and request.user.role not in ['admin', 'recepcionista']:
        return Response({"message": "error, no tienes permiso para ver esta ruta"}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PATCH':
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    