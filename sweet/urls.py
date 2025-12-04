from django.urls import path
from .views import Categoria_list, Categoria_detail, Product_list, Product_detail, Product_detail_by_slug


urlpatterns = [
    path('categories/', Categoria_list, name='categoria-list'),
    path('categories/<int:pk>/', Categoria_detail, name='categoria-detail'),
    path('products/', Product_list, name='product-list'),
    path('products/<int:pk>/', Product_detail, name='product-detail'),
    path('products/slug/<slug:slug>/', Product_detail_by_slug, name='product-detail-slug')
]
