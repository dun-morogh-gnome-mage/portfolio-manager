from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Stock
from .serializers import StockSerializer
from .fmp_service import get_fundamentals, search_symbol, search_exchange_variants, get_portfolio_stats


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    @action(detail=False, methods=["get"], url_path="portfolio-stats")
    def portfolio_stats(self, request):
        stocks = Stock.objects.all()
        if not stocks.exists():
            return Response({"error": "No stocks in portfolio"}, status=400)
        holdings = [
            {
                "ticker": s.ticker,
                "quantity": s.quantity,
                "average_price": s.average_price,
            }
            for s in stocks
        ]
        try:
            data = get_portfolio_stats(holdings)
        except Exception as e:
            return Response({"error": f"FMP API error: {str(e)}"}, status=502)
        return Response(data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        stocks = Stock.objects.all()
        total_value = sum(s.total_value for s in stocks)
        total_annual_dividend = sum(s.annual_dividend for s in stocks)
        avg_yield = (
            (total_annual_dividend / total_value * 100) if total_value else 0
        )
        return Response({
            "total_value": str(total_value),
            "total_annual_dividend": str(total_annual_dividend),
            "average_yield": f"{avg_yield:.4f}",
            "stock_count": stocks.count(),
        })


@api_view(["GET"])
def fundamentals(request, ticker):
    try:
        data = get_fundamentals(ticker)
    except Exception as e:
        return Response({"error": f"FMP API error: {str(e)}"}, status=502)

    if data is None:
        return Response({"error": f"No data found for ticker '{ticker.upper()}'"}, status=404)

    return Response(data)


@api_view(["GET"])
def symbol_search(request):
    query = request.query_params.get("query", "").strip()
    if not query:
        return Response({"error": "query parameter is required"}, status=400)
    try:
        data = search_symbol(query)
    except Exception as e:
        return Response({"error": f"FMP API error: {str(e)}"}, status=502)
    return Response(data)


@api_view(["GET"])
def exchange_variants(request):
    symbol = request.query_params.get("symbol", "").strip()
    if not symbol:
        return Response({"error": "symbol parameter is required"}, status=400)
    try:
        data = search_exchange_variants(symbol)
    except Exception as e:
        return Response({"error": f"FMP API error: {str(e)}"}, status=502)
    return Response(data)
