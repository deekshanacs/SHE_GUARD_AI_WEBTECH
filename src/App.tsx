import { Routes, Route } from "react-router-dom";
import LandingPage    from "./pages/LandingPage";
import UploadPage     from "./pages/UploadPage";
import ReportPage     from "./pages/ReportPage";
import DashboardPage  from "./pages/DashboardPage";
import EvidenceReport from "./pages/EvidenceReport";
import NotFound       from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/"               element={<LandingPage />} />
      <Route path="/upload"         element={<UploadPage />} />
      <Route path="/report"         element={<ReportPage />} />
      <Route path="/dashboard"      element={<DashboardPage />} />
      <Route path="/evidence-report" element={<EvidenceReport />} />
      <Route path="*"               element={<NotFound />} />
    </Routes>
  );
}
