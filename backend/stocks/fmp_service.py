from concurrent.futures import ThreadPoolExecutor
from datetime import date

import requests
from django.conf import settings

FMP_BASE = "https://financialmodelingprep.com/stable"


def _get(endpoint, params=None):
    url = f"{FMP_BASE}/{endpoint}"
    headers = {"apikey": settings.FMP_API_KEY}
    resp = requests.get(url, headers=headers, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


def search_symbol(query: str) -> list:
    return _get("search-symbol", {"query": query})


def search_exchange_variants(symbol: str) -> list:
    return _get("search-exchange-variants", {"symbol": symbol.upper()})


def get_fundamentals(ticker: str) -> dict | None:
    ticker = ticker.upper()

    profile_data = _get("profile", {"symbol": ticker})
    ratios_ttm = _get("ratios-ttm", {"symbol": ticker})
    key_metrics_ttm = _get("key-metrics-ttm", {"symbol": ticker})

    if not profile_data:
        return None

    profile = profile_data[0]
    ratios = ratios_ttm[0] if ratios_ttm else {}
    metrics = key_metrics_ttm[0] if key_metrics_ttm else {}

    return {
        "profile": {
            "ticker": profile.get("symbol"),
            "company_name": profile.get("companyName"),
            "sector": profile.get("sector"),
            "industry": profile.get("industry"),
            "description": profile.get("description"),
            "ceo": profile.get("ceo"),
            "website": profile.get("website"),
            "image": profile.get("image"),
            "country": profile.get("country"),
            "exchange": profile.get("exchange"),
            "market_cap": profile.get("marketCap"),
            "price": profile.get("price"),
            "beta": profile.get("beta"),
            "vol_avg": profile.get("averageVolume"),
            "last_dividend": profile.get("lastDividend"),
            "ipo_date": profile.get("ipoDate"),
            "full_time_employees": profile.get("fullTimeEmployees"),
        },
        "valuation": {
            "pe_ratio": ratios.get("priceToEarningsRatioTTM"),
            "peg_ratio": ratios.get("priceToEarningsGrowthRatioTTM"),
            "pb_ratio": ratios.get("priceToBookRatioTTM"),
            "ps_ratio": ratios.get("priceToSalesRatioTTM"),
            "price_to_fcf": ratios.get("priceToFreeCashFlowRatioTTM"),
            "ev_to_ebitda": ratios.get("enterpriseValueMultipleTTM"),
            "ev_to_revenue": metrics.get("evToSalesTTM"),
        },
        "profitability": {
            "gross_margin": ratios.get("grossProfitMarginTTM"),
            "operating_margin": ratios.get("operatingProfitMarginTTM"),
            "net_margin": ratios.get("netProfitMarginTTM"),
            "roe": metrics.get("returnOnEquityTTM"),
            "roa": metrics.get("returnOnAssetsTTM"),
            "roic": metrics.get("returnOnInvestedCapitalTTM"),
        },
        "financial_health": {
            "current_ratio": ratios.get("currentRatioTTM"),
            "quick_ratio": ratios.get("quickRatioTTM"),
            "debt_to_equity": ratios.get("debtToEquityRatioTTM"),
            "debt_to_assets": ratios.get("debtToAssetsRatioTTM"),
            "interest_coverage": ratios.get("interestCoverageRatioTTM"),
        },
        "dividends": {
            "dividend_yield": ratios.get("dividendYieldTTM"),
            "dividend_per_share": ratios.get("dividendPerShareTTM"),
            "payout_ratio": ratios.get("dividendPayoutRatioTTM"),
        },
        "per_share": {
            "eps": ratios.get("netIncomePerShareTTM"),
            "revenue_per_share": ratios.get("revenuePerShareTTM"),
            "book_value_per_share": ratios.get("bookValuePerShareTTM"),
            "fcf_per_share": ratios.get("freeCashFlowPerShareTTM"),
            "tangible_book_per_share": ratios.get("tangibleBookValuePerShareTTM"),
        },
    }


def _fetch_ticker_data(ticker):
    """Fetch profile and recent dividends for a single ticker."""
    profile_data = _get("profile", {"symbol": ticker})
    dividends = _get("dividends", {"symbol": ticker})
    profile = profile_data[0] if profile_data else {}
    return ticker, profile, dividends


def get_portfolio_stats(holdings: list[dict]) -> dict:
    """
    Compute portfolio-level stats from live FMP data.

    holdings: list of {"ticker": str, "quantity": int, "average_price": Decimal}
    Returns: portfolio beta, monthly dividends, total annual dividend.
    """
    tickers = [h["ticker"].upper() for h in holdings]
    qty_map = {h["ticker"].upper(): h["quantity"] for h in holdings}
    price_map = {h["ticker"].upper(): float(h["average_price"]) for h in holdings}

    with ThreadPoolExecutor(max_workers=10) as pool:
        results = list(pool.map(_fetch_ticker_data, tickers))

    total_portfolio_value = sum(
        qty_map[t] * price_map[t] for t in tickers
    )

    weighted_beta = 0.0
    beta_details = []
    for ticker, profile, _ in results:
        beta = profile.get("beta")
        position_value = qty_map[ticker] * price_map[ticker]
        weight = position_value / total_portfolio_value if total_portfolio_value else 0
        if beta is not None:
            weighted_beta += beta * weight
        beta_details.append({
            "ticker": ticker,
            "beta": beta,
            "weight": round(weight, 4),
        })

    current_year = date.today().year
    monthly = {m: 0.0 for m in range(1, 13)}
    stock_dividends = []

    for ticker, _, dividends in results:
        quantity = qty_map[ticker]
        recent = [
            d for d in dividends
            if d.get("paymentDate")
        ][:8]  # look at last 8 to find pattern

        annual_div = 0.0
        payment_months = []
        for d in recent[:4]:  # last 4 payments = ~1 year for quarterly
            div_amount = d.get("dividend", 0) or 0
            annual_div += div_amount * quantity
            pay_date = d.get("paymentDate", "")
            if pay_date:
                month = int(pay_date.split("-")[1])
                payment_months.append(month)
                monthly[month] += div_amount * quantity

        freq = recent[0].get("frequency", "Quarterly") if recent else "Unknown"
        stock_dividends.append({
            "ticker": ticker,
            "frequency": freq,
            "dividend_per_share": recent[0].get("dividend", 0) if recent else 0,
            "annual_dividend": round(annual_div, 2),
            "payment_months": sorted(set(payment_months)),
        })

    total_annual_dividend = sum(sd["annual_dividend"] for sd in stock_dividends)

    return {
        "portfolio_beta": round(weighted_beta, 4),
        "beta_details": beta_details,
        "total_annual_dividend": round(total_annual_dividend, 2),
        "monthly_dividends": {
            str(m): round(v, 2) for m, v in monthly.items()
        },
        "stock_dividends": stock_dividends,
    }
