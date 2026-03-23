import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PageLoader from "./components/pageLoader";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transfer from "./pages/Transfer";
import Bills from "./pages/Bills";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Deposit from "./pages/Deposit";

// Layout
import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

import "./App.css";

const InitialLoader = () => {
  const { loading } = useAuth();
  if (loading) {
    return <PageLoader text="Loading SFA Bank..." />;
  }
  return null;
};

const DashboardLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="d-flex flex-column flex-lg-row" style={{ minHeight: "100vh" }}>
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-lg-grow-1 d-flex flex-column w-100 main-content">
        <Navbar onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
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
      <InitialLoader />
      <Router>
        <Routes>

          {/* ─── PUBLIC ROUTES ─── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ─── PROTECTED ROUTES ─── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/accounts" element={<DashboardLayout><Accounts /></DashboardLayout>} />
            <Route path="/transfer" element={<DashboardLayout><Transfer /></DashboardLayout>} />
            <Route path="/bills" element={<DashboardLayout><Bills /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/security" element={<DashboardLayout><Security /></DashboardLayout>} />
            <Route path="/deposit" element={<DashboardLayout><Deposit /></DashboardLayout>} />
          </Route>

          {/* ─── FALLBACK ─── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;