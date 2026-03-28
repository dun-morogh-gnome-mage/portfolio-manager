import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Container,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const tabs = [
  { label: "Portfolio", path: "/portfolio" },
  { label: "Options Simulation", path: "/options" },
  { label: "Price Prediction", path: "/prediction" },
  { label: "Fundamentals", path: "/fundamentals" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = tabs.findIndex((t) => location.pathname.startsWith(t.path));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <ShowChartIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Portfolio Manager
          </Typography>
        </Toolbar>
        <Tabs
          value={currentTab === -1 ? 0 : currentTab}
          onChange={(_, idx) => navigate(tabs[idx].path)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ bgcolor: "rgba(0,0,0,0.08)", pl: 2 }}
        >
          {tabs.map((t) => (
            <Tab key={t.path} label={t.label} />
          ))}
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
