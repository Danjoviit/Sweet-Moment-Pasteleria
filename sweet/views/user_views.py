from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import User
from ..serializers import UserSerializers
from ..permissions import IsAdmin


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios (solo admin)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializers
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @action(detail=False, methods=['get'], url_path='email/(?P<email>[^/.]+)')
    def by_email(self, request, email=None):
        """Buscar usuario por email"""
        user = get_object_or_404(User, email=email)
        serializer = self.get_serializer(user)
        return Response(serializer.data)
