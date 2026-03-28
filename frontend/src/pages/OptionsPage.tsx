import { Box, Paper, Typography } from "@mui/material";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";

export default function OptionsPage() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
      <Paper sx={{ p: 5, textAlign: "center", maxWidth: 500 }} elevation={2}>
        <CandlestickChartIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Options Simulation
        </Typography>
        <Typography color="text.secondary">
          Simulate covered calls, puts, and multi-leg option strategies.
          Visualize profit/loss diagrams and breakeven points.
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mt: 2, fontWeight: 500 }}>
          Coming Soon
        </Typography>
      </Paper>
    </Box>
  );
}
