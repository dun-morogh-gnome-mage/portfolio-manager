from django.db import models
from decimal import Decimal


class Stock(models.Model):
    ticker = models.CharField(max_length=10)
    company_name = models.CharField(max_length=200, blank=True, default="")
    average_price = models.DecimalField(max_digits=12, decimal_places=4)
    quantity = models.IntegerField()
    dividend_rate = models.DecimalField(
        max_digits=10, decimal_places=4, default=Decimal("0"),
        help_text="Annual dividend per share",
    )
    beta = models.DecimalField(
        max_digits=8, decimal_places=4, null=True, blank=True,
        help_text="Stock beta from FMP",
    )
    current_price = models.DecimalField(
        max_digits=12, decimal_places=4, null=True, blank=True,
        help_text="Latest price from FMP",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def annual_dividend(self):
        return self.quantity * self.dividend_rate

    @property
    def total_value(self):
        return self.quantity * self.average_price

    @property
    def dividend_yield(self):
        if self.average_price and self.average_price > 0:
            return (self.dividend_rate / self.average_price) * 100
        return Decimal("0")

    @property
    def price_change_pct(self):
        if self.current_price and self.average_price and self.average_price > 0:
            return ((self.current_price - self.average_price) / self.average_price) * 100
        return None

    def __str__(self):
        return f"{self.ticker} ({self.quantity} shares)"

    class Meta:
        ordering = ["ticker"]
