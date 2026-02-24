import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transfer from "./pages/Transfer";
import Bills from "./pages/Bills";
import Settings from "./pages/Settings";
import Security from "./pages/Security";

// Layout
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

import "./App.css";

// Layout wrapper for all dashboard/protected pages
// Layout wrapper for all dashboard/protected pages
const DashboardLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column flex-lg-row" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="d-none d-lg-flex" style={{ width: 240, flexShrink: 0 }}>
        <Sidebar />
      </div>
      <div className="flex-lg-grow-1 d-flex flex-column w-100">
        <main className="flex-grow-1 p-3 p-md-4 bg-light overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ─── PUBLIC ROUTES ─── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ─── PROTECTED ROUTES (must be logged in) ─── */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/accounts"
              element={
                <DashboardLayout>
                  <Accounts />
                </DashboardLayout>
              }
            />
            <Route
              path="/transfer"
              element={
                <DashboardLayout>
                  <Transfer />
                </DashboardLayout>
              }
            />
            <Route
              path="/bills"
              element={
                <DashboardLayout>
                  <Bills />
                </DashboardLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              }
            />
            <Route
              path="/security"
              element={
                <DashboardLayout>
                  <Security />
                </DashboardLayout>
              }
            />
          </Route>

          {/* ─── FALLBACK ─── */}
          {/* Any unknown URL redirects to home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
