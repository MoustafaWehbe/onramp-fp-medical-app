import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { Settings } from "../pages/dashboard/Settings";
import { LogNew } from "../pages/log/LogNew";
import { LogView } from "../pages/log/LogView";
import { LogEntry } from "../pages/log/LogEntry";
import { HealthProfile } from "../pages/health/HealthProfile";
import { Medications } from "../pages/health/Medications";
import { Providers } from "../pages/health/Providers";
import { Visits } from "../pages/health/Visits";
import { Analytics } from "../pages/analytics/Analytics";
import { AIReportsList } from "../pages/ai-reports/AIReportsList";
import { AIReportGenerate } from "../pages/ai-reports/AIReportGenerate";
import { AIReportView } from "../pages/ai-reports/AIReportView";
import { NotFound } from "../pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          {/* Daily Health Logger — specific paths before /log/:date */}
          <Route path="/log/new" element={<LogNew />} />
          <Route path="/log/entry/:id" element={<LogEntry />} />
          <Route path="/log/:date" element={<LogView />} />

          {/* Health Profile & Management */}
          <Route path="/health-profile" element={<HealthProfile />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/providers" element={<Providers />} />

          {/* History */}
          <Route path="/visits" element={<Visits />} />

          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />

          {/* AI Reports */}
          <Route path="/ai-reports" element={<AIReportsList />} />
          <Route path="/ai-reports/generate" element={<AIReportGenerate />} />
          <Route path="/ai-reports/:id" element={<AIReportView />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
