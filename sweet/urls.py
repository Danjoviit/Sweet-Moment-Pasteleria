from django.urls import path
from .views import (Categoria_list, Categoria_detail, 
                    Product_list, Product_detail, Product_detail_by_slug,
                    order_list, order_detail, order_status_update,
                    register_user, login_user, get_current_user, update_profile, logout_user,
                    address_list_create, address_detail)


urlpatterns = [
    path('categories/', Categoria_list, name='categoria-list'),
    path('categories/<int:pk>/', Categoria_detail, name='categoria-detail'),
    path('products/', Product_list, name='product-list'),
    path('products/<int:pk>/', Product_detail, name='product-detail'),
    path('products/slug/<slug:slug>/', Product_detail_by_slug, name='product-detail-slug'),
    path('orders/', order_list, name='order-list'),
    path('orders/<int:pk>/', order_detail, name='order-detail'),
    path('orders/<int:pk>/status/', order_status_update, name='order-status'),
    path('auth/register/', register_user, name='auth-register'),
    path('auth/login/', login_user, name='auth-login'),
    path('auth/me/', get_current_user, name='auth-me'),
    path('auth/profile/', update_profile, name='auth-profile'),
    path('auth/logout/', logout_user, name='auth-logout'),    
    path('auth/addresses/', address_list_create, name='address-list-create'),
    path('auth/addresses/<int:pk>/', address_detail, name='address-detail'),

]
