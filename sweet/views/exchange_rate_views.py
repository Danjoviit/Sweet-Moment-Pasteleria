from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..models import ExchangeRate
from ..serializers.exchange_rate_serializers import ExchangeRateSerializer, ExchangeRateUpdateSerializer
from ..permissions import IsAdmin


@api_view(['GET'])
@permission_classes([AllowAny])
def get_exchange_rate(request):
    """
    Get current exchange rate (public endpoint)
    """
    try:
        rate = ExchangeRate.get_rate()
        serializer = ExchangeRateSerializer(rate)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_exchange_rate(request):
    """
    Update exchange rate (admin only)
    """
    try:
        rate = ExchangeRate.get_rate()
        serializer = ExchangeRateUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            rate.usd_to_bs = serializer.validated_data['usdToBs']
            rate.updated_by = request.user
            rate.save()
            
            response_serializer = ExchangeRateSerializer(rate)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
