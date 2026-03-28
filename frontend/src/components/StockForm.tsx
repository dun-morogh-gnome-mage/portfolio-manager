import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { Stock, StockInput } from "../services/api";

interface Props {
  open: boolean;
  stock: Stock | null;
  onClose: () => void;
  onSubmit: (data: StockInput) => void;
}

const empty: StockInput = {
  ticker: "",
  company_name: "",
  average_price: "",
  quantity: 0,
};

export default function StockForm({ open, stock, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<StockInput>(empty);

  useEffect(() => {
    if (stock) {
      setForm({
        ticker: stock.ticker,
        company_name: stock.company_name,
        average_price: stock.average_price,
        quantity: stock.quantity,
      });
    } else {
      setForm(empty);
    }
  }, [stock, open]);

  const handleChange = (field: keyof StockInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === "quantity" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{stock ? "Edit Stock" : "Add Stock"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Ticker"
            value={form.ticker}
            onChange={handleChange("ticker")}
            required
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
          <TextField
            label="Company Name (auto-filled if empty)"
            value={form.company_name}
            onChange={handleChange("company_name")}
          />
          <TextField
            label="Average Price"
            type="number"
            value={form.average_price}
            onChange={handleChange("average_price")}
            required
            inputProps={{ step: "0.01", min: "0" }}
          />
          <TextField
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange("quantity")}
            required
            inputProps={{ step: "1", min: "0" }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!form.ticker || !form.average_price}>
          {stock ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
