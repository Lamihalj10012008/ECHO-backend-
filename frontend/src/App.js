import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudentProvider } from "./context/StudentContext";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import StressManagement from "./components/StressManagement";
import TriageAgent from "./components/TriageAgent";
import LostFoundLayout from "./components/LostFoundLayout";
import LostFoundAI from "./components/LostFoundAI";
import ReportLostItem from "./components/ReportLostItem";
import ReportFoundItem from "./components/ReportFoundItem";
import MatchResults from "./components/MatchResults";
import Notifications from "./components/Notifications";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

function App() {
  return (
    <BrowserRouter>
      <StudentProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stress-management" element={<StressManagement />} />
          <Route path="/triage" element={<TriageAgent />} />
          <Route path="/lost-found" element={<LostFoundLayout />}>
            <Route index element={<LostFoundAI />} />
            <Route path="report-lost" element={<ReportLostItem />} />
            <Route path="report-found" element={<ReportFoundItem />} />
            <Route path="match-results" element={<MatchResults />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>
        </Routes>
      </StudentProvider>
    </BrowserRouter>
  );
}

export default App;
