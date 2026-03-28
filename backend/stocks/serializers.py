from decimal import Decimal

from rest_framework import serializers
from .models import Stock
from .fmp_service import _get


def _fetch_fmp_profile(ticker):
    """Fetch profile data from FMP for a ticker. Returns dict or empty dict on failure."""
    try:
        data = _get("profile", {"symbol": ticker.upper()})
        return data[0] if data else {}
    except Exception:
        return {}


class StockSerializer(serializers.ModelSerializer):
    annual_dividend = serializers.DecimalField(
        max_digits=14, decimal_places=4, read_only=True,
    )
    total_value = serializers.DecimalField(
        max_digits=14, decimal_places=4, read_only=True,
    )
    dividend_yield = serializers.DecimalField(
        max_digits=8, decimal_places=4, read_only=True,
    )
    price_change_pct = serializers.DecimalField(
        max_digits=10, decimal_places=4, read_only=True, allow_null=True,
    )

    class Meta:
        model = Stock
        fields = [
            "id",
            "ticker",
            "company_name",
            "average_price",
            "quantity",
            "dividend_rate",
            "beta",
            "current_price",
            "price_change_pct",
            "annual_dividend",
            "total_value",
            "dividend_yield",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        ticker = validated_data.get("ticker", "")
        profile = _fetch_fmp_profile(ticker)

        if not validated_data.get("company_name") and profile.get("companyName"):
            validated_data["company_name"] = profile["companyName"]

        if profile.get("lastDividend") is not None:
            validated_data["dividend_rate"] = Decimal(str(profile["lastDividend"]))

        if profile.get("beta") is not None:
            validated_data["beta"] = Decimal(str(profile["beta"]))

        if profile.get("price") is not None:
            validated_data["current_price"] = Decimal(str(profile["price"]))

        return super().create(validated_data)

    def update(self, instance, validated_data):
        ticker = validated_data.get("ticker", instance.ticker)
        profile = _fetch_fmp_profile(ticker)

        if profile.get("lastDividend") is not None:
            validated_data["dividend_rate"] = Decimal(str(profile["lastDividend"]))

        if profile.get("beta") is not None:
            validated_data["beta"] = Decimal(str(profile["beta"]))

        if profile.get("price") is not None:
            validated_data["current_price"] = Decimal(str(profile["price"]))

        if not validated_data.get("company_name") and profile.get("companyName"):
            validated_data["company_name"] = profile["companyName"]

        return super().update(instance, validated_data)
