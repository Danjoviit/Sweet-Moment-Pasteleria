from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from ..models import Product
from ..serializers import ProductoSerializer


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def Product_list(request):
    if request.method == 'GET':
        products = Product.objects.prefetch_related('variants').all()
        category_slug = request.query_params.get('category')
        if category_slug:
            products = products.filter(category__slug=category_slug)
            
        serializer = ProductoSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':

        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"error": "solo el administrador puede crear productos"})

        serializer = ProductoSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
def Product_detail(request, pk):
    product = get_object_or_404(Product.objects.prefetch_related('variants'), pk=pk)

    if request.method == 'GET':
        serializer = ProductoSerializer(product, context={'request': request}) 
        return Response(serializer.data)
    
    elif request.method == 'PUT':

        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({"error": "solo el administrador puede crear productos"})

        serializer = ProductoSerializer(product, data=request.data, context={'request': request})
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
        serializer = ProductoSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def Product_detail_by_slug(request, slug):
    product = get_object_or_404(Product.objects.prefetch_related('variants'), slug=slug)
    if request.method == 'GET':
        serializer = ProductoSerializer(product, context={'request': request})
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def collage_images(request):
    """
    Retorna una lista de URLs de las imágenes de los productos más recientes.
    Estrictamente optimizado para la vista de fondo.
    """
    # Import locally to avoid circular imports if any, though unlikely here
    from django.conf import settings
    
    # Obtener hasta 100 imágenes recientes
    # Filtramos nulos y vacíos
    images = Product.objects.filter(image__isnull=False).exclude(image='').order_by('-created_at').values_list('image', flat=True)[:100]
    
    # Construir URLs
    # Nota: values_list devuelve el path relativo guardado en DB (ej: products/img.jpg)
    # Necesitamos agregar MEDIA_URL si no está incluido
    
    media_url = settings.MEDIA_URL
    image_urls = []
    
    for img_path in images:
        if img_path:
            # Si estamos en desarrollo/producción normal, media_url suele ser /media/
            # Construimos la URL absoluta usando request
            full_url = request.build_absolute_uri(media_url + img_path)
            image_urls.append(full_url)
            
    return Response(image_urls)
