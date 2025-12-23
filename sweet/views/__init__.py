# Views organizadas por módulo
from .category_views import Categoria_list, Categoria_detail
from .product_views import Product_list, Product_detail, Product_detail_by_slug
from .order_views import order_list, order_detail, order_status_update
from .review_views import review_list, review_detail
from .misc_views import (
    register_user, 
    login_user, 
    get_current_user, 
    update_profile, 
    logout_user,
    address_list_create,
    address_detail,
    favorite_list,
    favorite_detail,
    delivery_zone_list,
    delivery_zone_detail,
    promotion_list,
    promotion_detail_by_code,
    dashboard_stats
)

__all__ = [
    # Categories
    'Categoria_list',
    'Categoria_detail',
    # Products
    'Product_list',
    'Product_detail',
    'Product_detail_by_slug',
    # Orders
    'order_list',
    'order_detail',
    'order_status_update',
    # Reviews
    'review_list',
    'review_detail',
    # Auth
    'register_user',
    'login_user',
    'get_current_user',
    'update_profile',
    'logout_user',
    # Addresses
    'address_list_create',
    'address_detail',
    # Favorites
    'favorite_list',
    'favorite_detail',
    # Delivery Zones
    'delivery_zone_list',
    'delivery_zone_detail',
    # Promotions
    'promotion_list',
    'promotion_detail_by_code',
    # Dashboard
    'dashboard_stats',
]
