import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { RootState, AppDispatch } from "../store";
import {
  fetchStocks,
  fetchSummary,
  fetchPortfolioStats,
  addStock,
  updateStock,
  deleteStock,
} from "../store/stocksSlice";
import { Stock, StockInput } from "../services/api";
import Portfolio from "../components/Portfolio";
import PortfolioSummary from "../components/PortfolioSummary";
import StockForm from "../components/StockForm";

export default function PortfolioPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, summary, portfolioStats, statsLoading, loading, error } = useSelector(
    (state: RootState) => state.stocks
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editStock, setEditStock] = useState<Stock | null>(null);

  useEffect(() => {
    dispatch(fetchStocks());
    dispatch(fetchSummary());
    dispatch(fetchPortfolioStats());
  }, [dispatch]);

  const refreshData = () => {
    dispatch(fetchStocks());
    dispatch(fetchSummary());
    dispatch(fetchPortfolioStats());
  };

  const handleAdd = async (data: StockInput) => {
    await dispatch(addStock({ ...data, ticker: data.ticker.toUpperCase() }));
    refreshData();
  };

  const handleUpdate = async (data: StockInput) => {
    if (!editStock) return;
    await dispatch(
      updateStock({ id: editStock.id, data: { ...data, ticker: data.ticker.toUpperCase() } })
    );
    setEditStock(null);
    refreshData();
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteStock(id));
    refreshData();
  };

  const handleEdit = (stock: Stock) => {
    setEditStock(stock);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditStock(null);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          My Portfolio
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Add Stock
        </Button>
      </Box>

      <PortfolioSummary summary={summary} stocks={items} portfolioStats={portfolioStats} statsLoading={statsLoading} />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Portfolio stocks={items} onEdit={handleEdit} onDelete={handleDelete} />

      <StockForm
        open={formOpen}
        stock={editStock}
        onClose={handleCloseForm}
        onSubmit={editStock ? handleUpdate : handleAdd}
      />
    </Box>
  );
}
