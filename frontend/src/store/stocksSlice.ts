import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { stocksApi, Stock, StockInput, PortfolioSummary, PortfolioStats } from "../services/api";

interface StocksState {
  items: Stock[];
  summary: PortfolioSummary | null;
  portfolioStats: PortfolioStats | null;
  statsLoading: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: StocksState = {
  items: [],
  summary: null,
  portfolioStats: null,
  statsLoading: false,
  loading: false,
  error: null,
};

export const fetchStocks = createAsyncThunk("stocks/fetchAll", async () => {
  const res = await stocksApi.list();
  return res.data;
});

export const fetchSummary = createAsyncThunk("stocks/fetchSummary", async () => {
  const res = await stocksApi.summary();
  return res.data;
});

export const fetchPortfolioStats = createAsyncThunk("stocks/fetchPortfolioStats", async () => {
  const res = await stocksApi.portfolioStats();
  return res.data;
});

export const addStock = createAsyncThunk(
  "stocks/add",
  async (data: StockInput) => {
    const res = await stocksApi.create(data);
    return res.data;
  }
);

export const updateStock = createAsyncThunk(
  "stocks/update",
  async ({ id, data }: { id: number; data: StockInput }) => {
    const res = await stocksApi.update(id, data);
    return res.data;
  }
);

export const deleteStock = createAsyncThunk(
  "stocks/delete",
  async (id: number) => {
    await stocksApi.delete(id);
    return id;
  }
);

const stocksSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch stocks";
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(fetchPortfolioStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchPortfolioStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.portfolioStats = action.payload;
      })
      .addCase(fetchPortfolioStats.rejected, (state) => {
        state.statsLoading = false;
      })
      .addCase(addStock.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteStock.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      });
  },
});

export default stocksSlice.reducer;
