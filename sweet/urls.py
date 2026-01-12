from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    Categoria_list, Categoria_detail, 
    Product_list, Product_detail, Product_detail_by_slug, collage_images,
    order_list, order_detail, order_status_update,
    register_user, login_user, get_current_user, update_profile, logout_user,
    address_list_create, address_detail,
    favorite_list, favorite_detail,
    delivery_zone_list, delivery_zone_detail,
    promotion_list, promotion_detail_by_code, promotion_detail,
    dashboard_stats,
    review_list, review_detail
)
from .views.user_views import UserViewSet
from .views.auth_views import (
    request_password_reset, 
    reset_password_confirm,
    verify_email,
    resend_verification_email
)
from .views.exchange_rate_views import (
    get_exchange_rate,
    update_exchange_rate
)


# Router para ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Router ViewSets
    path('', include(router.urls)),
    
    # Categorías
    path('categories/', Categoria_list, name='categoria-list'),
    path('categories/<int:pk>/', Categoria_detail, name='categoria-detail'),
    
    # Productos
    path('products/', Product_list, name='product-list'),
    path('products/<int:pk>/', Product_detail, name='product-detail'),
    path('products/collage-images/', collage_images, name='product-collage-images'),
    path('products/slug/<slug:slug>/', Product_detail_by_slug, name='product-detail-slug'),
    
    # Pedidos
    path('orders/', order_list, name='order-list'),
    path('orders/<int:pk>/', order_detail, name='order-detail'),
    path('orders/<int:pk>/status/', order_status_update, name='order-status'),
    
    # Autenticación básica
    path('auth/register/', register_user, name='auth-register'),
    path('auth/login/', login_user, name='auth-login'),
    path('auth/me/', get_current_user, name='auth-me'),
    path('auth/profile/', update_profile, name='auth-profile'),
    path('auth/logout/', logout_user, name='auth-logout'),
    
    # Password Reset
    path('auth/password-reset/', request_password_reset, name='password-reset'),
    path('auth/password-reset/confirm/', reset_password_confirm, name='password-reset-confirm'),
    
    # Email Verification
    path('auth/verify-email/', verify_email, name='verify-email'),
    path('auth/resend-verification/', resend_verification_email, name='resend-verification'),
    
    # Direcciones
    path('auth/addresses/', address_list_create, name='address-list-create'),
    path('auth/addresses/<int:pk>/', address_detail, name='address-detail'),
    
    # Favoritos
    path('favorites/', favorite_list, name='favorite-list'),
    path('favorites/<int:product_id>/', favorite_detail, name='favorite-detail'),
    
    # Zonas de entrega
    path('delivery-zones/', delivery_zone_list, name='delivery-zone-list'),
    path('delivery-zones/<int:pk>/', delivery_zone_detail, name='delivery-zone-detail'),
    
    # Promociones
    path('promotions/', promotion_list, name='promotion-list'),
    path('promotions/<int:pk>/', promotion_detail, name='promotion-detail'),
    path('promotions/code/<str:code>/', promotion_detail_by_code, name='promotion-detail-code'),
    
    # Dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    
    # Reseñas
    path('reviews/', review_list, name='review-list'),
    path('reviews/<int:pk>/', review_detail, name='review-detail'),
    
    # Exchange Rate
    path('exchange-rate/', get_exchange_rate, name='exchange-rate-get'),
    path('exchange-rate/update/', update_exchange_rate, name='exchange-rate-update'),
]
