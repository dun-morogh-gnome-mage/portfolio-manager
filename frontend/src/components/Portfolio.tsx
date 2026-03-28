import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Stock } from "../services/api";

interface Props {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (id: number) => void;
}

function fmt(val: string, decimals = 2) {
  return parseFloat(val).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function Portfolio({ stocks, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  if (stocks.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No stocks yet. Click "Add Stock" to get started.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ "& th": { fontWeight: 600, bgcolor: "grey.50" } }}>
            <TableCell>Ticker</TableCell>
            <TableCell>Company</TableCell>
            <TableCell align="right">Avg Price</TableCell>
            <TableCell align="right">Current</TableCell>
            <TableCell align="right">Change</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Total Value</TableCell>
            <TableCell align="right">Div Rate</TableCell>
            <TableCell align="right">Annual Div</TableCell>
            <TableCell align="right">Yield</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((s) => (
            <TableRow key={s.id} hover>
              <TableCell sx={{ fontWeight: 600 }}>{s.ticker}</TableCell>
              <TableCell>{s.company_name}</TableCell>
              <TableCell align="right">${fmt(s.average_price)}</TableCell>
              <TableCell align="right">
                {s.current_price != null ? `$${fmt(s.current_price)}` : "—"}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 600,
                  color: s.price_change_pct != null
                    ? parseFloat(s.price_change_pct) >= 0
                      ? "success.main"
                      : "error.main"
                    : "text.secondary",
                }}
              >
                {s.price_change_pct != null
                  ? `${parseFloat(s.price_change_pct) >= 0 ? "+" : ""}${fmt(s.price_change_pct)}%`
                  : "—"}
              </TableCell>
              <TableCell align="right">{s.quantity}</TableCell>
              <TableCell align="right">${fmt(s.total_value)}</TableCell>
              <TableCell align="right">${fmt(s.dividend_rate, 4)}</TableCell>
              <TableCell align="right">${fmt(s.annual_dividend)}</TableCell>
              <TableCell align="right">{fmt(s.dividend_yield)}%</TableCell>
              <TableCell align="center">
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(s)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={confirmDelete === s.id ? "Click again to confirm" : "Delete"}>
                  <IconButton
                    size="small"
                    color={confirmDelete === s.id ? "error" : "default"}
                    onClick={() => handleDelete(s.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
