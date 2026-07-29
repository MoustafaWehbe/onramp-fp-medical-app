import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { AppLayout } from "../layouts/AppLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { Settings } from "../pages/dashboard/Settings";
import { LogView } from "../pages/log/LogView";
import { HealthProfile } from "../pages/health/HealthProfile";
import { Medications } from "../pages/health/Medications";
import { Providers } from "../pages/health/Providers";
import { DoctorVisitsPage  } from "../pages/health/Visits";
import { Analytics } from "../pages/analytics/Analytics";
import { AIReportsList } from "../pages/ai-reports/AIReportsList";
import { AIReportGenerate } from "../pages/ai-reports/AIReportGenerate";
import { AIReportView } from "../pages/ai-reports/AIReportView";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminMedications } from "../pages/admin/AdminMedications";
import { AdminConditions } from "../pages/admin/AdminConditions";
import { AdminSymptoms } from "../pages/admin/AdminSymptoms";
import { AdminClinics } from "../pages/admin/AdminClinics";
import { AdminDoctors } from "../pages/admin/AdminDoctors";
import { NotFound } from "../pages/NotFound";
import { useAuth } from "../hooks/useAuth";
import { homePathForRole } from "../lib/auth/roles";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { DailyEntriesProvider } from "@/providers/DailyEntriesProvider";
import { DoctorVisitsProvider } from "@/providers/DoctorVisitsProvider";

function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={["user"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="/log/view" element={<DailyEntriesProvider><LogView /></DailyEntriesProvider>} />
            
            

            <Route path="/health-profile" element={<HealthProfile />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/providers" element={<Providers />} />

            <Route path="/visits" element={<DoctorVisitsProvider><DoctorVisitsPage /></DoctorVisitsProvider>} />

            <Route path="/analytics" element={<Analytics />} />

            <Route path="/ai-reports" element={<AIReportsList />} />
            <Route path="/ai-reports/generate" element={<AIReportGenerate />} />
            <Route path="/ai-reports/:id" element={<AIReportView />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="medications" element={<AdminMedications />} />
            <Route path="conditions" element={<AdminConditions />} />
            <Route path="symptoms" element={<AdminSymptoms />} />
            <Route path="clinics" element={<AdminClinics />} />
            <Route path="doctors" element={<AdminDoctors />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
