import { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fundamentalsApi, FundamentalsData } from "../services/api";

const fmt = (v: number | null | undefined, decimals = 2, suffix = "") => {
  if (v === null || v === undefined) return "N/A";
  return `${Number(v).toFixed(decimals)}${suffix}`;
};

const fmtLarge = (v: number | null | undefined) => {
  if (v === null || v === undefined) return "N/A";
  const n = Number(v);
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};

const fmtPct = (v: number | null | undefined) => {
  if (v === null || v === undefined) return "N/A";
  return `${(Number(v) * 100).toFixed(2)}%`;
};

const LABELS: Record<string, Record<string, string>> = {
  valuation: {
    pe_ratio: "P/E Ratio (TTM)",
    forward_pe: "Forward P/E",
    peg_ratio: "PEG Ratio",
    pb_ratio: "P/B Ratio",
    ps_ratio: "P/S Ratio",
    price_to_fcf: "Price / FCF",
    ev_to_ebitda: "EV / EBITDA",
    ev_to_revenue: "EV / Revenue",
  },
  profitability: {
    gross_margin: "Gross Margin",
    operating_margin: "Operating Margin",
    net_margin: "Net Margin",
    roe: "Return on Equity",
    roa: "Return on Assets",
    roic: "ROIC",
  },
  financial_health: {
    current_ratio: "Current Ratio",
    quick_ratio: "Quick Ratio",
    debt_to_equity: "Debt / Equity",
    debt_to_assets: "Debt / Assets",
    interest_coverage: "Interest Coverage",
  },
  dividends: {
    dividend_yield: "Dividend Yield",
    dividend_per_share: "Dividend / Share",
    payout_ratio: "Payout Ratio",
  },
  per_share: {
    eps: "EPS (TTM)",
    revenue_per_share: "Revenue / Share",
    book_value_per_share: "Book Value / Share",
    fcf_per_share: "FCF / Share",
    tangible_book_per_share: "Tangible Book / Share",
  },
};

const SECTION_TITLES: Record<string, string> = {
  valuation: "Valuation Ratios",
  profitability: "Profitability",
  financial_health: "Financial Health",
  dividends: "Dividends",
  per_share: "Per Share Data",
};

const PCT_FIELDS = new Set([
  "gross_margin",
  "operating_margin",
  "net_margin",
  "roe",
  "roa",
  "roic",
  "dividend_yield",
  "payout_ratio",
]);

function RatioTable({ section, data }: { section: string; data: Record<string, number | null> }) {
  const labels = LABELS[section];
  return (
    <Paper variant="outlined" sx={{ height: "100%" }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, px: 2, pt: 1.5, pb: 1 }}>
        {SECTION_TITLES[section]}
      </Typography>
      <Divider />
      <TableContainer>
        <Table size="small">
          <TableBody>
            {Object.entries(labels).map(([key, label]) => (
              <TableRow key={key} hover>
                <TableCell sx={{ color: "text.secondary", width: "55%" }}>{label}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500, fontFamily: "monospace" }}>
                  {PCT_FIELDS.has(key) ? fmtPct(data[key]) : key === "dividend_per_share" ? `$${fmt(data[key])}` : fmt(data[key])}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default function FundamentalsPage() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<FundamentalsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fundamentalsApi.get(t);
      setData(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to fetch fundamentals";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const p = data?.profile;

  return (
    <Box>
      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Enter ticker symbol (e.g. AAPL, MSFT, GOOGL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 500 }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={loading || !ticker.trim()}
            sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" }, borderRadius: 1, px: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
          </IconButton>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {data && p && (
        <>
          {/* Company Profile Header */}
          <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              {p.image && (
                <Avatar
                  src={p.image}
                  alt={p.ticker}
                  variant="rounded"
                  sx={{ width: 64, height: 64, bgcolor: "grey.100" }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {p.company_name}
                  </Typography>
                  <Chip label={p.ticker} size="small" color="primary" />
                  <Chip label={p.exchange} size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                  {p.sector && <Chip label={p.sector} size="small" variant="outlined" color="secondary" />}
                  {p.industry && <Chip label={p.industry} size="small" variant="outlined" />}
                  {p.country && <Chip label={p.country} size="small" variant="outlined" />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 800 }}>
                  {p.description && p.description.length > 300
                    ? p.description.slice(0, 300) + "..."
                    : p.description}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Key stats row */}
            <Grid container spacing={2}>
              {[
                { label: "Price", value: `$${fmt(p.price)}` },
                { label: "Market Cap", value: fmtLarge(p.market_cap) },
                { label: "Beta", value: fmt(p.beta) },
                { label: "Avg Volume", value: p.vol_avg ? Number(p.vol_avg).toLocaleString() : "N/A" },
                { label: "CEO", value: p.ceo || "N/A" },
                { label: "Employees", value: p.full_time_employees ? Number(p.full_time_employees).toLocaleString() : "N/A" },
                { label: "IPO Date", value: p.ipo_date || "N/A" },
                {
                  label: "Website",
                  value: p.website ? (
                    <Tooltip title={p.website}>
                      <Typography
                        component="a"
                        href={p.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        color="primary"
                        sx={{ textDecoration: "none" }}
                      >
                        {new URL(p.website).hostname}
                      </Typography>
                    </Tooltip>
                  ) : (
                    "N/A"
                  ),
                },
              ].map((item) => (
                <Grid item xs={6} sm={3} key={item.label}>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {item.value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Ratio Tables */}
          <Grid container spacing={2}>
            {(["valuation", "profitability", "financial_health", "dividends", "per_share"] as const).map(
              (section) => (
                <Grid item xs={12} md={6} key={section}>
                  <RatioTable section={section} data={data[section]} />
                </Grid>
              )
            )}
          </Grid>
        </>
      )}

      {!data && !loading && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
          <Paper sx={{ p: 5, textAlign: "center", maxWidth: 500 }} elevation={2}>
            <SearchIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Company Fundamentals
            </Typography>
            <Typography color="text.secondary">
              Search for any ticker to see valuation ratios, profitability metrics,
              financial health indicators, and per-share data.
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
