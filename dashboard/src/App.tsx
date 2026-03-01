import { Routes, Route } from "react-router-dom";
import { DashboardShell } from "./components/dashboard-shell";
import OverviewPage from "./pages/overview";
import SessionsPage from "./pages/sessions";
import TimelinePage from "./pages/timeline";
import CostsPage from "./pages/costs";

export function App() {
  return (
    <DashboardShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/costs" element={<CostsPage />} />
      </Routes>
    </DashboardShell>
  );
}
