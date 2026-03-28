from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockViewSet, fundamentals, symbol_search, exchange_variants

router = DefaultRouter()
router.register(r"stocks", StockViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("fundamentals/<str:ticker>/", fundamentals, name="fundamentals"),
    path("search/symbol/", symbol_search, name="symbol-search"),
    path("search/exchange-variants/", exchange_variants, name="exchange-variants"),
]
