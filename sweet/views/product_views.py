from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from ..models import Product
from ..serializers import ProductoSerializer


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
