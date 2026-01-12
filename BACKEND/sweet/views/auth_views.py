from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
import secrets
from datetime import timedelta
from ..models import User


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Solicitar reseteo de contraseña"""
    email = request.data.get('email')
    
    if not email:
        return Response(
            {"error": "El email es requerido"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        # Generar token único
        token = secrets.token_urlsafe(32)
        
        # Guardar en Redis con expiración de 1 hora
        cache.set(
            f"password_reset:{token}",
            user.id,
            timeout=3600  # 1 hora
        )
        
        # Construir URL de reseteo
        reset_url = f"{settings.FRONTEND_URL}/restablecer-password?token={token}"
        
        # Enviar email
        send_mail(
            'Restablecer contraseña - Momentos Dulces',
            f'Hola {user.name or user.email},\n\n'
            f'Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:\n\n'
            f'{reset_url}\n\n'
            f'Este enlace expirará en 1 hora.\n\n'
            f'Si no solicitaste esto, ignora este mensaje.',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response({"message": "Email de recuperación enviado"})
    
    except User.DoesNotExist:
        # Por seguridad, siempre retornar éxito
        return Response({"message": "Email de recuperación enviado"})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    """Confirmar reseteo de contraseña"""
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not token or not new_password:
        return Response(
            {"error": "Token y nueva contraseña son requeridos"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Obtener user_id desde Redis
    user_id = cache.get(f"password_reset:{token}")
    
    if not user_id:
        return Response(
            {"error": "Token inválido o expirado"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
        user.set_password(new_password)
        user.save()
        
        # Eliminar token usado
        cache.delete(f"password_reset:{token}")
        
        return Response({"message": "Contraseña restablecida exitosamente"})
    
    except User.DoesNotExist:
        return Response(
            {"error": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Verificar email con token"""
    token = request.data.get('token')
    
    if not token:
        return Response(
            {"error": "Token es requerido"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Obtener user_id desde Redis
    user_id = cache.get(f"email_verification:{token}")
    
    if not user_id:
        return Response(
            {"error": "Token inválido o expirado"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
        user.is_active = True
        user.save()
        
        # Eliminar token usado
        cache.delete(f"email_verification:{token}")
        
        return Response({"message": "Email verificado exitosamente"})
    
    except User.DoesNotExist:
        return Response(
            {"error": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
    """Reenviar email de verificación"""
    user = request.user
    
    if user.is_active:
        return Response(
            {"error": "El email ya está verificado"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generar nuevo token
    token = secrets.token_urlsafe(32)
    
    # Guardar en Redis con expiración de 24 horas
    cache.set(
        f"email_verification:{token}",
        user.id,
        timeout=86400  # 24 horas
    )
    
    # Construir URL de verificación
    verify_url = f"{settings.FRONTEND_URL}/verificar-email?token={token}"
    
    # Enviar email
    send_mail(
        'Verifica tu email - Momentos Dulces',
        f'Hola {user.name or user.email},\n\n'
        f'Por favor verifica tu email haciendo clic en el siguiente enlace:\n\n'
        f'{verify_url}\n\n'
        f'Este enlace expirará en 24 horas.',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    
    return Response({"message": "Email de verificación reenviado"})
