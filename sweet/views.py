from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from .serializers import CategoriaSerializer, ProductoSerializer, OrderSerializer, UserSerializers, RegisterSerializer, CustomLoginSerializer
from .models import *
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken






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
def Product_list(request):

    if request.method == 'GET':
        products = Product.objects.prefetch_related('variants').all()
        category_slug = request.query_params.get('category')
        if category_slug:
            products = products.filter(category__slug=category_slug)
            
        serializer = ProductoSerializer(products, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
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

        
        serializer = ProductoSerializer(product, many =True)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProductoSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'PATCH':
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
def order_list(request):
    if request.method == 'GET':
        orders = Order.objects.prefetch_related('items').all().order_by('-created_at')

        status_param = request.query_params.get('status')
        user_param = request.query_params.get('user')


        if status_param:
            orders = orders.filter(status=status_param)
        if user_param:
            orders = orders.filter(user__id=user_param)
        
        serrializer = OrderSerializer(orders, many=True)

        return Response(serrializer.data)
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
def order_status_update(request, pk):
    order = get_object_or_404(Order, pk=pk)

    if request.method == 'PATCH':
        serializers = OrderSerializer(order, data=request.data, partial=True)

        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def register_user(request):
    Permission_classes = [AllowAny]
    serializers = RegisterSerializer(data=request.data)
    if serializers.is_valid():
        user = serializers.save()
        return Response({
            "mesagge": "Usuario creado existosamente",
            "user": UserSerializers(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    permission_classes = [AllowAny]
    serializer = CustomLoginSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validate_data['email']
        password = serializer.validated_data['password']

        #AUTENTICACION MANUAL

        user = authenticate(username=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)

            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializers(user).data
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Credenciales invalidas'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errores, status=status.HTTP_400_BAD_REQUEST)

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
