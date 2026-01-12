from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import Review
from ..serializers import ReviewSerializer
from ..permissions import IsOwnerOrStaff


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

        if serializer.is_valid():
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
