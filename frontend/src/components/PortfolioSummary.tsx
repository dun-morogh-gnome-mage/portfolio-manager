import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { PortfolioSummary as SummaryType, PortfolioStats, Stock } from "../services/api";

interface Props {
  summary: SummaryType | null;
  stocks: Stock[];
  portfolioStats: PortfolioStats | null;
  statsLoading: boolean;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmt(val: string | number, decimals = 2) {
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function computeBeta(stocks: Stock[]) {
  const totalValue = stocks.reduce((sum, s) => sum + parseFloat(s.total_value), 0);
  if (totalValue === 0) return { portfolioBeta: 0, details: [] };

  let portfolioBeta = 0;
  const details = stocks.map((s) => {
    const value = parseFloat(s.total_value);
    const weight = value / totalValue;
    const beta = s.beta != null ? parseFloat(s.beta) : null;
    if (beta != null) portfolioBeta += beta * weight;
    return { ticker: s.ticker, beta, weight };
  });

  return { portfolioBeta, details };
}

export default function PortfolioSummary({ summary, stocks, portfolioStats, statsLoading }: Props) {
  if (!summary) return null;

  const { portfolioBeta, details } = computeBeta(stocks);

  const cards = [
    { label: "Total Value", value: `$${fmt(summary.total_value)}` },
    { label: "Annual Dividends", value: `$${fmt(summary.total_annual_dividend)}` },
    { label: "Average Yield", value: `${fmt(summary.average_yield)}%` },
    { label: "Holdings", value: summary.stock_count.toString() },
    { label: "Portfolio Beta", value: stocks.length > 0 ? fmt(portfolioBeta, 3) : "—" },
    {
      label: "Live Annual Div",
      value: statsLoading
        ? null
        : portfolioStats
          ? `$${fmt(portfolioStats.total_annual_dividend)}`
          : "—",
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2, mb: 3 }}>
        {cards.map((c) => (
          <Paper key={c.label} sx={{ p: 2.5, textAlign: "center" }} elevation={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {c.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {c.value === null ? <CircularProgress size={20} /> : c.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Monthly Dividends & Beta Breakdown */}
      {statsLoading && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading live data from FMP...
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {/* Monthly Dividend Chart */}
        {portfolioStats && !statsLoading && (
          <Paper sx={{ p: 2.5 }} elevation={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Monthly Dividends
            </Typography>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, height: 120 }}>
              {MONTH_NAMES.map((name, i) => {
                const val = portfolioStats.monthly_dividends[String(i + 1)] || 0;
                const max = Math.max(
                  ...Object.values(portfolioStats.monthly_dividends).map(Number),
                  1
                );
                const height = max > 0 ? (val / max) * 100 : 0;
                return (
                  <Box
                    key={name}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    {val > 0 && (
                      <Typography variant="caption" sx={{ fontSize: "0.65rem", mb: 0.5 }}>
                        ${fmt(val)}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        width: "70%",
                        height: `${height}%`,
                        minHeight: val > 0 ? 4 : 0,
                        bgcolor: val > 0 ? "primary.main" : "grey.200",
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 0.5, fontSize: "0.65rem" }}>
                      {name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        )}

        {/* Beta Breakdown - computed from stocks data */}
        {stocks.length > 0 && (
          <Paper sx={{ p: 2.5 }} elevation={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Beta Breakdown (Portfolio: {fmt(portfolioBeta, 3)})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Ticker</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Beta</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Weight</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Contribution</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.map((b) => (
                    <TableRow key={b.ticker}>
                      <TableCell sx={{ fontWeight: 600 }}>{b.ticker}</TableCell>
                      <TableCell align="right">{b.beta != null ? fmt(b.beta, 3) : "—"}</TableCell>
                      <TableCell align="right">{fmt(b.weight * 100, 1)}%</TableCell>
                      <TableCell align="right">
                        {b.beta != null ? fmt(b.beta * b.weight, 4) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
