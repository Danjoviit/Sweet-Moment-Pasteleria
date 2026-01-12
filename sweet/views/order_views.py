from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import Order
from ..serializers import OrderSerializer, OrderStatusSerializer
from ..permissions import IsReceptionist


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
        serializer = OrderStatusSerializer(order, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

