import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../pageLoader";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Authenticating..." />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
