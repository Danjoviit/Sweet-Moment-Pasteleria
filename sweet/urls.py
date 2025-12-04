from django.urls import path
from .views import Categoria_list, Categoria_detail


urlpatterns = [
    path('categories/', Categoria_list, name='categoria-list'),
    path('categories/<int:pk>/', Categoria_detail, name='categoria-detail'),
]
