from django.urls import path
from .views import (Categoria_list, Categoria_detail, 
                    Product_list, Product_detail, Product_detail_by_slug,
                    order_list, order_detail, order_status_update)


urlpatterns = [
    path('categories/', Categoria_list, name='categoria-list'),
    path('categories/<int:pk>/', Categoria_detail, name='categoria-detail'),
    path('products/', Product_list, name='product-list'),
    path('products/<int:pk>/', Product_detail, name='product-detail'),
    path('products/slug/<slug:slug>/', Product_detail_by_slug, name='product-detail-slug'),
    path('orders/', order_list, name='order-list'),
    path('orders/<int:pk>/', order_detail, name='order-detail'),
    path('orders/<int:pk>/status/', order_status_update, name='order-status'),    

]
