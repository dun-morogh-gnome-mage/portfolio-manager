from django.contrib import admin
from .models import Stock

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ["ticker", "company_name", "average_price", "quantity", "dividend_rate", "beta"]
