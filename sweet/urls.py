from django.urls import path
from .views import Categoria_list, Categoria_detail, Product_list


urlpatterns = [
    path('categories/', Categoria_list, name='categoria-list'),
    path('categories/<int:pk>/', Categoria_detail, name='categoria-detail'),
    path('products/', Product_list, name='product-list'),
]
