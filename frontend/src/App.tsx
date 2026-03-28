import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import PortfolioPage from "./pages/PortfolioPage";
import OptionsPage from "./pages/OptionsPage";
import PredictionPage from "./pages/PredictionPage";
import FundamentalsPage from "./pages/FundamentalsPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/portfolio" replace />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/options" element={<OptionsPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/fundamentals" element={<FundamentalsPage />} />
      </Routes>
    </Layout>
  );
}
