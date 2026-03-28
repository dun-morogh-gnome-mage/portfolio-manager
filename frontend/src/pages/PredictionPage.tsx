import { Box, Paper, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function PredictionPage() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
      <Paper sx={{ p: 5, textAlign: "center", maxWidth: 500 }} elevation={2}>
        <TrendingUpIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Stock Price Prediction
        </Typography>
        <Typography color="text.secondary">
          ML-powered price forecasting with historical trend analysis.
          View projected price targets and confidence intervals.
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mt: 2, fontWeight: 500 }}>
          Coming Soon
        </Typography>
      </Paper>
    </Box>
  );
}
