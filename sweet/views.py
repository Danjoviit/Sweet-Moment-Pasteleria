from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from .serializers import CategoriaSerializer, ProductoSerializer, OrderSerializer
from .models import *
from django.shortcuts import get_object_or_404
# Create your views here.


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
