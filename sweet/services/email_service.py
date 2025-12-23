from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
import secrets


class EmailService:
    """Servicio para gestión de emails"""
    
    @staticmethod
    def send_password_reset_email(user):
        """Enviar email de reseteo de contraseña"""
        token = secrets.token_urlsafe(32)
        cache.set(f"password_reset:{token}", user.id, timeout=36000)
        
        reset_url = f"{settings.FRONTEND_URL}/restablecer-password?token={token}"
        
        send_mail(
            'Restablecer contraseña - Momentos Dulces',
            f'Hola {user.name or user.email},\n\n'
            f'Has solicitado restablecer tu contraseña:\n{reset_url}\n\n'
            f'Este enlace expirará en 1 hora.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return token
    
    @staticmethod
    def send_verification_email(user):
        """Enviar email de verificación"""
        token = secrets.token_urlsafe(32)
        cache.set(f"email_verification:{token}", user.id, timeout=86400)
        
        verify_url = f"{settings.FRONTEND_URL}/verificar-email?token={token}"
        
        send_mail(
            'Verifica tu email - Momentos Dulces',
            f'Hola {user.name or user.email},\n\n'
            f'Verifica tu email:\n{verify_url}\n\n'
            f'Este enlace expirará en 24 horas.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return token
    
    @staticmethod
    def send_order_confirmation_email(order):
        """Enviar email de confirmación de pedido"""
        send_mail(
            f'Pedido Confirmado - {order.order_number}',
            f'Hola {order.customer_name},\n\n'
            f'Tu pedido {order.order_number} ha sido recibido.\n'
            f'Total: ${order.total}\n\n'
            f'Gracias por tu compra!',
            settings.DEFAULT_FROM_EMAIL,
            [order.customer_email],
            fail_silently=False,
        )
