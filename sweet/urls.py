from django.urls import path
from .views import Categoria_list


urlpatterns = [
    path('categories/', Categoria_list, name='categoria-list'),
]
