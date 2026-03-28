import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export interface Stock {
  id: number;
  ticker: string;
  company_name: string;
  average_price: string;
  quantity: number;
  dividend_rate: string;
  beta: string | null;
  current_price: string | null;
  price_change_pct: string | null;
  annual_dividend: string;
  total_value: string;
  dividend_yield: string;
  created_at: string;
  updated_at: string;
}

export interface StockInput {
  ticker: string;
  company_name: string;
  average_price: string;
  quantity: number;
}

export interface PortfolioSummary {
  total_value: string;
  total_annual_dividend: string;
  average_yield: string;
  stock_count: number;
}

export interface FundamentalsProfile {
  ticker: string;
  company_name: string;
  sector: string;
  industry: string;
  description: string;
  ceo: string;
  website: string;
  image: string;
  country: string;
  exchange: string;
  market_cap: number;
  price: number;
  beta: number;
  vol_avg: number;
  last_dividend: number;
  ipo_date: string;
  full_time_employees: string;
}

export interface FundamentalsData {
  profile: FundamentalsProfile;
  valuation: Record<string, number | null>;
  profitability: Record<string, number | null>;
  financial_health: Record<string, number | null>;
  dividends: Record<string, number | null>;
  per_share: Record<string, number | null>;
}

export interface BetaDetail {
  ticker: string;
  beta: number | null;
  weight: number;
}

export interface StockDividendInfo {
  ticker: string;
  frequency: string;
  dividend_per_share: number;
  annual_dividend: number;
  payment_months: number[];
}

export interface PortfolioStats {
  portfolio_beta: number;
  beta_details: BetaDetail[];
  total_annual_dividend: number;
  monthly_dividends: Record<string, number>;
  stock_dividends: StockDividendInfo[];
}

export const stocksApi = {
  list: () => api.get<Stock[]>("/stocks/"),
  create: (data: StockInput) => api.post<Stock>("/stocks/", data),
  update: (id: number, data: StockInput) => api.put<Stock>(`/stocks/${id}/`, data),
  delete: (id: number) => api.delete(`/stocks/${id}/`),
  summary: () => api.get<PortfolioSummary>("/stocks/summary/"),
  portfolioStats: () => api.get<PortfolioStats>("/stocks/portfolio-stats/"),
};

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

export interface ExchangeVariant {
  symbol: string;
  exchange: string;
  exchangeFullName: string;
}

export const fundamentalsApi = {
  get: (ticker: string) => api.get<FundamentalsData>(`/fundamentals/${ticker}/`),
};

export const searchApi = {
  symbol: (query: string) =>
    api.get<SymbolSearchResult[]>("/search/symbol/", { params: { query } }),
  exchangeVariants: (symbol: string) =>
    api.get<ExchangeVariant[]>("/search/exchange-variants/", { params: { symbol } }),
};
